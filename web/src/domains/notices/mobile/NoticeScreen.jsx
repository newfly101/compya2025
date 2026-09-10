import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import NoticeCard from "@/domains/notices/mobile/components/noticeCard/NoticeCard.jsx";
import NoticeListVertical from "@/domains/notices/mobile/containers/public/NoticeListVertical.jsx";
import OfficialNoticeListVertical from "@/domains/notices/mobile/containers/public/OfficialNoticeListVertical.jsx";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import styles from "./NoticeScreen.module.scss";

const NoticeScreen = () => {
  useDomainTopBar("공지사항");
  const {
    featuredNotice, listedNotices, listedOfficials,
    loading, error, loaded, retry,
  } = useNoticeList();

  // 같은 요청이 두 목록을 함께 채운다 — 로딩/오류는 두 섹션이 공유하고,
  // 빈 상태(0건)만 섹션별로 따로 판단한다.
  const renderList = (items, listComp, emptyMessage) => {
    if (loading && !loaded) return <Skeleton count={3} height={56} />;
    if (error) return <StateBox status="error" onRetry={retry} compact />;
    if (items.length === 0) return <StateBox status="empty" message={emptyMessage} compact />;
    return listComp;
  };

  return (
    <div className={styles.screen}>
      {featuredNotice && (
        <SectionBlock title="중요 공지">
          <NoticeCard notice={featuredNotice} isFeatured />
        </SectionBlock>
      )}

      {/* community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조). community 라우트 비활성 동안 link target 임시 제거 */}
      <SectionBlock title="사이트 공지">
        {renderList(listedNotices, <NoticeListVertical notices={listedNotices} />, "등록된 사이트 공지가 없습니다")}
      </SectionBlock>

      <div className={styles.sep} />

      <SectionBlock title="공식 공지">
        {renderList(listedOfficials, <OfficialNoticeListVertical notices={listedOfficials} />, "등록된 공식 공지가 없습니다")}
      </SectionBlock>
    </div>
  );
};

export default NoticeScreen;
