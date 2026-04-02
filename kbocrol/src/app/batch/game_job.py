"""
23:30 — 경기 결과 업데이트 job
- 어제 경기 결과 수집 → kbo_games status/score/투수 UPDATE
"""
import logging
from datetime import date, timedelta
from src.domain.game.service import GameService

log = logging.getLogger(__name__)
_service = GameService()


def run_game_result_job():
    yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    log.info(f"[GameResultJob] 시작: {yesterday}")
    try:
        count = _service.sync_daily_games(yesterday)
        log.info(f"[GameResultJob] 완료: {count}경기")
    except Exception as e:
        log.error(f"[GameResultJob] 오류: {e}", exc_info=True)
