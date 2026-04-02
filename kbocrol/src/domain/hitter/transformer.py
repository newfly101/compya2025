"""
Hitter 도메인 변환기
- 네이버 battersBoxscore raw → 내부 도메인 모델
- 선수 마스터 / 타자 기록 분리 변환
"""


class HitterTransformer:

    def from_naver_boxscore(self, record_data: dict, game_info: dict) -> tuple[list[dict], list[dict]]:
        """
        record_data: /record API 응답의 recordData
        game_info:   DB에서 조회한 game 정보 (game_id, game_date 등)

        반환: (players, batter_logs)
          players     → kbo_players 삽입용
          batter_logs → kbo_batter_logs 삽입용
        """
        game_id     = game_info["game_id"]
        game_date   = game_info["game_date"]
        stadium     = game_info["stadium"]
        season_year = int(game_id[:4])

        home_code = game_info["home_team_code"]
        home_name = game_info["home_team_name"]
        away_code = game_info["away_team_code"]
        away_name = game_info["away_team_name"]

        boxscore = record_data.get("battersBoxscore", {})

        players     = {}
        batter_logs = []

        sides = [
            ("home", home_code, home_name, away_code, away_name, 1),
            ("away", away_code, away_name, home_code, home_name, 0),
        ]

        for side, team_code, team_name, opp_code, opp_name, is_home in sides:
            for b in boxscore.get(side, []):
                player_code = b["playerCode"]
                player_name = b.get("name", "")

                # 선수 마스터 (중복 제거용 dict)
                players[player_code] = {
                    "player_code":   player_code,
                    "player_name":   player_name,
                    "team_code":     team_code,
                    "position_name": b.get("pos", ""),
                }

                # 타자 기록
                batter_logs.append({
                    "game_id":             game_id,
                    "player_code":         player_code,
                    "season_year":         season_year,
                    "player_name":         player_name,
                    "team_code":           team_code,
                    "team_name":           team_name,
                    "opposing_team_code":  opp_code,
                    "opposing_team_name":  opp_name,
                    "game_date":           game_date,
                    "stadium":             stadium,
                    "is_home":             is_home,
                    "bat_order":           b.get("batOrder", 0),
                    "position":            b.get("pos", ""),
                    "ab":                  b.get("ab", 0),
                    "hit":                 b.get("hit", 0),
                    "hr":                  b.get("hr", 0),
                    "rbi":                 b.get("rbi", 0),
                    "run":                 b.get("run", 0),
                    "bb":                  b.get("bb", 0),
                    "kk":                  b.get("kk", 0),
                    "sb":                  b.get("sb", 0),
                    "hra":                 float(b.get("hra", 0) or 0),
                    "substitute_in":       1 if b.get("substituteIn") else 0,
                })

        return list(players.values()), batter_logs
