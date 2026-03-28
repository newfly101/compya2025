import React, { useState } from "react";
import styles from "./SkillChange.module.scss";
import PitcherSkillCard from "@/domains/simulate/feature/components/cards/PitcherSkillCard.jsx";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { usePitcherSkillChange, usePitcherSkillInit } from "@/domains/simulate/feature/hooks/usePitcherSkillChange.js";
import { SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { CardSwiper } from "@/global/ui/cardSwiper/index.js";
import { usePlayerCardData } from "@/domains/simulate/feature/hooks/usePlayerCardData.js";
import CardLoadingView from "@/domains/simulate/feature/components/CardLoadingView.jsx";
import { useSkillScoreResult } from "@/domains/simulate/feature/hooks/useSkillScoreResult.js";
import { useSkillScoreConfig } from "@/domains/simulate/feature/hooks/useSkillScoreConfig.js";
import SkillScoreTable from "@/domains/simulate/feature/components/scoreTable/SkillScoreTable.jsx";
import ResponseModal from "@/global/ui/responseModal/ResponseModal.jsx";

const PitcherSkillChange = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { moveTo } = useContentPageHeader();
  const { cardInfo, isLoading } = usePlayerCardData("PITCHER");
  const { skillStateMap, rollOnceFor } = usePitcherSkillChange();

  usePitcherSkillInit({ cardInfo, skillStateMap, rollOnceFor });

  useSkillScoreConfig();

  const [celebrate, setCelebrate] = useState(false);

  const selectedPitcher = cardInfo?.[activeIndex];
  const selectedSkills = skillStateMap[selectedPitcher?.identity?.name]?.skills;
  const scoreResult = useSkillScoreResult("PITCHER", selectedSkills);

  const handleRoll = (name) => {
    rollOnceFor(name, (skills) => {
      const legendCount = skills.filter(s => s.grade === "LEGEND").length;
      if (legendCount === 3) setCelebrate(true);
    });
  };

  return (
    <ContentPageLayout
      header={
        <ContentPageHeader
          title={"🎲 투수 고스변 시뮬레이터"}
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
              <h2 className={styles.subTitle}>🧤 투수 선택</h2>
              <CardSwiper onActiveIndexChange={setActiveIndex} className={styles.cardSwiper}>
                {cardInfo.map((p) => (
                  <SwiperSlide key={p?.identity?.name} className={styles.slide}>
                    <PitcherSkillCard
                      pitcher={p}
                      skills={skillStateMap[p?.identity?.name ?? p?.name]?.skills}
                    />
                  </SwiperSlide>
                ))}
              </CardSwiper>
            </section>

            <section className={styles.cardSection}>
              <button
                className={styles.itemButton}
                onClick={() => handleRoll(selectedPitcher?.identity.name)}
                disabled={!selectedPitcher?.identity.name}
              >
                <div className={styles.textBox}>
                  <span className={styles.title}>고급 고유능력 변경권</span>
                  <span className={styles.count}>
                    {skillStateMap[selectedPitcher?.identity.name]?.count ?? 0}
                  </span>
                </div>
              </button>
            </section>

            <SkillScoreTable
              result={scoreResult}
              playerName={selectedPitcher?.identity?.name}
            />

            <ResponseModal
              open={celebrate}
              success={true}
              message={"🎉 레전드 3개 달성!\n최고의 조합입니다!"}
              onClose={() => setCelebrate(false)}
            />
          </section>
        )
      }
    />
  );
};

export default PitcherSkillChange;
