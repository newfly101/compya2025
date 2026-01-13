import React, { useState } from "react";
import styles from "./SkillChange.module.scss";
import { legendHitterData } from "@/data/player/legend/legendHitterData.js";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { useHitterSkillChange } from "@/feature/skillSimulate/hooks/v2/useHitterSkillChange.js";
import { SwiperSlide } from "swiper/react";
import PitcherSkillCard from "@/feature/skillSimulate/components/cards/v1/PitcherSkillCard.jsx";
import { CardSwiper } from "@/shared/ui/cardSwiper/index.js";

const HitterSkillChange = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { moveTo } = useContentPageHeader();

  const { skillStateMap, rollOnceFor } = useHitterSkillChange();
  const selectedHitter = legendHitterData[activeIndex];

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"🎲 타자 고스변 시뮬레이터"}
                                 meta={["2026-01-14", "v0.1.9"]}
                                 backLabel={"스킬 시뮬레이터로"}
                                 onBack={() => moveTo("/simulate")}
      />}
      children={
        <section>
          <h6>선수 이미지는 저작권 문제로 인해 변경하였습니다.</h6>

          <section className={styles.pitcherSelectSection}>
            <h2 className={styles.subTitle}>⚾ 타자 선택</h2>
            <CardSwiper
              onActiveIndexChange={setActiveIndex}
              className={styles.cardSwiper}
              children={
                legendHitterData.map((p) => (
                  <SwiperSlide
                    key={p.id}
                    className={styles.slide}
                  >
                    <PitcherSkillCard
                      pitcher={p}
                      skills={skillStateMap[p.name]?.skills}
                    />
                  </SwiperSlide>
                ))
              }
            />
          </section>

          <section className={styles.cardSection}>
            <button
              className={styles.itemButton}
              onClick={() => rollOnceFor(selectedHitter)}
              disabled={!selectedHitter}
            >
              <div className={styles.textBox}>
                <span className={styles.title}>고급 고유능력 변경권</span>
                <span className={styles.count}>{skillStateMap[selectedHitter?.name]?.count ?? 0}</span>
              </div>
            </button>
          </section>
        </section>
    } />
  );
};

export default HitterSkillChange;
