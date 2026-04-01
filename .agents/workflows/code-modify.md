---
description: script.js 코드 수정 시 반드시 따라야 할 단계별 절차
---

# 🔴 코드 수정 워크플로우 (절대 준수)

> 이 워크플로우는 모든 코드 수정 작업에 예외 없이 적용됩니다.
> 단계를 건너뛰는 것은 절대 금지입니다.

---

## STEP 1. 관련 코드 전수 조사 (수정 전 필수)

수정 대상 기능과 관련된 **모든 함수**를 찾는다.

- `grep_search` 또는 `node -e`로 관련 키워드 전체 검색
- 예: choices 수정 → `data-field="choice"`, `choices.push`, `parseQuestionBlock`, `serializeBuilderState` 전부 검색
- **찾은 함수/위치 목록을 사용자에게 보고한다**
- ⚠️ 한 곳만 찾았다고 바로 수정 금지 — 반드시 연관 함수 전부 확인

## STEP 2. 현재 상태 보고 및 수정 계획 제시

아래 형식으로 사용자에게 보고:

```
현재 상태:
- [함수명] L[줄번호]: [현재 코드 요약]
- [함수명] L[줄번호]: [현재 코드 요약]

수정 계획:
- [함수명]: [변경 내용]
- [함수명]: [변경 내용]

진행할까요?
```

## STEP 3. 사용자 승인 대기

- 사용자가 "해" / "진행해" / "ㅇㅋ" 등 명시적 승인 후에만 수정 시작
- 승인 없이 수정 절대 금지

## STEP 4. 코드 수정

- STEP 1에서 찾은 **모든 관련 위치** 수정
- 한 곳만 수정하고 끝내지 말 것

## STEP 5. 문법 검증

```powershell
node --check script.js; Write-Host "ExitCode: $LASTEXITCODE"
```

- ExitCode: 0 아니면 즉시 수정, 커밋 금지

## STEP 6. 한글 인코딩 검증

```powershell
node -e "const c=require('fs').readFileSync('script.js','utf8'); console.log(c.includes('검색어') ? '✅ 정상' : '❌ 깨짐');"
```

## STEP 7. Git 커밋

```powershell
& 'C:\Program Files\Git\bin\git.exe' add [파일명]
& 'C:\Program Files\Git\bin\git.exe' commit -m "커밋 메시지 (한국어)"
```

---

## ⚠️ 자주 발생한 실수 (반드시 숙지)

| 실수 유형 | 발생 원인 | 방지책 |
|-----------|-----------|--------|
| choices null 저장 | `serializeBuilderState`만 수정, `parseQuestionBlock` 누락 | choices 관련 수정 시 두 함수 모두 확인 |
| 워드 복붙 주석 노출 | MS Word HTML 주석(`<!--...-->`) 미처리 | paste 처리 시 실제 사용 시나리오 전부 고려 |
| 확인 없이 "안전하다" 발언 | 코드만 보고 판단 | 실제 실행 경로 추적 후 판단 |
