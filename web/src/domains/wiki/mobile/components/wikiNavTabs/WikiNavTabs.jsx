// WikiNavTabs.jsx — wiki 화면 공통 sticky 탭
// 상단: 대분류 (스킬 / 추천 조합 / 게임 정보)
// 하단: 중분류 (투수 / 타자)
// 각 wiki 화면 (Skill / Recommend / GameInfo) 최상단에 삽입해 페이지 간 빠른 전환.

import { Link, useParams, useLocation } from "react-router-dom";
import styles from "./WikiNavTabs.module.scss";

const CATEGORIES = [
  { key: "skill",     label: "스킬",      basePath: "/wiki/skill",     disabled: false },
  { key: "recommend", label: "추천 조합", basePath: "/wiki/recommend", disabled: false },
  { key: "game-info", label: "게임 정보", basePath: "/wiki/game-info", disabled: true  }, // data 미준비 — comingSoon
];

const TARGETS = [
  { key: "pitcher", label: "투수" },
  { key: "hitter",  label: "타자" },
];

function getCurrentCategory(pathname) {
  const m = pathname.match(/^\/wiki\/([^/]+)/);
  return m?.[1] ?? null;
}

export default function WikiNavTabs() {
  const { target } = useParams();
  const location = useLocation();
  const currentCategory = getCurrentCategory(location.pathname);
  const safeTarget = target === "hitter" ? "hitter" : "pitcher";

  return (
    <div className={styles.wrap}>
      {/* 대분류 */}
      <nav className={styles.categoryRow} aria-label="백과사전 카테고리">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.key;
          const cls = `${styles.categoryTab} ${isActive ? styles.categoryTabActive : ""} ${cat.disabled ? styles.categoryTabDisabled : ""}`;
          if (cat.disabled) {
            return (
              <span key={cat.key} className={cls} aria-disabled="true" title="준비중">
                {cat.label}
              </span>
            );
          }
          return (
            <Link
              key={cat.key}
              to={`${cat.basePath}/${safeTarget}`}
              className={cls}
            >
              {cat.label}
            </Link>
          );
        })}
      </nav>

      {/* 중분류 (투수/타자) */}
      <div className={styles.targetRow} role="tablist" aria-label="대상 선택">
        {TARGETS.map((t) => (
          <Link
            key={t.key}
            to={`/wiki/${currentCategory ?? "skill"}/${t.key}`}
            className={`${styles.targetTab} ${target === t.key ? styles.targetTabActive : ""}`}
            role="tab"
            aria-selected={target === t.key}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
