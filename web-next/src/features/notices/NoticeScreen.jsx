import SectionBlock from "@/components/section/SectionBlock.jsx";
import StateBox from "@/components/stateBox/StateBox.jsx";
import GuideAccordion from "@/components/guideAccordion/GuideAccordion.jsx";
import { GUIDES_BY_SLUG } from "@/features/guides/content/index.js";
import NoticeCard from "@/features/notices/components/noticeCard/NoticeCard.jsx";
import OfficialNoticeCard from "@/features/notices/components/officialNoticeCard/OfficialNoticeCard.jsx";
import LoadMoreList from "@/features/notices/components/LoadMoreList.jsx";
import styles from "./NoticeScreen.module.scss";

// 서버 컴포넌트 — 데이터는 page 가 넘긴다. 로딩·오류 분기는 Next(loading/error)가 맡고 여기선 빈 상태만 본다.
// TODO(next-migration): AdSlot(NOTICES_LIST) 미이전
const NoticeScreen = ({ siteNotices, officialNotices }) => {
  const featured = siteNotices.find((n) => n.isPinned) ?? siteNotices[0] ?? null;
  const rest = siteNotices.filter((n) => n !== featured);

  return (
    <div className={styles.screen}>
      <GuideAccordion guide={GUIDES_BY_SLUG["notice-guide"]} />

      {featured && (
        <SectionBlock title="중요 공지">
          <NoticeCard notice={featured} variant="pinned" />
        </SectionBlock>
      )}

      <SectionBlock title="사이트 공지">
        {rest.length === 0 ? (
          <StateBox status="empty" message="등록된 사이트 공지가 없습니다" compact />
        ) : (
          <LoadMoreList>
            {rest.map((n) => <NoticeCard key={n.id} notice={n} variant="list" />)}
          </LoadMoreList>
        )}
      </SectionBlock>

      <div className={styles.sep} />

      <SectionBlock title="공식 공지">
        {officialNotices.length === 0 ? (
          <StateBox status="empty" message="등록된 공식 공지가 없습니다" compact />
        ) : (
          <LoadMoreList>
            {officialNotices.map((n) => <OfficialNoticeCard key={n.id} notice={n} />)}
          </LoadMoreList>
        )}
      </SectionBlock>
    </div>
  );
};

export default NoticeScreen;
