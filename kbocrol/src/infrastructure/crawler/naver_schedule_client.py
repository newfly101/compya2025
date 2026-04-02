"""
네이버 스포츠 스케줄 API 클라이언트
- 엔드포인트별 호출 메서드만 정의
- 응답을 raw dict/list 그대로 반환
- 변환/가공은 domain 레이어에서 처리
"""
import logging
from calendar import monthrange
from src.infrastructure.crawler.http_client import HttpClient
from src.common.config import GAMES_FETCH_SIZE

log = logging.getLogger(__name__)


class NaverScheduleClient:

    def __init__(self):
        self._http = HttpClient()

    # ── 시즌 정보
    def get_season_info(self, year: int) -> dict:
        """시즌 메타정보 + 월별 경기수"""
        return self._http.get(
            "/schedule/season",
            params={
                "categoryId": "kbo",
                "date":       f"{year}-03-01",
                "hasTeams":   "true",
                "tournament": "false",
            }
        )

    # ── 경기 목록
    def get_games(self, from_date: str, to_date: str) -> list[dict]:
        """날짜 범위 경기 목록 (raw)"""
        result = self._http.get(
            "/schedule/games",
            params={
                "fields":          "basic,schedule,baseball,manualRelayUrl",
                "upperCategoryId": "kbaseball",
                "categoryId":      "kbo",
                "fromDate":        from_date,
                "toDate":          to_date,
                "roundCodes":      "",
                "size":            GAMES_FETCH_SIZE,
            }
        )
        return result.get("games", [])

    def get_daily_games(self, target_date: str) -> list[dict]:
        """특정 날짜 경기 목록"""
        return self.get_games(target_date, target_date)

    def get_monthly_games(self, year_month: str) -> list[dict]:
        """특정 월 전체 경기"""
        year, month = map(int, year_month.split("-"))
        last_day = monthrange(year, month)[1]
        return self.get_games(
            f"{year_month}-01",
            f"{year_month}-{last_day:02d}"
        )

    # ── 경기 상세 기록
    def get_game_record(self, game_id: str) -> dict | None:
        """박스스코어 (타자/투수 기록)"""
        try:
            result = self._http.get(f"/schedule/games/{game_id}/record")
            return result.get("recordData")
        except Exception as e:
            log.warning(f"record 조회 실패 [{game_id}]: {e}")
            return None
