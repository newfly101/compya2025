"""
MariaDB 연결 관리
- 연결 생성만 담당
- 쿼리 없음
"""
import pymysql
import pymysql.cursors
from src.common.config import DB_CONFIG


def get_connection() -> pymysql.Connection:
    return pymysql.connect(**DB_CONFIG)
