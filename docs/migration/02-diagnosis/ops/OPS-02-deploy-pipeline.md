# OPS-02 배포 파이프라인 공백

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 0단계(현황 고정) · 6단계(FE 빌드 교체) — [`phase-0`](../../03-roadmap/phase-0-baseline.md), [`phase-6`](../../03-roadmap/phase-6-cutover.md)
> 관련: OPS-04

## 현상
FE 는 자동 배포, BE 는 수동 배포다. 어느 쪽도 **테스트를 돌리지 않고**, 배포 전에 "바뀐 것이 안전한가" 를 확인하는 단계가 없다.

## 근거
| 항목 | 위치 | 지금 |
|---|---|---|
| FE 트리거 | `.github/workflows/deploy-fe.yml:5-7` | `master` 에 `web/**` 변경 push 시 자동 |
| FE 단계 | 같은 파일 | `npm ci` → `build:prerender` → `verify-prerender` → S3 sync(`--delete`, 업로드 이미지 제외) → CloudFront 무효화 → `ads.txt` · 홈 문구 확인 |
| BE 트리거 | `.github/workflows/deploy-be.yml:3-16` | push 트리거 주석 처리 — **수동 실행만**(2026-09-13 부터) |
| BE 빌드 | 같은 파일 `:59-60` | `./gradlew clean bootJar` — **테스트 생략** |
| BE 배포 | 같은 파일 | S3 업로드 → SSM 으로 EC2 에서 jar 교체 → systemd 재시작 + nginx 재시작 → 10초 뒤 `is-active` |
| 롤백 | 같은 파일 | 명령을 출력만 함(자동 롤백 없음) |
| AWS 인증 | 두 워크플로 | 정적 액세스 키(Secrets). OIDC 아님 |
| PR 검사 | — | PR 에서 도는 워크플로 없음(빌드 · 린트 · 테스트) |

## 영향
- **이관**: FE 빌드 명령과 산출물 폴더가 바뀐다(`web/dist` → `frontend/out`). 워크플로 하나에 두 앱이 섞이는 기간(4~6단계)이 생긴다.
- BE 는 1단계에서 보안 · 계약 변경이 몰리는데, 테스트 없이 수동 배포하면 회귀를 운영에서 발견하게 된다.

## 해결 방향
| 단계 | 변경 |
|---|---|
| 0단계 | PR 검사 워크플로 추가: FE `lint` + `build:fast`, BE `./gradlew test`(DB 가 필요 없는 테스트만 먼저) |
| 1단계 | BE 배포 워크플로에 `test` 단계 추가(1단계 결함의 테스트가 여기서 돈다) |
| 3단계 | `frontend/**` 변경 시 도는 **미리보기 빌드**(S3 별도 prefix 또는 빌드만) — 운영 배포 없이 산출물 확인 |
| 6단계 | 운영 FE 워크플로를 `frontend/` 빌드로 교체, `web/` 워크플로 제거 |
| 선택 | AWS 인증을 GitHub OIDC 역할로 전환(정적 키 제거) |

## 완료 기준
- [ ] PR 을 열면 FE · BE 검사가 자동으로 돈다
- [ ] BE 배포 로그에 테스트 결과가 남는다
- [ ] 6단계 후 `deploy-fe.yml` 에 `web/` 경로 0건
