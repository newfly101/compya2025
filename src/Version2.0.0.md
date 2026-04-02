# DB 네이밍 규칙과 전체 매핑표
- 규칙: {접두어}_{도메인}_{대상}
- 접두어역할예시

> [!NOTE]
> |접두어|역할|예시|
> |:---|:---:|:---|
> | site_ | 사이트 서비스 | site_users, site_posts | 
> | fun_ | 게임 데이터 | fun_player_card, fun_coach | 
> | kbo_ | 크롤링 원본 | kbo_players, kbo_games |

---

# DB 네이밍 변경점

> [!IMPORTANT]
> ── SITE (사이트 서비스) ──────────────────────────────
> - boards                    →  site_boards
> - notices                   →  site_notices
> - posts                     →  site_posts
> - posts_tags                →  site_posts_tags
> - tags                      →  site_tags
> - users                     →  site_users
> - user_roles                →  site_user_roles
> - coupons                   →  site_coupons
> - events                    →  site_events
> - quiz_answers              →  site_quiz_answers

> [!IMPORTANT]
> ── FUN (게임 데이터) ─────────────────────────────────
> - player_card               →  fun_player_card
> - player_card_hitter_attributes  →  fun_player_card_hitter_attr
> - player_card_pitcher_attributes →  fun_player_card_pitcher_attr
> - player_legend             →  fun_player_legend
> - player_legend_hitter_career    →  fun_player_legend_hitter_career
> - player_legend_pitcher_career   →  fun_player_legend_pitcher_career
> - player_skills             →  fun_player_skills
> - coach                     →  fun_coach
> - coach_skill_buff          →  fun_coach_skill_buff
> - coach_skill_condition     →  fun_coach_skill_condition
> - skill_pitcher_grade_stat  →  fun_skill_pitcher_grade_stat
> - skill_score_config        →  fun_skill_score_config
> - legend_pitcher_pitch_slot →  fun_legend_pitcher_pitch_slot
> - teams                     →  fun_teams

> [!IMPORTANT]
> ── KBO (크롤링 원본, 기존 유지) ──────────────────────
> - kbo_players               →  kbo_players        (변경 없음)
> - kbo_teams                 →  kbo_teams          (변경 없음)
> - kbo_seasons               →  kbo_seasons        (변경 없음)
> - kbo_games                 →  kbo_games          (변경 없음)
> - kbo_batter_logs           →  kbo_batter_logs    (변경 없음)
> - kbo_team_code_mappings    →  kbo_team_code_mappings (변경 없음)

> [!CAUTION]
> - players                   →  fun_players           (UUID 관리)
> - player_card_positions     →  fun_player_card_positions
> - player_card_back_number   →  fun_player_card_back_number
> - player_card_traits        →  fun_player_card_traits



