import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import NoticeCard from "@/domains/notices/mobile/components/noticeCard/NoticeCard.jsx";
import NoticeListVertical from "@/domains/notices/mobile/containers/public/NoticeListVertical.jsx";
import OfficialNoticeListVertical from "@/domains/notices/mobile/containers/public/OfficialNoticeListVertical.jsx";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import styles from "./NoticeScreen.module.scss";

const NoticeScreen = () => {
  const { featuredNotice, listedNotices, listedOfficials } = useNoticeList();

  return (
    <div className={styles.screen}>
      {featuredNotice && (
        <SectionBlock title="중요 공지">
          <NoticeCard notice={featuredNotice} isFeatured />
        </SectionBlock>
      )}

      <SectionBlock title="사이트 공지" to="/community/notices" linkText="전체 보기 →">
        <NoticeListVertical notices={listedNotices} />
      </SectionBlock>

      <div className={styles.sep} />

      <SectionBlock title="공식 공지">
        <OfficialNoticeListVertical notices={listedOfficials} />
      </SectionBlock>
    </div>
  );
};

export default NoticeScreen;
