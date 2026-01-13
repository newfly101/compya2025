import React, { useState } from "react";
import styles from "./SkillChange.module.scss";
import { legendPitcherData } from "@/data/player/legend/legendPitcherData.js";
import PitcherSkillCard from "@/feature/skillSimulate/components/cards/v1/PitcherSkillCard.jsx";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { usePitcherSkillChange } from "@/feature/skillSimulate/hooks/v1/usePitcherSkillChange.js";

const PitcherSkillChange = () => {
  const [selectedPitcher, setSelectedPitcher] = useState(null);
  const {rollOnce, skillChangeCount, skills} = usePitcherSkillChange(selectedPitcher);
  const { moveTo } = useContentPageHeader();

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"🎲 투수 고스변 시뮬레이터"}
                                 meta={["2026-01-09", "v0.1.7"]}
                                 backLabel={"스킬 시뮬레이터로"}
                                 onBack={() => moveTo("/simulate")}
      />}
      children={
        <section>
          <h6>선수 이미지는 저작권 문제로 인해 변경하였습니다.</h6>

          <section className={styles.pitcherSelectSection}>
            <h2 className={styles.subTitle}>🧤 투수 선택</h2>

            <div className={styles.pitcherGrid}>
              {legendPitcherData.map((p) => (
                <button
                  key={p.id}
                  className={`${styles.pitcherButton} ${
                    selectedPitcher?.id === p.id ? styles.active : ""
                  }`}
                  onClick={() => setSelectedPitcher(p)}
                >
                  <strong>{p.name}</strong>
                </button>
              ))}
            </div>
          </section>

          {selectedPitcher && (
            <section className={styles.cardSection}>
              <PitcherSkillCard
                pitcher={selectedPitcher}
                skills={skills}
              />

              <button
                className={styles.itemButton}
                onClick={rollOnce}
                disabled={!selectedPitcher}
              >
                <div className={styles.textBox}>
                  <span className={styles.title}>고급 고유능력 변경권</span>
                  <span className={styles.count}>{skillChangeCount}</span>
                </div>
              </button>
            </section>
          )}
        </section>
      } />
  );
};

export default PitcherSkillChange;
