"""
Hitter 도메인 서비스
- 타자 기록 수집 흐름 담당
- 쿼리/HTTP 직접 호출 없음
"""
import logging
import time
from datetime import date, timedelta

from src.infrastructure.crawler.naver_schedule_client import NaverScheduleClient
from src.infrastructure.db.hitter_repository import HitterRepository
from src.domain.hitter.transformer import HitterTransformer
from src.common.config import REQUEST_DELAY

log = logging.getLogger(__name__)


class HitterService:

    def __init__(self):
        self._client      = NaverScheduleClient()
        self._repo        = HitterRepository()
        self._transformer = HitterTransformer()

    def sync_batter_logs(self, games: list[dict]) -> int:
        """
        완료된 경기 목록 기준으로 타자 기록 수집 + 저장
        games: GameService.get_result_games() 결과
        """
        if not games:
            log.info("[HitterService] 수집할 경기 없음")
            return 0

        log.info(f"[HitterService] 타자 기록 수집: {len(games)}경기")
        total = 0

        for game in games:
            game_id = game["game_id"]
            log.info(f"  [{game_id}] {game['away_team_name']} vs {game['home_team_name']}")

            record_data = self._client.get_game_record(game_id)
            if not record_data:
                log.warning(f"  [{game_id}] record 없음, 스킵")
                continue

            players, batter_logs = self._transformer.from_naver_boxscore(record_data, game)

            self._repo.upsert_players(players)
            self._repo.upsert_batter_logs(batter_logs)
            total += len(batter_logs)

            log.info(f"  [{game_id}] 타자 {len(batter_logs)}명 저장 완료")
            time.sleep(REQUEST_DELAY)

        log.info(f"[HitterService] 완료: 타자기록 {total}건")
        return total

    def sync_batter_logs_by_date_range(self, from_date: str, to_date: str, get_result_games_fn) -> int:
        """
        날짜 범위 타자 기록 일괄 수집 (과거 데이터 밀어넣기)
        get_result_games_fn: GameService.get_result_games 함수 주입
        """
        log.info(f"[HitterService] 범위 수집: {from_date} ~ {to_date}")
        current = date.fromisoformat(from_date)
        end     = date.fromisoformat(to_date)
        total   = 0

        while current <= end:
            date_str = current.strftime("%Y-%m-%d")
            try:
                games = get_result_games_fn(date_str)
                total += self.sync_batter_logs(games)
            except Exception as e:
                log.error(f"[HitterService] {date_str} 오류: {e}")
            current += timedelta(days=1)

        log.info(f"[HitterService] 범위 수집 완료: {total}건")
        return total
