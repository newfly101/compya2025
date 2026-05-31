// WikiRecommendScreen.jsx — ENC-3 (PITCHER) / ENC-4 (HITTER) 추천 조합
// /wiki/recommend/:target — mock 정적 import
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useSkills } from "@/domains/wiki/hooks/useSkills.js";
import WikiNavTabs from "@/domains/wiki/mobile/components/wikiNavTabs/WikiNavTabs.jsx";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import styles from "./WikiRecommendScreen.module.scss";

const PITCHER_POSITIONS = ["선발", "중계", "마무리"];
const GRADE_ORDER = ["졸업", "준졸업", "타협", "변경"];

const TARGET_TITLES = {
  pitcher: "투수 추천 조합",
  hitter: "타자 추천 조합",
};

// 점수 breakdown 모달 (inline 컴포넌트 — 재사용 없음)
function BreakdownModal({ combo, onClose }) {
  if (!combo) return null;
  const modalRoot = document.getElementById("modal") ?? document.body;

  return createPortal(
    <div className={styles.overlayModal} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.breakdownModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.breakdownHeader}>
          <h3 className={styles.breakdownTitle}>점수 구성</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <div className={styles.breakdownSkills}>
          {combo.skills.map((name, i) => (
            <div key={i} className={styles.breakdownRow}>
              <span className={styles.breakdownSkill}>{name}</span>
            </div>
          ))}
        </div>
        <div className={styles.breakdownTotal}>
          <span>총점</span>
          <span className={styles.breakdownTotalNum}>{combo.totalPoint}점</span>
        </div>
        <p className={styles.breakdownNote}>※ 세부 점수 공식은 게임 업데이트에 따라 변경될 수 있습니다.</p>
      </div>
    </div>,
    modalRoot
  );
}

export default function WikiRecommendScreen() {
  const { target } = useParams();
  const title = TARGET_TITLES[target] ?? "추천 조합";
  useDomainTopBar(title);

  const isPitcher = target === "pitcher";
  const mockData = isPitcher ? PITCHER_RECOMMEND : HITTER_RECOMMEND;

  // 스킬 name → grade 매핑 (chip 색상용)
  const { data: skillData } = useSkills(target);
  const nameToGrade = useMemo(() => {
    const map = {};
    if (!skillData) return map;
    ["legend", "platinum", "hero", "normal"].forEach((g) => {
      (skillData[g] ?? []).forEach((s) => {
        if (s.name) map[s.name] = g; // lowercase grade key
      });
    });
    return map;
  }, [skillData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activePosition, setActivePosition] = useState(isPitcher ? "선발" : "타자");
  const [breakdownCombo, setBreakdownCombo] = useState(null);

  // 포지션 필터 + 검색
  const filtered = useMemo(() => {
    let list = mockData.filter((c) => c.position === activePosition);
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      list = list.filter((c) =>
        c.skills.some((s) => s.includes(q))
      );
    }
    // totalPoint 내림차순, 동점 시 스킬명 가나다
    return [...list].sort((a, b) => {
      if (b.totalPoint !== a.totalPoint) return b.totalPoint - a.totalPoint;
      return a.skills.join("").localeCompare(b.skills.join(""), "ko");
    });
  }, [mockData, activePosition, searchQuery]);

  // grade 별 그루핑
  const grouped = useMemo(() => {
    const map = {};
    GRADE_ORDER.forEach((grade) => {
      const items = filtered.filter((c) => c.grade === grade);
      if (items.length > 0) map[grade] = items;
    });
    return map;
  }, [filtered]);

  const hasResult = Object.keys(grouped).length > 0;

  return (
    <main className={styles.page}>
      <WikiNavTabs />
      {/* 포지션 탭 — 투수만 표시 */}
      {isPitcher && (
        <div className={styles.tabRow}>
          {PITCHER_POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              className={`${styles.tab} ${activePosition === pos ? styles.tabActive : ""}`}
              onClick={() => setActivePosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      )}

      {/* 검색 */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="포함 스킬명 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="포함 스킬명 검색"
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => setSearchQuery("")}
            aria-label="검색 초기화"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── 상태 분기: empty ─────────────────────────── */}
      {!hasResult ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {searchQuery ? "조건에 맞는 조합이 없습니다." : "추천 조합 데이터가 없습니다."}
          </p>
          {(searchQuery) && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => { setSearchQuery(""); }}
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        // ── 상태 분기: normal ─────────────────────────────────
        GRADE_ORDER.filter((g) => grouped[g]).map((grade) => (
          <section key={grade} className={styles.gradeSection}>
            <h2 className={styles.gradeTitle}>{grade}</h2>
            <ul className={styles.comboList}>
              {grouped[grade].map((combo, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    className={styles.comboCard}
                    onClick={() => setBreakdownCombo(combo)}
                    aria-label={`${combo.skills.join(" + ")} 점수 상세 보기`}
                  >
                    <div className={styles.comboChips}>
                      {combo.skills.map((s, i) => {
                        const g = nameToGrade[s];
                        const gradeCls = g ? styles[`chip_${g}`] : "";
                        return (
                          <span key={i} className={`${styles.skillChip} ${gradeCls}`}>{s}</span>
                        );
                      })}
                    </div>
                    <span className={styles.comboPoint}>{combo.totalPoint}점</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {/* 점수 breakdown 모달 */}
      {breakdownCombo && (
        <BreakdownModal combo={breakdownCombo} onClose={() => setBreakdownCombo(null)} />
      )}
    </main>
  );
}
