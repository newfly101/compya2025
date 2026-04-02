import React from "react";
import styles from "./SkillSimulator.module.scss";
import pitcherImg from "@/assets/dictionary/pitcherImg.png";
import hitterImg from "@/assets/dictionary/hitterImg.png";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { NavigationCard } from "@/global/ui/navigationCard/index.js";
import { useSkillScoreConfig } from "@/domains/simulate/feature/hooks/useSkillScoreConfig.js";

const SkillSimulator = () => {
  const {
    moveHome,
  } = useContentPageHeader();

  useSkillScoreConfig();

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"📌 스킬 시뮬레이터"}
                                 meta={["2026-01-14", "v0.1.9"]}
                                 backLabel={"메인으로"}
                                 onBack={moveHome}
      />}
      children={<div className={styles.cardGrid}>
        <NavigationCard
          icon="🧤"
          title="투수 고스변 시뮬레이터"
          desc={["레전드 투수 스킬 시뮬레이터", "투수 선택 가능"]}
          link="/simulate/pitcher"
          image={pitcherImg}
          disabled={false}
        />
        <NavigationCard
          icon="⚾"
          title="타자 고스변 시뮬레이터"
          desc={["레전드 타자 스킬 시뮬레이터", "타자 선택 가능"]}
          link="/simulate/hitter"
          image={hitterImg}
          disabled={false}
        />
      </div>}
    />
  );
};

export default SkillSimulator;
