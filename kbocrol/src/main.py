"""
KBO Python 서버 진입점
- 각 모듈을 조립하고 실행하는 역할만
- 로직 없음

실행: cd src && python main.py
"""
import logging
import signal
import sys

from src.common.logging_config import setup_logging
from src.app.scheduler import start_scheduler
from src.app.grpc_server import start_grpc_server


def setup_signal_handler(scheduler, grpc_server):
    log = logging.getLogger(__name__)

    def shutdown(signum, frame):
        log.info("종료 시그널 수신 → 서버 종료 중...")
        scheduler.shutdown(wait=False)
        grpc_server.stop(grace=5)
        log.info("서버 종료 완료")
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)


def main():
    setup_logging()

    log = logging.getLogger(__name__)
    log.info("=" * 50)
    log.info("  KBO Python 서버 시작")
    log.info("=" * 50)

    scheduler = start_scheduler()
    grpc_server = start_grpc_server()

    setup_signal_handler(scheduler, grpc_server)

    log.info("서버 실행 중... (종료: Ctrl+C)")
    grpc_server.wait_for_termination()


if __name__ == "__main__":
    main()
