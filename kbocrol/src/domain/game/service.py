"""
Game 도메인 서비스
- 크롤러 호출 + 변환 + 저장 조합
- 비즈니스 흐름만 담당, 쿼리/HTTP 직접 호출 없음
"""
import logging
import time
from calendar import monthrange

from src.infrastructure.crawler.naver_schedule_client import NaverScheduleClient
from src.infrastructure.db.game_repository import GameRepository
from src.domain.game.transformer import GameTransformer
from src.common.config import REQUEST_DELAY

log = logging.getLogger(__name__)


class GameService:

    def __init__(self):
        self._client      = NaverScheduleClient()
        self._repo        = GameRepository()
        self._transformer = GameTransformer()

    def sync_daily_games(self, target_date: str) -> int:
        """
        특정 날짜 경기 수집 + 저장
        - 선발투수 업데이트 (09:00)
        - 경기 결과 업데이트 (23:30)
        공통으로 사용
        """
        log.info(f"[GameService] 경기 수집: {target_date}")
        raw_games = self._client.get_daily_games(target_date)
        if not raw_games:
            log.info(f"[GameService] 경기 없음: {target_date}")
            return 0

        games = self._transformer.from_naver_games(raw_games)
        return self._repo.upsert_games(games)

    def sync_full_season(self, year: int) -> int:
        """
        시즌 전체 경기 수집 + 저장 (최초 1회)
        """
        log.info(f"[GameService] 시즌 전체 수집: {year}")
        season = self._client.get_season_info(year)
        months = [
            m["yearMonth"]
            for m in season.get("months", [])
            if m["gameCount"] > 0
        ]
        log.info(f"[GameService] 수집 대상 월: {months}")

        total = 0
        for ym in months:
            log.info(f"[GameService] [{ym}] 수집 중...")
            try:
                raw_games = self._client.get_monthly_games(ym)
                games = self._transformer.from_naver_games(raw_games)
                total += self._repo.upsert_games(games)
            except Exception as e:
                log.error(f"[GameService] [{ym}] 오류: {e}")
            time.sleep(REQUEST_DELAY)

        log.info(f"[GameService] 시즌 전체 완료: {total}경기")
        return total

    def get_result_games(self, target_date: str) -> list[dict]:
        """완료된 경기 목록 조회 (타자 기록 수집 시 사용)"""
        return self._repo.find_results_by_date(target_date)

    def get_scheduled_games(self, target_date: str) -> list[dict]:
        """예정 경기 목록 조회"""
        return self._repo.find_scheduled_by_date(target_date)
