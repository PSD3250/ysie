# DB 필드 매핑 표준 (DB Field Mapping Standard)

> 이 문서는 Google Sheets(통합DB, 학생DB) ↔ GAS(API script.gs) ↔ script.js 간 필드명 매핑을 정의합니다.
> AI 모델이 이 파일을 참조하면 혼동 없이 올바른 필드명을 사용할 수 있습니다.

---

## 🚨 핵심 주의사항 (절대 혼동 금지)

| 필드 | 시트 컬럼명 | script.js 사용 필드 | ❌ 과거 잘못된 사용 |
|------|------------|---------------------|---------------------|
| 문항 발문(질문 내용) | `질문 내용` | `q.title` | ~~`q.text`~~ |
| 문항 지문(개별) | `지문 내용` | `q.text` | ~~`q.passage1`~~ |
| 번들 발문 | `질문 내용` | `bundle.title` | — |
| 번들 지문 | `지문 내용` | `bundle.text` | — |
| 렌더링 시 번들 발문 | — | `q.commonTitle` (주입) | — |
| 렌더링 시 번들 지문 | — | `q.bundlePassageText` (주입) | — |

---

## 1. 통합DB — Questions 탭

**시트 열 순서 (1행):**
`문항번호 / 영역 / 세부영역 / 문항유형 / 난이도 / 배점 / 질문 내용 / 지문 내용 / 이미지URL / 보기(JSON) / 정답 / 모범답안 / 세트번호 / 라벨타입`

| 열 | 시트 컬럼명 | GAS 인덱스 | GAS 반환 필드명 | script.js 필드명 | 비고 |
|:--:|------------|:----------:|----------------|-----------------|------|
| A | 문항번호 | `r[0]` | `no` | `q.no` | 숫자 (행 식별자) |
| B | 영역 | `r[1]` | `section` | `q.section` | 한글→영문 자동변환 ※ |
| C | 세부영역 | `r[2]` | `subType` | `q.subType` | 자유 텍스트 |
| D | 문항유형 | `r[3]` | `type` | `q.type` | `객관형` / `주관형` / `작문형` |
| E | 난이도 | `r[4]` | `difficulty` | `q.difficulty` | `최상` / `상` / `중` / `하` / `기초` |
| F | 배점 | `r[5]` | `score` | `q.score` | 숫자 |
| G | **질문 내용** | `r[6]` | **`title`** | **`q.title`** | **발문 텍스트** ← 핵심 |
| H | **지문 내용** | `r[7]` | **`text`** | **`q.text`** | **개별 지문** ← 핵심 |
| I | 이미지URL | `r[8]` | `imgUrl` | `q.imgUrl` | Google Drive URL |
| J | 보기(JSON) | `r[9]` | `choices` | `q.choices` | JSON 배열 문자열 → 파싱됨 |
| K | 정답 | `r[10]` | `answer` | `q.answer` | 객관형: 번호(`1`~`5` 또는 `A`~`E`) |
| L | 모범답안 | `r[11]` | `modelAnswer` | `q.modelAnswer` | 주관형/작문형 참고 답안 |
| M | 세트번호 | `r[12]` | `setId` | `q.setId` | 번들 ID (`comp-XXXX`) / 단독형은 빈값 |
| N | 라벨타입 | `r[13]` | `labelType` | `q.labelType` | `number`(①②③) / `alpha`(ⓐⓑⓒ) |

**※ 영역 한글→영문 자동변환 (GAS 내 secCompat):**

| 시트 값 | JS 값 |
|--------|-------|
| 문법 | `Grammar` |
| 독해 | `Reading` |
| 어휘 | `Vocabulary` |
| 듣기 | `Listening` |
| 작문 | `Writing` |

---

## 2. 통합DB — Bundles 탭

**시트 열 순서 (1행):**
`세트번호 / 질문 내용 / 지문 내용 / 이미지URL / 연결문항번호 / 오디오URL / 오디오파일ID / 최대재생횟수`

| 열 | 시트 컬럼명 | GAS 인덱스 | GAS 반환 필드명 | script.js 필드명 | 비고 |
|:--:|------------|:----------:|----------------|-----------------|------|
| A | 세트번호 | `r[0]` | `id` | `bundle.id` | 예: `comp-17748181` |
| B | **질문 내용** | `r[1]` | **`title`** | **`bundle.title`** | **번들 공통 발문** ← 핵심 |
| C | **지문 내용** | `r[2]` | **`text`** | **`bundle.text`** | **번들 공통 지문** ← 핵심 |
| D | 이미지URL | `r[3]` | `imgUrl` | `bundle.imgUrl` | Google Drive URL |
| E | 연결문항번호 | `r[4]` | `questionIds` | `bundle.questionIds` | 쉼표 구분 문자열 예: `"1,2,3"` |
| F | 오디오URL | `r[5]` | `audioUrl` | `bundle.audioUrl` | Google Drive 스트리밍 URL |
| G | 오디오파일ID | `r[6]` | `audioFileId` | `bundle.audioFileId` | Drive 파일 ID |
| H | 최대재생횟수 | `r[7]` | `audioMaxPlay` | `bundle.audioMaxPlay` | 기본값 1 |

