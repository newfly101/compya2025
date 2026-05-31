import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import NoticeCard from "@/domains/notices/mobile/components/noticeCard/NoticeCard.jsx";
import NoticeListVertical from "@/domains/notices/mobile/containers/public/NoticeListVertical.jsx";
import OfficialNoticeListVertical from "@/domains/notices/mobile/containers/public/OfficialNoticeListVertical.jsx";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./NoticeScreen.module.scss";

const NoticeScreen = () => {
  useDomainTopBar("공지사항");
  const { featuredNotice, listedNotices, listedOfficials } = useNoticeList();

  return (
    <div className={styles.screen}>
      {featuredNotice && (
        <SectionBlock title="중요 공지">
          <NoticeCard notice={featuredNotice} isFeatured />
        </SectionBlock>
      )}

      {/* community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조). community 라우트 비활성 동안 link target 임시 제거 */}
      <SectionBlock title="사이트 공지">
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
