"""
09:00 — 선발투수 수집 job
- 오늘 경기 선발투수 수집 → kbo_games 업데이트
- Java가 이 데이터 보고 승부 예측 베팅 오픈
"""
import logging
from datetime import date
from src.domain.game.service import GameService

log = logging.getLogger(__name__)
_service = GameService()


def run_starter_job():
    today = date.today().strftime("%Y-%m-%d")
    log.info(f"[StarterJob] 시작: {today}")
    try:
        count = _service.sync_daily_games(today)
        log.info(f"[StarterJob] 완료: {count}경기")
    except Exception as e:
        log.error(f"[StarterJob] 오류: {e}", exc_info=True)