**렌더링 시 번들 하위 문항(`q`)에 주입되는 필드 (buildExamDisplayUnits에서):**

| 주입 필드명 | 출처 | 용도 |
|------------|------|------|
| `q.commonTitle` | `bundle.title` | `renderBundleLeft`에서 공통 발문 표시 |
| `q.bundlePassageText` | `bundle.text` | `renderBundleLeft`에서 공통 지문 표시 |
| `q.displayIndex` | 순서 계산 | 화면에 표시되는 문항 번호 |

---

## 3. 학생DB

**시트 열 순서 (1행):**
`응시일 / 학생ID / 학생명 / 학년 / 문항별상세(JSON) / Grammar_점수 / Grammar_만점 / Writing_점수 / Writing_만점 / Reading_점수 / Reading_만점 / Listening_점수 / Listening_만점 / Vocabulary_점수 / Vocabulary_만점 / 최상_점수 / 최상_만점 / 상_점수 / 상_만점 / 중_점수 / 중_만점 / 하_점수 / 하_만점 / 기초_점수 / 기초_만점 / 총점 / 만점 / 정답률(%) / 등록학급`

| 열 | 시트 컬럼명 | GAS 저장 변수 | script.js 제출 필드 | 비고 |
|:--:|------------|--------------|--------------------|----|
| A | 응시일 | `data.testDate` | `testDate` | ISO 날짜 문자열 |
| B | 학생ID | `data.studentId` | `studentId` | 학생 식별자 |
| C | 학생명 | `data.studentName` | `studentName` | |
| D | 학년 | `data.grade` | `grade` | |
| E | 문항별상세(JSON) | `data.questionScores` | `questionScores` | `JSON.stringify()` 된 배열 |
| F | Grammar_점수 | `data.grammarScore` | `grammarScore` | |
| G | Grammar_만점 | `data.grammarMax` | `grammarMax` | |
| H | Writing_점수 | `data.writingScore` | `writingScore` | |
| I | Writing_만점 | `data.writingMax` | `writingMax` | |
| J | Reading_점수 | `data.readingScore` | `readingScore` | |
| K | Reading_만점 | `data.readingMax` | `readingMax` | |
| L | Listening_점수 | `data.listeningScore` | `listeningScore` | |
| M | Listening_만점 | `data.listeningMax` | `listeningMax` | |
| N | Vocabulary_점수 | `data.vocabScore` | `vocabScore` | |
| O | Vocabulary_만점 | `data.vocabMax` | `vocabMax` | |
| P | 최상_점수 | `data.difficulty_highest` | `difficulty_highest` | |
| Q | 최상_만점 | `data.difficulty_highest_max` | `difficulty_highest_max` | |
| R | 상_점수 | `data.difficulty_high` | `difficulty_high` | |
| S | 상_만점 | `data.difficulty_high_max` | `difficulty_high_max` | |
| T | 중_점수 | `data.difficulty_mid` | `difficulty_mid` | |
| U | 중_만점 | `data.difficulty_mid_max` | `difficulty_mid_max` | |
| V | 하_점수 | `data.difficulty_low` | `difficulty_low` | |
| W | 하_만점 | `data.difficulty_low_max` | `difficulty_low_max` | |
| X | 기초_점수 | `data.difficulty_basic` | `difficulty_basic` | |
| Y | 기초_만점 | `data.difficulty_basic_max` | `difficulty_basic_max` | |
| Z | 총점 | `totalScore` | `totalScore` | |
| AA | 만점 | `maxScore` | `maxScore` | |
| AB | 정답률(%) | `percentage` | (GAS에서 계산) | `(총점/만점*100).toFixed(2)` |
| AC | 등록학급 | `data.studentClass` | `studentClass` | |

---

## 4. 렌더링 경로별 필드 사용 요약

### 단독형 문항 (`renderSingleQHtml`)

```
q.title      → <h4> 발문 텍스트
q.text       → 지문 박스 (있을 때만 표시)
q.imgUrl     → 이미지 (getMediaHtml)
q.choices    → 객관형 보기 배열 (getInputHtml)
q.displayIndex → 문항 번호 뱃지
```

### 묶음형 — 왼쪽 패널 (`renderBundleLeft`)

```
q.commonTitle        → 공통 발문 (번들 title에서 주입)
q.bundlePassageText  → 공통 지문 (번들 text에서 주입)
bundle.imgUrl        → 번들 이미지
bundle.audioFileId   → 오디오 버튼
```

### 묶음형 — 오른쪽 패널 (`renderSubQuestion` × n개)

```
q.title      → 하위 문항 발문
q.text       → 하위 문항 개별 지문 (있을 때만)
q.choices    → 객관형 보기
```

---

## 5. isLargeQuestion 판별 기준

```javascript
function isLargeQuestion(q) {
    if (q.imgUrl && q.imgUrl !== "" && q.imgUrl !== "undefined" && q.imgUrl !== "null") return true;
    const textLen = (q.title || "").length + (q.text || "").length;  // 발문 + 지문 합산
    if (textLen >= 1000) return true;
    return false;
}
```

→ `true`이면 해당 컬럼에 **1개 단독** 배치, `false`이면 **최대 2개** 배치

---

*최종 수정: 2026-04-01*
*관련 파일: `script.js`, `API script.gs`*
