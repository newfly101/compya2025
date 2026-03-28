import React, { useState } from "react";
import styles from "./SkillChange.module.scss";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { useHitterSkillChange, useHitterSkillInit } from "@/domains/simulate/feature/hooks/useHitterSkillChange.js";
import { SwiperSlide } from "swiper/react";
import { CardSwiper } from "@/global/ui/cardSwiper/index.js";
import HitterSkillCard from "@/domains/simulate/feature/components/cards/HitterSkillCard.jsx";
import { usePlayerCardData } from "@/domains/simulate/feature/hooks/usePlayerCardData.js";
import CardLoadingView from "@/domains/simulate/feature/components/CardLoadingView.jsx";
import { useSkillScoreResult } from "@/domains/simulate/feature/hooks/useSkillScoreResult.js";
import { useSkillScoreConfig } from "@/domains/simulate/feature/hooks/useSkillScoreConfig.js";
import SkillScoreTable from "@/domains/simulate/feature/components/scoreTable/SkillScoreTable.jsx";

const HitterSkillChange = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { moveTo } = useContentPageHeader();
  const { cardInfo, isLoading } = usePlayerCardData("HITTER");
  const { skillStateMap, rollOnceFor } = useHitterSkillChange();

  useHitterSkillInit({ cardInfo, skillStateMap, rollOnceFor });

  useSkillScoreConfig();

  const selectedHitter = cardInfo?.[activeIndex];
  const selectedSkills = skillStateMap[selectedHitter?.identity?.name]?.skills;
  const scoreResult = useSkillScoreResult("HITTER", selectedSkills);

  return (
    <ContentPageLayout
      header={
        <ContentPageHeader
          title={"🎲 타자 고스변 시뮬레이터"}
          meta={["2026-01-14", "v0.1.9"]}
          backLabel={"스킬 시뮬레이터로"}
          onBack={() => moveTo("/simulate")}
        />
      }
      children={
        isLoading ? (
          <CardLoadingView />
        ) : (
          <section>
            <h6>선수 이미지는 저작권 문제로 인해 변경하였습니다.</h6>

            <section className={styles.pitcherSelectSection}>
              <h2 className={styles.subTitle}>⚾ 타자 선택</h2>
              <CardSwiper onActiveIndexChange={setActiveIndex} className={styles.cardSwiper}>
                {cardInfo.map((h) => (
                  <SwiperSlide key={h?.identity?.name} className={styles.slide}>
                    <HitterSkillCard
                      hitter={h}
                      skills={skillStateMap[h?.identity?.name ?? h?.name]?.skills}
                    />
                  </SwiperSlide>
                ))}
              </CardSwiper>
            </section>

            <section className={styles.cardSection}>
              <button
                className={styles.itemButton}
                onClick={() => rollOnceFor(selectedHitter?.identity.name)}
                disabled={!selectedHitter?.identity.name}
              >
                <div className={styles.textBox}>
                  <span className={styles.title}>고급 고유능력 변경권</span>
                  <span className={styles.count}>
                    {skillStateMap[selectedHitter?.identity.name]?.count ?? 0}
                  </span>
                </div>
              </button>
            </section>

            <SkillScoreTable
              result={scoreResult}
              playerName={selectedHitter?.identity?.name}
            />
          </section>
        )
      }
    />
  );
};

export default HitterSkillChange;
