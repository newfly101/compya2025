import React from "react";
import styles from "@/pages/dictionary/Dictionary.module.scss";
import DictionaryCard from "@/feature/dictionary/components/dictionaryCard/DictionaryCard.jsx";
import pitcherImg from "@/assets/dictionary/pitcherImg.png";
import hitterImg from "@/assets/dictionary/hitterImg.png";
import coachImg from "@/assets/dictionary/coachImg.png";
import logoImg from "@/assets/dictionary/logoImg.png";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";

const Dictionary = () => {
  const {
    moveHome
  } = useContentPageHeader();

  return (
    <ContentPageLayout
      header={<ContentPageHeader
        title={"📌 조합 추천 백과사전"}
        meta={["2026-01-03","v0.1.5"]}
        backLabel={"메인으로"}
        onBack={moveHome}
      />}
      children={<div className={styles.cardGrid}>
        <DictionaryCard
          icon="🧤"
          title="투수 스킬 백과사전"
          desc={["레전드 투수 스킬 조합", "플래티넘 투수 스킬 조합", "선발/중계/마무리 조합"]}
          link="/dictionary/pitcher"
          image={pitcherImg}
          disabled={false}
        />
        <DictionaryCard
          icon="⚾"
          title="타자 스킬 백과사전"
          desc={["레전드 타자 스킬 조합", "플레티넘 타자 스킬 조합", "포지션 별 추천 조합"]}
          link="/dictionary/hitter"
          image={hitterImg}
          disabled={false}
        />
        <DictionaryCard
          icon="🧠"
          title="코치 스킬 백과사전"
          desc={["코치 스킬 메타 추천", "코치 스킬별 설명", "마스터 코치 추천 스킬"]}
          link="/dictionary/coach"
          image={coachImg}
          disabled={true}
        />
        <DictionaryCard
          icon="🧠"
          title="구단 선수 백과사전"
          desc={["구단별 선수 백과사전", "추천 시그니처 백과사전"]}
          link="/dictionary/team"
          image={logoImg}
          disabled={true}
        />
      </div>}
    />
  )
    ;
};

export default Dictionary;
