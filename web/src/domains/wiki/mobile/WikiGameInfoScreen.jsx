// WikiGameInfoScreen.jsx — ENC-5 (PITCHER) / ENC-6 (HITTER) 기본 게임 정보
// /wiki/game-info/:target — BE GET /api/wiki/game-info/{target}
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useWikiGameInfo } from "@/domains/wiki/hooks/useWikiGameInfo.js";
import WikiNavTabs from "@/domains/wiki/mobile/components/wikiNavTabs/WikiNavTabs.jsx";
import styles from "./WikiGameInfoScreen.module.scss";

const TARGET_TITLES = {
  pitcher: "투수 기본 정보",
  hitter: "타자 기본 정보",
};

// 투수 탭
const PITCHER_TABS = ["마구", "구종 등급", "스탯 영향"];
// 타자 탭 (마구 없음)
const HITTER_TABS = ["스탯 영향"];

export default function WikiGameInfoScreen() {
  const { target } = useParams();
  const title = TARGET_TITLES[target] ?? "게임 정보";
  useDomainTopBar(title);

  const isPitcher = target === "pitcher";
  const tabs = isPitcher ? PITCHER_TABS : HITTER_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { data, isLoading, isError, refetch } = useWikiGameInfo(target);

  // ── 상태 분기: loading ────────────────────────────────────────
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.statusWrap}>
          <div className={styles.spinner} aria-label="로딩 중" />
          <p className={styles.statusText}>데이터를 불러오는 중...</p>
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
          <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  const pitches = data?.pitches ?? [];
  const pitchGrades = data?.pitchGrades ?? [];
  const statInfluences = data?.statInfluences ?? [];

  return (
    <main className={styles.page}>
      <WikiNavTabs />
      {/* 탭 */}
      <div className={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 마구 탭 ──────────────────────────────────── */}
      {activeTab === "마구" && isPitcher && (
        pitches.length === 0 ? (
          <EmptySection message="준비 중입니다." />
        ) : (
          <ul className={styles.pitchList}>
            {pitches
              .slice()
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map((pitch) => (
                <li key={pitch.code} className={styles.pitchCard}>
                  <div className={styles.pitchHeader}>
                    <span className={styles.pitchName}>{pitch.name}</span>
                    <span className={styles.pitchType}>{pitch.pitchType}</span>
                  </div>
                  {pitch.description && (
                    <p className={styles.pitchDesc}>{pitch.description}</p>
                  )}
                </li>
              ))}
          </ul>
        )
      )}

      {/* ── 구종 등급 탭 ─────────────────────────────── */}
      {activeTab === "구종 등급" && isPitcher && (
        pitchGrades.length === 0 ? (
          <EmptySection message="준비 중입니다." />
        ) : (
          <PitchGradeTable pitchGrades={pitchGrades} />
        )
      )}

      {/* ── 스탯 영향 탭 ─────────────────────────────── */}
      {activeTab === "스탯 영향" && (
        statInfluences.length === 0 ? (
          <EmptySection message="준비 중입니다." />
        ) : (
          <StatInfluenceSection statInfluences={statInfluences} />
        )
      )}
    </main>
  );
}

// ── 빈 섹션 컴포넌트 ──────────────────────────────────────────
function EmptySection({ message }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>{message}</p>
    </div>
  );
}

// ── 구종 등급표 컴포넌트 ──────────────────────────────────────
function PitchGradeTable({ pitchGrades }) {
  // pitch_code 별 그루핑
  const grouped = {};
  pitchGrades.forEach((pg) => {
    if (!grouped[pg.pitchCode]) grouped[pg.pitchCode] = [];
    grouped[pg.pitchCode].push(pg);
  });
  const GRADE_SORT = ["S", "A", "B", "C", "D", "E"];

  return (
    <div className={styles.gradeTableWrap}>
      {Object.entries(grouped).map(([code, grades]) => (
        <section key={code} className={styles.gradeTableSection}>
          <h3 className={styles.gradeTableTitle}>{code}</h3>
          <div className={styles.gradeTableGrid}>
            {GRADE_SORT.filter((g) => grades.find((pg) => pg.grade === g)).map((g) => {
              const pg = grades.find((pg) => pg.grade === g);
              return (
                <div key={g} className={styles.gradeTableRow}>
                  <span className={styles.gradeLabel}>{g}</span>
                  <span className={styles.gradeVelocity}>
                    {pg.velocityMin}~{pg.velocityMax}km
                  </span>
                  {pg.description && (
                    <span className={styles.gradeDesc}>{pg.description}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── 스탯 영향 컴포넌트 ────────────────────────────────────────
function StatInfluenceSection({ statInfluences }) {
  // stat_code 별 그루핑
  const grouped = {};
  statInfluences
    .filter((si) => si.isActive !== false)
    .forEach((si) => {
      if (!grouped[si.statCode]) grouped[si.statCode] = [];
      grouped[si.statCode].push(si);
    });

  return (
    <div className={styles.statSection}>
      {Object.entries(grouped).map(([statCode, influences]) => (
        <section key={statCode} className={styles.statGroup}>
          <h3 className={styles.statTitle}>{statCode}</h3>
          <ul className={styles.statList}>
            {[...influences]
              .sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1))
              .map((inf, idx) => (
                <li key={idx} className={styles.statRow}>
                  <span className={styles.statTarget}>{inf.influenceTarget}</span>
                  <span className={styles.statWeight}>가중치 {inf.weight}</span>
                  {inf.description && (
                    <p className={styles.statDesc}>{inf.description}</p>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
