"""
APScheduler 설정 + job 등록
- 어떤 job을 언제 실행할지만 정의
- job 로직은 app/batch/ 에 있음
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from src.app.batch.starter_job import run_starter_job
from src.app.batch.game_job import run_game_result_job
from src.app.batch.hitter_job import run_batter_job
from src.common.config import SCHEDULE

log = logging.getLogger(__name__)


def create_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="Asia/Seoul")

    scheduler.add_job(
        run_starter_job,
        CronTrigger(**SCHEDULE["starters"]),
        id="starter_job",
        name="선발투수 수집",
        misfire_grace_time=300,
    )
    scheduler.add_job(
        run_game_result_job,
        CronTrigger(**SCHEDULE["results"]),
        id="game_result_job",
        name="경기 결과 업데이트",
        misfire_grace_time=600,
    )
    scheduler.add_job(
        run_batter_job,
        CronTrigger(**SCHEDULE["batters"]),
        id="batter_job",
        name="타자 기록 수집",
        misfire_grace_time=600,
    )

    return scheduler


def start_scheduler() -> BackgroundScheduler:
    scheduler = create_scheduler()
    scheduler.start()

    s = SCHEDULE
    log.info("APScheduler 시작")
    log.info(f"  {s['starters']['hour']:02d}:{s['starters']['minute']:02d} → 선발투수 수집")
    log.info(f"  {s['results']['hour']:02d}:{s['results']['minute']:02d}  → 경기 결과 업데이트")
    log.info(f"  {s['batters']['hour']:02d}:{s['batters']['minute']:02d}  → 타자 기록 수집")

    return scheduler
