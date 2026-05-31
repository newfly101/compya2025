// WikiSkillScreen.jsx — ENC-1 (PITCHER) / ENC-2 (HITTER) 스킬 목록
// /wiki/skill/:target — target prop 분기
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useSkills } from "@/domains/wiki/hooks/useSkills.js";
import WikiSkillModal from "@/domains/wiki/mobile/components/wikiSkillModal/WikiSkillModal.jsx";
import WikiNavTabs from "@/domains/wiki/mobile/components/wikiNavTabs/WikiNavTabs.jsx";
import styles from "./WikiSkillScreen.module.scss";

const GRADE_ORDER = ["LEGEND", "PLATINUM", "HERO", "NORMAL"];

const GRADE_LABELS = {
  LEGEND: "레전드",
  PLATINUM: "플래티넘",
  HERO: "히어로",
  NORMAL: "노말",
};

const TARGET_TITLES = {
  pitcher: "투수 스킬 백과사전",
  hitter: "타자 스킬 백과사전",
};

export default function WikiSkillScreen() {
  const { target } = useParams();
  const title = TARGET_TITLES[target] ?? "스킬 백과사전";
  useDomainTopBar(title);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [sortByName, setSortByName] = useState(false);

  const { data, isLoading, isError, refetch } = useSkills(target);

  // 전체 스킬 리스트 + grade 기준 정렬
  const allSkills = useMemo(() => {
    if (!data) return [];
    const result = [];
    GRADE_ORDER.forEach((grade) => {
      const list = data[grade.toLowerCase()] ?? [];
      list.forEach((s) => result.push({ ...s, grade }));
    });
    return result;
  }, [data]);

  // skillCode → name 매핑 (모달에서 시너지/상극 코드를 이름으로 치환)
  const codeToName = useMemo(() => {
    const map = {};
    allSkills.forEach((s) => {
      if (s.skillCode) map[s.skillCode] = s.name;
    });
    return map;
  }, [allSkills]);

  // 검색 + 필터 적용
  const filteredByGrade = useMemo(() => {
    let list = allSkills;
    if (selectedGrades.length > 0) {
      list = list.filter((s) => selectedGrades.includes(s.grade));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => s.name?.toLowerCase().includes(q));
    }
    if (sortByName) {
      list = [...list].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "ko"));
    }
    return list;
  }, [allSkills, selectedGrades, searchQuery, sortByName]);

  // grade 별 그루핑
  const grouped = useMemo(() => {
    const map = {};
    GRADE_ORDER.forEach((grade) => {
      const items = filteredByGrade.filter((s) => s.grade === grade);
      if (items.length > 0) map[grade] = items;
    });
    return map;
  }, [filteredByGrade]);

  const toggleGrade = (grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  // ── 상태 분기: loading ────────────────────────────────────────
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.statusWrap}>
          <div className={styles.spinner} aria-label="로딩 중" />
          <p className={styles.statusText}>스킬 데이터를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  // ── 상태 분기: error ──────────────────────────────────────────
  if (isError) {
    return (
      <main className={styles.page}>
        <div className={styles.statusWrap}>
          <p className={styles.statusText}>데이터를 불러올 수 없습니다.</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <WikiNavTabs />
      {/* 검색 */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="스킬 이름 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="스킬 이름 검색"
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

      {/* grade 필터 칩 */}
      <div className={styles.filterRow}>
        {GRADE_ORDER.map((grade) => (
          <button
            key={grade}
            type="button"
            className={`${styles.chip} ${selectedGrades.includes(grade) ? styles.chipActive : ""}`}
            onClick={() => toggleGrade(grade)}
          >
            {GRADE_LABELS[grade]}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${sortByName ? styles.chipActive : ""}`}
          onClick={() => setSortByName((prev) => !prev)}
        >
          가나다
        </button>
      </div>

      {/* ── 상태 분기: empty ─────────────────────────── */}
      {Object.keys(grouped).length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {searchQuery || selectedGrades.length > 0
              ? "검색 결과가 없습니다."
              : "표시할 스킬이 없습니다."}
          </p>
        </div>
      ) : (
        // ── 상태 분기: normal ─────────────────────────────────
        GRADE_ORDER.filter((g) => grouped[g]).map((grade) => (
          <section key={grade} className={styles.gradeSection}>
            <h2 className={styles.gradeTitle}>
              <span className={`${styles.gradeDot} ${styles[`dot_${grade.toLowerCase()}`]}`} />
              {GRADE_LABELS[grade]}
              <span className={styles.gradeCount}>{grouped[grade].length}개</span>
            </h2>
            <ul className={styles.skillList}>
              {grouped[grade].map((skill) => (
                <li key={skill.skillCode ?? skill.id}>
                  <button
                    type="button"
                    className={styles.skillCard}
                    onClick={() => setSelectedSkill(skill)}
                    aria-label={`${skill.name} 스킬 상세 보기`}
                  >
                    <div className={styles.skillCardHeader}>
                      <span className={styles.skillName}>{skill.name}</span>
                    </div>
                    <p className={styles.skillDesc}>{skill.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {/* 스킬 상세 모달 */}
      {selectedSkill && (
        <WikiSkillModal
          skill={selectedSkill}
          codeToName={codeToName}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </main>
  );
}
