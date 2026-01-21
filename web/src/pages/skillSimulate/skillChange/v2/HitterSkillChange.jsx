import React, { useEffect, useState } from "react";
import styles from "./SkillChange.module.scss";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { useHitterSkillChange, useHitterSkillInit } from "@/feature/skillSimulate/hooks/v2/useHitterSkillChange.js";
import { SwiperSlide } from "swiper/react";
import { CardSwiper } from "@/shared/ui/cardSwiper/index.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerCardInfo } from "@/store/modules/simulate/index.js";
import HitterSkillCard from "@/feature/skillSimulate/components/cards/v1/HitterSkillCard.jsx";

const HitterSkillChange = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { cardInfo } = useSelector((state) => state.simulate);
  const { moveTo } = useContentPageHeader();
  const dispatch = useDispatch();
  const { skillStateMap, rollOnceFor } = useHitterSkillChange();

  useEffect(() => {
    dispatch(requestPlayerCardInfo("HITTER"));
  }, [dispatch]);

  useHitterSkillInit({cardInfo, skillStateMap, rollOnceFor});
  const selectedHitter = cardInfo?.[activeIndex];

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"🎲 타자 고스변 시뮬레이터"}
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
            <h2 className={styles.subTitle}>⚾ 타자 선택</h2>
            <CardSwiper
              onActiveIndexChange={setActiveIndex}
              className={styles.cardSwiper}
              >
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
                <span className={styles.count}>{skillStateMap[selectedHitter?.identity.name]?.count ?? 0}</span>
              </div>
            </button>
          </section>
        </section>
    } />
  );
};

export default HitterSkillChange;
