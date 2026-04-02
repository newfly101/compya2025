"""
로깅 설정
- 콘솔 + 파일 동시 출력
- 포맷 통일
"""
import logging
import sys


def setup_logging(log_file: str = "kbo_server.log"):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )
