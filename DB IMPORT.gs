// ============================================================
//  학생 과거 데이터 임포트 스크립트 v3
//  - 같은 폴더의 [시험지명]_통합DB > Questions 시트에서
//    영역/난이도/배점을 자동으로 읽어 만점 계산
//  - 소스 시트에 만점 행 따로 입력 불필요
//  - 응시월 컬럼 반영 (응시일은 1일 고정)
// ============================================================
//
//  [소스 시트 형식 1 - 영역별]
//  이름 | 등록학급 | 응시년도 | 응시월 | 학년 | Listening | Vocabulary | Reading | Grammar | Writing
//  김철수 | 초5A  | 2026     | 02    | 초5  |    26     |           |   52    |         |   2
//
//  [소스 시트 형식 2 - 문항별]
//  이름 | 등록학급 | 응시년도 | 응시월 | 학년 | 1 | 2 | 3 | 4 | ...
//  김철수 | 초5A  | 2026     | 02    | 초5  | 2 | 1 | 3 | 2 | ...
//
//  ※ 학년: "초5", "중2" 형식으로 입력
//  ※ 소스 구글시트 파일명 = 시험지 저장 폴더명 (완전 일치)
//  ※ 응시월 없으면 01(1월)로 자동 처리
// ============================================================

// ─────────────────────────────────────────────
//  공통: 폴더 내 파일 찾기
// ─────────────────────────────────────────────
function _getFolder_(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (!folders.hasNext()) throw new Error("폴더를 찾을 수 없습니다: " + folderName);
  return folders.next();
}

function _findStudentDB_(folder) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().endsWith("_학생DB")) return SpreadsheetApp.open(f).getSheets()[0];
  }
  throw new Error("_학생DB 파일 없음. 앱에서 학생 1명 먼저 등록 후 실행하세요.");
}

// ─────────────────────────────────────────────
//  공통: 통합DB에서 문항 정보 로드
// ─────────────────────────────────────────────
function _loadQuestionDB_(folder) {
  var files = folder.getFiles();
  var dbFile = null;
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().endsWith("_통합DB")) { dbFile = f; break; }
  }
  if (!dbFile) throw new Error("_통합DB 파일을 찾을 수 없습니다.");

  var ss     = SpreadsheetApp.open(dbFile);
  var sheetQ = ss.getSheetByName("Questions");
  if (!sheetQ || sheetQ.getLastRow() < 2) throw new Error("Questions 시트가 비어있습니다.");

  var rows = sheetQ.getRange(2, 1, sheetQ.getLastRow() - 1, 6).getValues();
  var secCompat = { '문법':'Grammar','독해':'Reading','어휘':'Vocabulary','듣기':'Listening','작문':'Writing' };
  var byNo    = {};
  var secMax  = { Grammar:0, Writing:0, Reading:0, Listening:0, Vocabulary:0 };
  var diffMax = { 최상:0, 상:0, 중:0, 하:0, 기초:0 };
  var totalMax = 0;

  rows.forEach(function(r) {
    var no    = r[0];
    var sec   = secCompat[String(r[1])] || String(r[1]);
    var diff  = String(r[4]);
    var score = parseFloat(r[5]) || 0;
    byNo[no] = { section: sec, difficulty: diff, score: score };
    if (secMax[sec]   !== undefined) secMax[sec]   += score;
    if (diffMax[diff] !== undefined) diffMax[diff] += score;
    totalMax += score;
  });

  return { byNo: byNo, secMax: secMax, diffMax: diffMax, totalMax: totalMax };
}

// ─────────────────────────────────────────────
//  공통: 학생DB 헤더 보장
// ─────────────────────────────────────────────
function _ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;
  var headers = [
    "응시일","학생ID","학생명","학년",
    "문항별상세(JSON)",
    "Grammar_점수","Grammar_만점",
    "Writing_점수","Writing_만점",
    "Reading_점수","Reading_만점",
    "Listening_점수","Listening_만점",
    "Vocabulary_점수","Vocabulary_만점",
    "최상_점수","최상_만점","상_점수","상_만점",
    "중_점수","중_만점","하_점수","하_만점","기초_점수","기초_만점",
    "총점","만점","정답률(%)",
    "등록학급"
  ];
  sheet.appendRow(headers);
  sheet.getRange(1,1,1,headers.length).setFontWeight("bold").setBackground("#4A90E2").setFontColor("#FFFFFF");
}

