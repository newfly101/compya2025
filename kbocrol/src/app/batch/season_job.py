"""
수동 실행 전용 job
- 시즌 전체 초기 수집
- 과거 날짜 범위 타자 기록 일괄 수집

사용법:
  python -m app.batch.season_job --year 2026
  python -m app.batch.season_job --batters --from 2026-03-28 --to 2026-04-01
"""
import argparse
import logging
import sys
from datetime import date
from src.domain.game.service import GameService
from src.domain.hitter.service import HitterService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

_game_service   = GameService()
_hitter_service = HitterService()


def run_season_job(year: int):
    """시즌 전체 경기 일정 초기 수집"""
    log.info(f"[SeasonJob] 시작: {year}시즌")
    count = _game_service.sync_full_season(year)
    log.info(f"[SeasonJob] 완료: {count}경기")


def run_batter_range_job(from_date: str, to_date: str):
    """날짜 범위 타자 기록 일괄 수집"""
    log.info(f"[BatterRangeJob] 시작: {from_date} ~ {to_date}")
    count = _hitter_service.sync_batter_logs_by_date_range(
        from_date,
        to_date,
        _game_service.get_result_games,
    )
    log.info(f"[BatterRangeJob] 완료: {count}건")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KBO 수동 수집 job")
    parser.add_argument("--year",    type=int, default=date.today().year, help="시즌 연도")
    parser.add_argument("--batters", action="store_true",                 help="타자 기록 범위 수집 모드")
    parser.add_argument("--from",    dest="from_date",                    help="시작일 (2026-03-28)")
    parser.add_argument("--to",      dest="to_date",                      help="종료일 (2026-04-01)")
    args = parser.parse_args()

    if args.batters:
        if not args.from_date or not args.to_date:
            print("--from, --to 날짜를 입력해주세요")
            sys.exit(1)
        run_batter_range_job(args.from_date, args.to_date)
    else:
        run_season_job(args.year)
