"""
23:45 — 타자 기록 수집 job
- 어제 완료된 경기 기준으로 타자 기록 수집
- kbo_players + kbo_batter_logs UPSERT
"""
import logging
from datetime import date, timedelta
from src.domain.game.service import GameService
from src.domain.hitter.service import HitterService

log = logging.getLogger(__name__)
_game_service   = GameService()
_hitter_service = HitterService()


def run_batter_job():
    yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    log.info(f"[BatterJob] 시작: {yesterday}")
    try:
        games = _game_service.get_result_games(yesterday)
        count = _hitter_service.sync_batter_logs(games)
        log.info(f"[BatterJob] 완료: {count}건")
    except Exception as e:
        log.error(f"[BatterJob] 오류: {e}", exc_info=True)
