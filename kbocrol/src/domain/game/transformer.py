"""
Game 도메인 변환기
- 네이버 API raw 응답 → 내부 도메인 모델 (dict)
- 필드명 통일, 타입 변환, 기본값 처리
- 비즈니스 규칙 적용 (예: statusCode 매핑)
"""

# 네이버 statusCode 숫자 → 내부 문자열
_STATUS_MAP = {
    "0": "BEFORE",
    "1": "LIVE",
    "2": "LIVE",
    "3": "LIVE",
    "4": "RESULT",
    "5": "CANCEL",
}


class GameTransformer:

    def from_naver_game(self, raw: dict) -> dict:
        """
        네이버 /schedule/games 응답의 단일 game 객체
        → kbo_games 테이블 삽입용 dict
        """
        game_id = raw["gameId"]

        # statusCode 변환 (숫자 문자열 → 내부 ENUM)
        raw_status = str(raw.get("statusCode", "0"))
        status_code = _STATUS_MAP.get(raw_status, "BEFORE")

        return {
            "game_id":               game_id,
            "season_year":           int(game_id[:4]),
            "category_id":           raw.get("categoryId", "kbo"),
            "category_name":         raw.get("categoryName", "KBO리그"),
            "round_code":            raw.get("roundCode", "kbo_r"),

            # 일정
            "game_date":             raw.get("gameDate"),
            "game_datetime":         raw.get("gameDateTime"),
            "time_tbd":              1 if raw.get("timeTbd") else 0,
            "stadium":               raw.get("stadium") or "",

            # 홈팀
            "home_team_code":        raw["homeTeamCode"],
            "home_team_name":        raw.get("homeTeamName") or "",
            "home_score":            raw.get("homeTeamScore") or 0,
            "home_starter":          raw.get("homeStarterName") or "",
            "home_current_pitcher":  raw.get("homeCurrentPitcherName") or "",
            "home_emblem_url":       raw.get("homeTeamEmblemUrl") or "",

            # 원정팀
            "away_team_code":        raw["awayTeamCode"],
            "away_team_name":        raw.get("awayTeamName") or "",
            "away_score":            raw.get("awayTeamScore") or 0,
            "away_starter":          raw.get("awayStarterName") or "",
            "away_current_pitcher":  raw.get("awayCurrentPitcherName") or "",
            "away_emblem_url":       raw.get("awayTeamEmblemUrl") or "",

            # 결과
            "winner":                raw.get("winner") or "DRAW",
            "win_pitcher":           raw.get("winPitcherName") or "",
            "lose_pitcher":          raw.get("losePitcherName") or "",

            # 상태
            "status_code":           status_code,
            "status_num":            int(raw_status) if raw_status.isdigit() else 0,
            "status_info":           raw.get("statusInfo") or "",
            "canceled":              1 if raw.get("cancel") else 0,
            "suspended":             1 if raw.get("suspended") else 0,

            # 기타
            "broadcast":             raw.get("broadChannel") or "",
            "has_video":             1 if raw.get("hasVideo") else 0,
            "reversed_home_away":    1 if raw.get("reversedHomeAway") else 0,
        }

    def from_naver_games(self, raw_list: list[dict]) -> list[dict]:
        """게임 목록 일괄 변환"""
        return [self.from_naver_game(g) for g in raw_list]
