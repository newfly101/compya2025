"""
HTTP 클라이언트
- 네이버 API 호출만 담당
- 응답 파싱 없음, dict 그대로 반환
- 도메인 로직 전혀 없음
"""
import logging
import requests
from src.common.config import NAVER_BASE_URL, NAVER_HEADERS

log = logging.getLogger(__name__)


class HttpClient:

    def get(self, path: str, params: dict = None) -> dict:
        """GET 요청 → result dict 반환"""
        url = f"{NAVER_BASE_URL}{path}"
        res = requests.get(url, params=params, headers=NAVER_HEADERS, timeout=10)
        res.raise_for_status()
        data = res.json()
        if not data.get("success"):
            raise ValueError(f"API 실패: {path} params={params}")
        return data["result"]
