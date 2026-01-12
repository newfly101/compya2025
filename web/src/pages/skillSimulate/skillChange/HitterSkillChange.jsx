import React, { useState } from "react";
import styles from "./SkillChange.module.scss";
import { legendBatterData } from "@/data/player/legend/legendBatterData.js";
import HitterSkillCard from "@/feature/skillSimulate/components/cards/HitterSkillCard.jsx";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { useHitterSkillChange } from "@/feature/skillSimulate/hooks/useHitterSkillChange.js";

const HitterSkillChange = () => {
  const [selectedHitter, setSelectedHitter] = useState(null);
  const { moveTo } = useContentPageHeader();
  const {skills, skillChangeCount, rollOnce} = useHitterSkillChange(selectedHitter);

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"🎲 타자 고스변 시뮬레이터"}
                                 meta={["2026-01-09", "v0.1.7"]}
                                 backLabel={"스킬 시뮬레이터로"}
                                 onBack={() => moveTo("/simulate")}
      />}
      children={
        <section>

          <h6>선수 이미지는 저작권 문제로 인해 변경하였습니다.</h6>

          <section className={styles.pitcherSelectSection}>
            <h2 className={styles.subTitle}>⚾ 타자 선택</h2>

            <div className={styles.pitcherGrid}>
              {legendBatterData.map((p) => (
                <button
                  key={p.id}
                  className={`${styles.pitcherButton} ${
                    selectedHitter?.id === p.id ? styles.active : ""
                  }`}
                  onClick={() => setSelectedHitter(p)}
                >
                  <strong>{p.name}</strong>
                </button>
              ))}
            </div>
          </section>

          {selectedHitter && (
            <section className={styles.cardSection}>
              <HitterSkillCard
                hitter={selectedHitter}
                skills={skills}
              />

              <button
                className={styles.itemButton}
                onClick={rollOnce}
                disabled={!selectedHitter}
              >
                <div className={styles.textBox}>
                  <span className={styles.title}>고급 고유능력 변경권</span>
                  <span className={styles.count}>{skillChangeCount}</span>
                </div>
              </button>

              {/* 개발자 모드 자동 돌리기 기능 */}
              {/*<button*/}
              {/*  className={styles.itemButton}*/}
              {/*  onClick={() => {*/}
              {/*    if (isRolling) {*/}
              {/*      stopRolling();*/}
              {/*    } else {*/}
              {/*      startRollingUntil3Legend();*/}
              {/*    }*/}
              {/*  }}*/}
              {/*  disabled={!selectedHitter}*/}
              {/*>*/}
              {/*  {isRolling ? "연속 변경 중지" : "3 LEGEND 나올 때까지 변경"}*/}
              {/*</button>*/}
            </section>
          )}
        </section>} />
  );
};

export default HitterSkillChange;
