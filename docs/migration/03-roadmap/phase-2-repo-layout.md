# 2단계 — 저장소 구조: `backend/` · `frontend/`

> 목표: 한 저장소 안에서 서버와 화면의 경계를 폴더로 드러낸다. **기능 변경 0**
> 닫는 결함: 없음 (구조 정리)
> 운영 영향: 워크플로 경로 변경 — 배포 한 번씩 수동 확인

---

## 1. 지금과 목표

```
지금                                목표 (6단계 완료 시점)
compya2025/                         compya2025/
├─ build.gradle, gradlew, gradle/   ├─ backend/
├─ src/main/java/...  (BE)          │  ├─ build.gradle, settings.gradle, gradlew, gradle/
├─ sql/                             │  ├─ src/main/java/...
├─ web/               (FE, Vite)    │  └─ sql/
├─ infra/cloudfront/                ├─ frontend/        (Next.js — 3단계에서 생성)
├─ docs/                            ├─ infra/cloudfront/
└─ .github/workflows/               ├─ docs/
                                    ├─ .github/workflows/
                                    └─ (web/ 은 6단계에서 삭제)
```

2~6단계 사이에는 `backend/` · `web/` · `frontend/` 세 폴더가 공존한다.

---

## 2. 왜 하나 — 그리고 안 할 수도 있다

| 하는 이유 | 치르는 값 |
|---|---|
| 루트에 BE 파일과 FE 폴더가 섞여 있어, 처음 보는 사람이 경계를 알기 어렵다 | `git log --follow` 없이는 파일 이력이 끊겨 보인다 |
| 워크플로 · 에디터 · AI 도구 설정을 폴더 단위로 나눌 수 있다(`paths: backend/**`) | 문서에 적힌 `src/main/java/...` 경로가 전부 `backend/src/main/java/...` 가 된다 |
| 이관 기간 동안 `web/` 과 `frontend/` 가 나란히 있어 비교가 쉽다 | IDE 프로젝트 루트 재설정 |

**대안**: BE 를 루트에 두고 `frontend/` 만 추가. 이동 비용이 부담되면 이 대안으로 가도 이관 계획은 그대로 성립한다. 결정은 이 문서 하단에 기록한다.

---

## 3. 할 일 (한 PR)

| # | 작업 |
|---|---|
| 2-1 | `git mv build.gradle settings.gradle gradlew gradlew.bat gradle src sql backend/` |
| 2-2 | `.github/workflows/deploy-be.yml`: `working-directory: backend`, 트리거 `paths: backend/**`, jar 경로 |
| 2-3 | `pr-check.yml`(0단계) 경로 갱신 |
| 2-4 | `.gitignore` 의 `build/` · `.gradle` 등 BE 패턴 확인 |
| 2-5 | `CLAUDE.md` §3 · §4 경로 표, `docs/convention/backend*.md`, `docs/global-guide/**` 의 경로 일괄 치환 |
| 2-6 | 이 폴더의 결함 md 경로는 **기준 커밋 기준으로 두고** README §5 에 "2단계 이후 `backend/` 접두" 한 줄 추가 |

---

## 4. 완료 기준

- [ ] `cd backend && ./gradlew test bootJar` 성공
- [ ] BE 수동 배포 1회 성공, 운영 API 정상
- [ ] FE 배포 워크플로가 영향받지 않음(`web/**` 트리거 유지)
- [ ] `grep -rn "src/main/java" CLAUDE.md docs/convention` 결과가 전부 `backend/` 접두

## 5. 결정 기록

- (진행 시 기입) 채택: 이동 / 루트 유지 — 이유:
