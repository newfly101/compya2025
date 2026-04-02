"""
설정값 중앙 관리
- DB 접속 정보
- API 기본 설정
- 스케줄 시간
"""

# ─────────────────────────────────────────
# MariaDB 설정
# ─────────────────────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "port":     3306,
    "user":     "newfly101",
    "password": "hi159951!",
    "database": "compyafun",
    "charset":  "utf8mb4",
}

# ─────────────────────────────────────────
# 네이버 스포츠 API
# ─────────────────────────────────────────
NAVER_BASE_URL = "https://api-gw.sports.naver.com"

NAVER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Referer": "https://sports.naver.com/",
    "Accept":  "application/json",
}

# ─────────────────────────────────────────
# 크롤링 설정
# ─────────────────────────────────────────
REQUEST_DELAY      = 0.5   # API 요청 간격 (초)
GAMES_FETCH_SIZE   = 500   # 한 번에 가져올 경기 수

# ─────────────────────────────────────────
# gRPC 설정
# ─────────────────────────────────────────
GRPC_PORT = 50051

# ─────────────────────────────────────────
# 스케줄 시간 (KST)
# ─────────────────────────────────────────
SCHEDULE = {
    "starters": {"hour": 9,  "minute": 0},   # 선발투수 수집
    "lineup":   {"hour": 13, "minute": 30},  # 타순 라인업 수집 // 날짜 별로 상이
    "results":  {"hour": 23, "minute": 30},  # 경기 결과 업데이트
    "batters":  {"hour": 23, "minute": 45},  # 타자 기록 수집
}
