import styles from "@/domains/notices/page/funNotice/FunNoticePage.module.scss";
import { useParams } from "react-router-dom";
import funNotice from "@/data/FunNotice.js";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import React from "react";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";

const FunNoticePage = () => {
  const { moveTo } = useContentPageHeader();
  const { id } = useParams();
  const data = funNotice.find(item => item.id === Number(id));
  const meta = [
    data.updateDate,
    ...(data.version ? [data.version] : []),
  ];
  if (!data) return <>공지사항을 찾을 수 없습니다.</>;

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={data.titleName}
                                 meta={meta}
                                 backLabel={data.category}
                                 onBack={() => moveTo(`/notice/`)}
      />}
      children={
        <>
          {data.summary && (
            <section className={styles.summary}>
              <ul>
                {data.summary.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.body}>
            <ol>
              {data.contents.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </section>

          <footer className={styles.footer}>
            <p>앞으로도 지속적으로 정확하고 편리한 기능을 제공하겠습니다.</p>
            <p>감사합니다.</p>
          </footer>
        </>

      }
    />
  );
};

export default FunNoticePage;
