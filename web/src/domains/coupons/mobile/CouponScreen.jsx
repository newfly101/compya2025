import React from "react";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import CouponListVertical from "@/domains/coupons/mobile/containers/public/CouponListVertical.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { useCouponList } from "@/domains/coupons/mobile/hooks/useCouponList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import AdSlot from "@/infra/ads/AdSlot.jsx";
import { AD_SLOTS } from "@/infra/ads/adConfig.js";

// 실패를 "0건"과 구분해서 보여준다 — 조회 실패를 빈 목록처럼 보여주면 안 된다.
const renderSection = (list, isExpired, emptyMessage, { loading, error, retry }) => {
  if (loading) return <StateBox status="loading" compact />;
  if (error) return <StateBox status="error" onRetry={retry} compact />;
  if (list.length === 0) return <StateBox status="empty" message={emptyMessage} compact />;
  return <CouponListVertical coupons={list} isExpired={isExpired} />;
};

const CouponScreen = () => {
  useDomainTopBar("쿠폰");
  const { activeCoupon, expiredCoupon, loading, error, retry } = useCouponList();
  const state = { loading, error, retry };
  const hasContent = !loading && !error && (activeCoupon.length > 0 || expiredCoupon.length > 0);

  return (
      <>
        <SectionBlock title="최신 쿠폰">
          {renderSection(activeCoupon, false, "받을 수 있는 쿠폰이 없습니다", state)}
        </SectionBlock>

        <SectionBlock title="종료된 쿠폰">
          {renderSection(expiredCoupon, true, "종료된 쿠폰이 없습니다", state)}
        </SectionBlock>

        {/* 목록 하단 광고 — 데이터가 1건 이상 렌더된 경우에만 */}
        {hasContent && <AdSlot slot={AD_SLOTS.COUPONS_LIST} />}
      </>
  );
};

export default CouponScreen;
