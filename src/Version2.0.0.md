# DB 네이밍 규칙과 전체 매핑표

> ⚠️ 2026-08-20: coach/skill(코치) 도메인 서버·DB·시드 완전 삭제됨. 아래 coach 관련 서술은 삭제 이전 기록.
- 규칙: {접두어}_{도메인}_{대상}
- 접두어역할예시

> [!NOTE]
> |접두어|역할|예시|
> |:---|:---:|:---|
> | site_ | 사이트 서비스 | site_users, site_posts | 
> | fun_ | 게임 데이터 | fun_player_card, fun_coach | 
> | kbo_ | ~~크롤링 원본~~ | 2026-08-20 kbo 6종 + kbocrol 크롤러 완전 삭제 확정 — 접두어 규칙 자체가 폐기됨 |

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
> ── KBO (크롤링 원본, 2026-08-20 완전 삭제 확정) ──────────
> - kbo_players / kbo_teams / kbo_seasons / kbo_games / kbo_batter_logs / kbo_team_code_mappings
> - 리네이밍 대상에서 제외 — 6종 전부 삭제. DROP 순서는 `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` 참고

> [!CAUTION]
> - players                   →  fun_players           (UUID 관리)
> - player_card_positions     →  fun_player_card_positions
> - player_card_back_number   →  fun_player_card_back_number
> - player_card_traits        →  fun_player_card_traits



