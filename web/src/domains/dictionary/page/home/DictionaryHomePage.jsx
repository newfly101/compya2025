import React from "react";
import styles from "@/domains/dictionary/page/Dictionary.module.scss";
import NavigationCard from "@/global/ui/navigationCard/NavigationCard.jsx";

import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import MetaHeader from "@/global/ui/metaHeader/MetaHeader.jsx";
import { DICTIONARY_HOME_CARDS } from "@/domains/dictionary/feature/config/home/dictionaryHomConfig.js";

const DictionaryHomePage = () => {
  const {
    moveHome,
  } = useContentPageHeader();

  return (
    <ContentPageLayout
      header={
        <MetaHeader
          backLabel={"메인으로"}
          onBack={moveHome}
        />
      }
      children={
        <section className={styles.cardGrid}>
          {DICTIONARY_HOME_CARDS.map((card) => (
            <NavigationCard
              key={card.key}
              icon={card.icon}
              title={card.title}
              desc={card.description}
              link={card.link}
              image={card.image}
              disabled={card.disabled}
            />
          ))}
        </section>
      }
    />
  );
};

export default DictionaryHomePage;
