## python 종속성 설치

```markdown
pip install -r kbocrol/src/common/requirements.txt
```

---
## python 구조화
```markdown
project-root/
├─ app/              # 배치 실행, 서버 실행
├─ domain/           # 타자/선수/경기/기록 업무 규칙
├─ infrastructure/   # 네이버 호출, DB, gRPC, 스케줄러
├─ interfaces/       # Java가 호출할 API/gRPC entry
├─ common/           # 설정, 로깅, 예외
├─ tests/            # 변환/서비스 테스트
└─ docs/             # 구조 문서
```

이 프로젝트는 앞으로 이렇게 생각해야 한다.

“크롤링 스크립트”가 아니라, 외부 데이터를 수집하고 가공해서 저장/전달하는 파이썬 수집 서비스”

그래서 폴더도 다음 원칙으로 나눠야 한다.

- 무엇을 하는가 → domain
- 어떻게 외부와 연결되는가 → infrastructure
- 어디서 요청이 들어오는가 → interfaces
- 어떻게 실행되는가 → app
- 공통 기술 요소는 무엇인가 → common

이렇게 가면 지금 DB 직접 insert 구조도 버틸 수 있고,
나중에 Java 요청 기반 구조나 gRPC 구조로 가도 흔들리지 않는다.
---
## 동작 방식
### 방식 A. Python이 서버 역할

Java → Python API 호출 → Python이 크롤링/가공 → 결과 반환

- interfaces/가 중요
- Python은 서버처럼 동작
- app/에는 서버 실행 entry가 필요
### 방식 B. Python은 작업기 역할

Java → 메시지/gRPC로 요청 → Python 작업 수행 → 결과 전달

- interfaces/ 또는 infrastructure/grpc/가 중요
- Python은 worker처럼 동작

둘 다 공통점이 있다.

__입구만 다르고, 내부 도메인 처리 로직은 같아야 한다.__

---

## 2차 구조
```markdown
src/
  common/
    config.py                    ← 설정값만
  
  infrastructure/
    crawler/
      http_client.py             ← GET 요청만
      naver_schedule_client.py   ← 엔드포인트별 호출
    db/
      connection.py              ← 연결만
      game_repository.py         ← kbo_games 쿼리
      hitter_repository.py       ← kbo_players, kbo_batter_logs 쿼리
  
  domain/
    game/
      transformer.py             ← raw → 내부 모델 변환
      service.py                 ← 게임 수집 흐름
    hitter/
      transformer.py             ← boxscore → 내부 모델 변환
      service.py                 ← 타자 기록 수집 흐름
  
  app/
    batch/
      game_job.py                ← starter/result/season job
      batter_job.py              ← batter/range job
  
  main.py                        ← 스케줄러 + gRPC 서버
```

1. crol/collector.py   ← 4개 job 함수 실제 구현
   (지금 있는 크롤러 코드 연결)

2. kbo.proto           ← Java ↔ Python 계약 정의
   (어떤 데이터를 주고받을지)

3. grpc_server.py      ← Java 요청 처리 서비스
   (proto 컴파일 후)

4. EC2 배포            ← systemd 서비스 등록
   (서버 재시작해도 자동 실행)