function _genStudentId_(year) {
  var yy   = String(year).slice(2,4);
  var rand = Math.floor(Math.random() * 99999).toString().padStart(5,"0");
  return yy + "0101I" + rand;
}

// ─────────────────────────────────────────────
//  공통: 응시년도 + 응시월 → 날짜 문자열
//  예) year=2026, month="02" → "2026-02-01"
//  ※ 응시월 없거나 0이면 "01"로 처리
// ─────────────────────────────────────────────
function _makeDate_(year, month) {
  var mm = String(month || "01").trim().padStart(2, "0");
  if (mm === "00" || mm === "") mm = "01";
  return year + "-" + mm + "-01";
}

// ============================================================
//  임포트 1: 영역별 점수 형식
// ============================================================
function importBySection() {
  var ss         = SpreadsheetApp.getActiveSpreadsheet();
  var folderName = ss.getName();
  var folder     = _getFolder_(folderName);
  var dbSheet    = _findStudentDB_(folder);
  _ensureHeaders_(dbSheet);

  var qdb      = _loadQuestionDB_(folder);
  var sm       = qdb.secMax;
  var dm       = qdb.diffMax;
  var totalMax = qdb.totalMax;

  var rows = [];
  ss.getSheets().forEach(function(sheet) {
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    var h          = data[0].map(function(v){ return String(v).trim(); });
    var nameIdx    = h.indexOf("이름");
    if (nameIdx === -1) return;

    var classIdx   = h.indexOf("등록학급");
    var yearIdx    = h.indexOf("응시년도");
    var monthIdx   = h.indexOf("응시월");       // 응시월 컬럼
    var gradeIdx   = h.indexOf("학년");
    var grammarIdx = h.indexOf("Grammar");
    var writingIdx = h.indexOf("Writing");
    var readingIdx = h.indexOf("Reading");
    var listenIdx  = h.indexOf("Listening");
    var vocabIdx   = h.indexOf("Vocabulary");

    for (var i = 1; i < data.length; i++) {
      var row  = data[i];
      var name = String(row[nameIdx] || "").trim();
      if (!name) continue;

      var cls     = classIdx  >= 0 ? String(row[classIdx]).trim()  : "";
      var year    = yearIdx   >= 0 ? String(row[yearIdx]).trim()   : String(new Date().getFullYear());
      var month   = monthIdx  >= 0 ? String(row[monthIdx]).trim()  : "01";
      var grade   = gradeIdx  >= 0 ? String(row[gradeIdx]).trim()  : "";
      var grammar = grammarIdx >= 0 ? (parseFloat(row[grammarIdx]) || 0) : 0;
      var writing = writingIdx >= 0 ? (parseFloat(row[writingIdx]) || 0) : 0;
      var reading = readingIdx >= 0 ? (parseFloat(row[readingIdx]) || 0) : 0;
      var listen  = listenIdx  >= 0 ? (parseFloat(row[listenIdx])  || 0) : 0;
      var vocab   = vocabIdx   >= 0 ? (parseFloat(row[vocabIdx])   || 0) : 0;
      var total   = grammar + writing + reading + listen + vocab;
      var pct     = totalMax > 0 ? ((total / totalMax) * 100).toFixed(2) : 0;

      rows.push([
        _makeDate_(year, month),
        _genStudentId_(year), name, grade,
        "",
        grammar, sm.Grammar    || 0,
        writing, sm.Writing    || 0,
        reading, sm.Reading    || 0,
        listen,  sm.Listening  || 0,
        vocab,   sm.Vocabulary || 0,
        0, dm["최상"]||0, 0, dm["상"]||0,
        0, dm["중"]||0,  0, dm["하"]||0,
        0, dm["기초"]||0,
        total, totalMax, pct,
        cls
      ]);
    }
  });

  if (rows.length > 0) {
    dbSheet.getRange(dbSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  SpreadsheetApp.flush();
  Logger.log('✅ 영역별 임포트 완료: ' + rows.length + '명');
}

// ============================================================
//  임포트 2: 문항별 점수 형식
// ============================================================
function importByQuestion() {
  var ss         = SpreadsheetApp.getActiveSpreadsheet();
  var folderName = ss.getName();
  var folder     = _getFolder_(folderName);
  var dbSheet    = _findStudentDB_(folder);
  _ensureHeaders_(dbSheet);

  var qdb      = _loadQuestionDB_(folder);
  var byNo     = qdb.byNo;
  var totalMax = qdb.totalMax;

  var rows = [];
  ss.getSheets().forEach(function(sheet) {
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    var h        = data[0].map(function(v){ return String(v).trim(); });
    var nameIdx  = h.indexOf("이름");
    if (nameIdx === -1) return;

    var classIdx = h.indexOf("등록학급");
    var yearIdx  = h.indexOf("응시년도");
    var monthIdx = h.indexOf("응시월");       // 응시월 컬럼
    var gradeIdx = h.indexOf("학년");

    var qCols = [];
    h.forEach(function(v, idx) {
      var n = parseInt(v);
      if (!isNaN(n) && String(n) === v) qCols.push({ idx: idx, no: n });
    });

    for (var i = 1; i < data.length; i++) {
      var row  = data[i];
      var name = String(row[nameIdx] || "").trim();
      if (!name) continue;

      var cls   = classIdx >= 0 ? String(row[classIdx]).trim() : "";
      var year  = yearIdx  >= 0 ? String(row[yearIdx]).trim()  : String(new Date().getFullYear());
      var month = monthIdx >= 0 ? String(row[monthIdx]).trim() : "01";
      var grade = gradeIdx >= 0 ? String(row[gradeIdx]).trim() : "";

      var secScore  = { Grammar:0, Writing:0, Reading:0, Listening:0, Vocabulary:0 };
      var secMax    = { Grammar:0, Writing:0, Reading:0, Listening:0, Vocabulary:0 };
      var diffScore = { 최상:0, 상:0, 중:0, 하:0, 기초:0 };
      var diffMax   = { 최상:0, 상:0, 중:0, 하:0, 기초:0 };
      var qScores = [];
      var total   = 0;

      qCols.forEach(function(q) {
        var score = parseFloat(row[q.idx]) || 0;
        var info  = byNo[q.no];
        var qMax  = info ? info.score : 0;
        qScores.push({ no: q.no, score: score, max: qMax });
        total += score;
        if (info) {
          var sec  = info.section;
          var diff = info.difficulty;
          if (secScore[sec]   !== undefined) { secScore[sec]   += score; secMax[sec]   += qMax; }
          if (diffScore[diff] !== undefined) { diffScore[diff] += score; diffMax[diff] += qMax; }
        }
      });

      var pct = totalMax > 0 ? ((total / totalMax) * 100).toFixed(2) : 0;

      rows.push([
        _makeDate_(year, month),
        _genStudentId_(year), name, grade,
        JSON.stringify(qScores),
        secScore.Grammar,    secMax.Grammar,
        secScore.Writing,    secMax.Writing,
        secScore.Reading,    secMax.Reading,
        secScore.Listening,  secMax.Listening,
        secScore.Vocabulary, secMax.Vocabulary,
        diffScore["최상"], diffMax["최상"],
        diffScore["상"],   diffMax["상"],
        diffScore["중"],   diffMax["중"],
        diffScore["하"],   diffMax["하"],
        diffScore["기초"], diffMax["기초"],
        total, totalMax, pct,
        cls
      ]);
    }
  });

  if (rows.length > 0) {
    dbSheet.getRange(dbSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  SpreadsheetApp.flush();
  Logger.log('✅ 문항별 임포트 완료: ' + rows.length + '명');
}
