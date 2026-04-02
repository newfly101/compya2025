"""
kbo_games 테이블 접근
- INSERT / UPDATE / SELECT 쿼리만
- 비즈니스 로직 없음
- 입력: 이미 가공된 dict (domain에서 변환 완료된 것)
"""
import logging
import pymysql
from src.infrastructure.db.connection import get_connection

log = logging.getLogger(__name__)

_SQL_UPSERT = """
    INSERT INTO kbo_games (
        game_id, season_year, category_id, category_name, round_code,
        game_date, game_datetime, time_tbd, stadium,
        home_team_code, home_team_name, home_score,
        home_starter, home_current_pitcher, home_emblem_url,
        away_team_code, away_team_name, away_score,
        away_starter, away_current_pitcher, away_emblem_url,
        winner, win_pitcher, lose_pitcher,
        status_code, status_num, status_info,
        canceled, suspended, broadcast, has_video, reversed_home_away
    ) VALUES (
        %(game_id)s, %(season_year)s, %(category_id)s, %(category_name)s, %(round_code)s,
        %(game_date)s, %(game_datetime)s, %(time_tbd)s, %(stadium)s,
        %(home_team_code)s, %(home_team_name)s, %(home_score)s,
        %(home_starter)s, %(home_current_pitcher)s, %(home_emblem_url)s,
        %(away_team_code)s, %(away_team_name)s, %(away_score)s,
        %(away_starter)s, %(away_current_pitcher)s, %(away_emblem_url)s,
        %(winner)s, %(win_pitcher)s, %(lose_pitcher)s,
        %(status_code)s, %(status_num)s, %(status_info)s,
        %(canceled)s, %(suspended)s, %(broadcast)s, %(has_video)s, %(reversed_home_away)s
    )
    ON DUPLICATE KEY UPDATE
        status_code          = VALUES(status_code),
        status_info          = VALUES(status_info),
        home_score           = VALUES(home_score),
        away_score           = VALUES(away_score),
        home_starter         = VALUES(home_starter),
        away_starter         = VALUES(away_starter),
        home_current_pitcher = VALUES(home_current_pitcher),
        away_current_pitcher = VALUES(away_current_pitcher),
        winner               = VALUES(winner),
        win_pitcher          = VALUES(win_pitcher),
        lose_pitcher         = VALUES(lose_pitcher),
        canceled             = VALUES(canceled),
        suspended            = VALUES(suspended),
        has_video            = VALUES(has_video),
        broadcast            = VALUES(broadcast),
        updated_at           = CURRENT_TIMESTAMP
"""


class GameRepository:

    def upsert_games(self, games: list[dict]) -> int:
        """경기 목록 UPSERT"""
        if not games:
            return 0
        conn = get_connection()
        try:
            with conn.cursor() as cur:
                cur.executemany(_SQL_UPSERT, games)
            conn.commit()
            log.info(f"kbo_games UPSERT: {len(games)}건")
            return len(games)
        except Exception as e:
            conn.rollback()
            log.error(f"kbo_games UPSERT 실패: {e}")
            raise
        finally:
            conn.close()

    def find_results_by_date(self, target_date: str) -> list[dict]:
        """특정 날짜 완료된 경기 목록"""
        conn = get_connection()
        try:
            with conn.cursor(pymysql.cursors.DictCursor) as cur:
                cur.execute("""
                    SELECT game_id, game_date, stadium,
                           home_team_code, home_team_name,
                           away_team_code, away_team_name
                    FROM kbo_games
                    WHERE game_date = %s
                      AND status_code = 'RESULT'
                """, (target_date,))
                return cur.fetchall()
        finally:
            conn.close()

    def find_scheduled_by_date(self, target_date: str) -> list[dict]:
        """특정 날짜 예정 경기 목록"""
        conn = get_connection()
        try:
            with conn.cursor(pymysql.cursors.DictCursor) as cur:
                cur.execute("""
                    SELECT game_id, game_date, stadium,
                           home_team_code, home_team_name,
                           away_team_code, away_team_name,
                           home_starter, away_starter
                    FROM kbo_games
                    WHERE game_date = %s
                      AND status_code = 'BEFORE'
                    ORDER BY game_datetime
                """, (target_date,))
                return cur.fetchall()
        finally:
            conn.close()
