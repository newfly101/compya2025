import React, { useEffect, useState } from "react";
import styles from "./SkillChange.module.scss";
import PitcherSkillCard from "@/domains/simulate/feature/components/cards/PitcherSkillCard.jsx";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { usePitcherSkillChange, usePitcherSkillInit } from "@/domains/simulate/feature/hooks/usePitcherSkillChange.js";
import { SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { CardSwiper } from "@/global/ui/cardSwiper/index.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerCardInfo } from "@/domains/simulate/store/index.js";


const PitcherSkillChange = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { cardInfo } = useSelector((state) => state.simulate);
  const { moveTo } = useContentPageHeader();
  const dispatch = useDispatch();
  const { skillStateMap, rollOnceFor } = usePitcherSkillChange();

  useEffect(() => {
    dispatch(requestPlayerCardInfo("PITCHER"));
  }, [dispatch]);

  usePitcherSkillInit({cardInfo, skillStateMap, rollOnceFor});
  const selectedPitcher = cardInfo?.[activeIndex];

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"🎲 투수 고스변 시뮬레이터"}
                                 meta={["2026-01-14", "v0.1.9"]}
                                 backLabel={"스킬 시뮬레이터로"}
                                 onBack={() => moveTo("/simulate")}
      />}
      children={
        (!cardInfo || cardInfo.length === 0) ?
          <div style={{ padding: "6rem", textAlign: "center" }}>
            데이터를 불러오는 중입니다...
          </div>
          :
          <section>
            <h6>선수 이미지는 저작권 문제로 인해 변경하였습니다.</h6>

            <section className={styles.pitcherSelectSection}>
              <h2 className={styles.subTitle}>🧤 투수 선택</h2>
              <CardSwiper
                onActiveIndexChange={setActiveIndex}
                className={styles.cardSwiper}
                >
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
                onClick={() => rollOnceFor(selectedPitcher?.identity.name)}
                disabled={!selectedPitcher?.identity.name}
              >
                <div className={styles.textBox}>
                  <span className={styles.title}>고급 고유능력 변경권</span>
                  <span className={styles.count}>{skillStateMap[selectedPitcher?.identity.name]?.count ?? 0}</span>
                </div>
              </button>
            </section>
            <section>

            </section>
          </section>
      } />
  );
};

export default PitcherSkillChange;
