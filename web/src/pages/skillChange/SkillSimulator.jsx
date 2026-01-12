import React from "react";
import styles from "@/pages/dictionary/Dictionary.module.scss";
import pitcherImg from "@/assets/dictionary/pitcherImg.png";
import hitterImg from "@/assets/dictionary/hitterImg.png";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { NavigationCard } from "@/shared/ui/navigationCard/index.js";

const SkillSimulator = () => {
  const {
    moveHome,
  } = useContentPageHeader();

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"📌 스킬 시뮬레이터"}
                                 meta={["2026-01-09", "v0.1.6"]}
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
