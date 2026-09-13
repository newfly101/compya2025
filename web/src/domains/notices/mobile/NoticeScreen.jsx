import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import NoticeCard from "@/domains/notices/mobile/components/noticeCard/NoticeCard.jsx";
import NoticeListVertical from "@/domains/notices/mobile/containers/public/NoticeListVertical.jsx";
import OfficialNoticeListVertical from "@/domains/notices/mobile/containers/public/OfficialNoticeListVertical.jsx";
import LoadMoreButton from "@/domains/notices/mobile/components/loadMoreButton/LoadMoreButton.jsx";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import GuideAccordion from "@/global/ui/guideAccordion/GuideAccordion.jsx";
import { GUIDES_BY_SLUG } from "@/domains/guides/content/index.js";
import AdSlot from "@/infra/ads/AdSlot.jsx";
import { AD_SLOTS } from "@/infra/ads/adConfig.js";
import styles from "./NoticeScreen.module.scss";

const NoticeScreen = () => {
  useDomainTopBar("공지사항");
  const {
    featuredNotice, listedNotices, listedOfficials,
    remainingNotices, remainingOfficials, showMoreNotices, showMoreOfficials,
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

  // 정상 상태(로딩/오류/빈목록이 아님)일 때만 「더보기」를 보여준다.
  const showLoadMore = !loading && !error;
  const hasContent = !loading && !error && (listedNotices.length > 0 || listedOfficials.length > 0);

  return (
    <div className={styles.screen}>
      <GuideAccordion guide={GUIDES_BY_SLUG["notice-guide"]} />

      {featuredNotice && (
        <SectionBlock title="중요 공지">
          <NoticeCard notice={featuredNotice} variant="pinned" />
        </SectionBlock>
      )}

      {/* community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조). community 라우트 비활성 동안 link target 임시 제거 */}
      <SectionBlock title="사이트 공지">
        {renderList(listedNotices, <NoticeListVertical notices={listedNotices} />, "등록된 사이트 공지가 없습니다")}
        {showLoadMore && listedNotices.length > 0 && (
          <LoadMoreButton remaining={remainingNotices} onClick={showMoreNotices} />
        )}
      </SectionBlock>

      <div className={styles.sep} />

      <SectionBlock title="공식 공지">
        {renderList(listedOfficials, <OfficialNoticeListVertical notices={listedOfficials} />, "등록된 공식 공지가 없습니다")}
        {showLoadMore && listedOfficials.length > 0 && (
          <LoadMoreButton remaining={remainingOfficials} onClick={showMoreOfficials} />
        )}
      </SectionBlock>

      {/* 목록 하단 광고 — 데이터가 1건 이상 렌더된 경우에만 */}
      {hasContent && <AdSlot slot={AD_SLOTS.NOTICES_LIST} />}
    </div>
  );
};

export default NoticeScreen;
