"""
kbo_players + kbo_batter_logs 테이블 접근
- INSERT / UPDATE / SELECT 쿼리만
- 비즈니스 로직 없음
"""
import logging
from src.infrastructure.db.connection import get_connection

log = logging.getLogger(__name__)

_SQL_UPSERT_PLAYER = """
    INSERT INTO kbo_players (player_code, player_name, team_code, position_name)
    VALUES (%(player_code)s, %(player_name)s, %(team_code)s, %(position_name)s)
    ON DUPLICATE KEY UPDATE
        player_name   = VALUES(player_name),
        team_code     = VALUES(team_code),
        position_name = VALUES(position_name),
        updated_at    = CURRENT_TIMESTAMP
"""

_SQL_UPSERT_BATTER_LOG = """
    INSERT INTO kbo_batter_logs (
        game_id, player_code, season_year,
        player_name, team_code, team_name,
        opposing_team_code, opposing_team_name,
        game_date, stadium, is_home,
        bat_order, position,
        ab, hit, hr, rbi, run, bb, kk, sb, hra,
        substitute_in
    ) VALUES (
        %(game_id)s, %(player_code)s, %(season_year)s,
        %(player_name)s, %(team_code)s, %(team_name)s,
        %(opposing_team_code)s, %(opposing_team_name)s,
        %(game_date)s, %(stadium)s, %(is_home)s,
        %(bat_order)s, %(position)s,
        %(ab)s, %(hit)s, %(hr)s, %(rbi)s, %(run)s,
        %(bb)s, %(kk)s, %(sb)s, %(hra)s,
        %(substitute_in)s
    )
    ON DUPLICATE KEY UPDATE
        ab            = VALUES(ab),
        hit           = VALUES(hit),
        hr            = VALUES(hr),
        rbi           = VALUES(rbi),
        run           = VALUES(run),
        bb            = VALUES(bb),
        kk            = VALUES(kk),
        sb            = VALUES(sb),
        hra           = VALUES(hra),
        bat_order     = VALUES(bat_order),
        position      = VALUES(position),
        substitute_in = VALUES(substitute_in),
        updated_at    = CURRENT_TIMESTAMP
"""


class HitterRepository:

    def upsert_players(self, players: list[dict]) -> int:
        """선수 마스터 UPSERT"""
        if not players:
            return 0
        conn = get_connection()
        try:
            with conn.cursor() as cur:
                cur.executemany(_SQL_UPSERT_PLAYER, players)
            conn.commit()
            log.info(f"kbo_players UPSERT: {len(players)}명")
            return len(players)
        except Exception as e:
            conn.rollback()
            log.error(f"kbo_players UPSERT 실패: {e}")
            raise
        finally:
            conn.close()

    def upsert_batter_logs(self, logs: list[dict]) -> int:
        """타자 경기 기록 UPSERT"""
        if not logs:
            return 0
        conn = get_connection()
        try:
            with conn.cursor() as cur:
                cur.executemany(_SQL_UPSERT_BATTER_LOG, logs)
            conn.commit()
            log.info(f"kbo_batter_logs UPSERT: {len(logs)}건")
            return len(logs)
        except Exception as e:
            conn.rollback()
            log.error(f"kbo_batter_logs UPSERT 실패: {e}")
            raise
        finally:
            conn.close()
