import PageShell from "@/layout/PageShell.jsx";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import CouponListVertical from "@/domains/coupons/mobile/containers/public/CouponListVertical.jsx";
import { fetchCoupons } from "@/domains/coupons/api.js";
import { formatNow } from "@/global/utils/dateUtils.js";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({ title: "쿠폰 모아보기", description: "컴투스 프로야구 최신 쿠폰 코드와 종료된 쿠폰 이력을 모아보는 페이지입니다.", path: "/coupons" });

// TODO(next-migration): GuideAccordion(coupon-guide) · AdSlot(COUPONS_LIST) 미이전
const renderSection = (list, isExpired, emptyMessage) =>
  list.length === 0 ? (
    <StateBox status="empty" message={emptyMessage} compact />
  ) : (
    <CouponListVertical coupons={list} isExpired={isExpired} />
  );

export default function CouponsPage() {
  return (
    <PageShell title="쿠폰">
      <CouponsBody />
    </PageShell>
  );
}

async function CouponsBody() {
  const coupons = await fetchCoupons();

  const now = formatNow();
  return (
    <>
      <SectionBlock title="최신 쿠폰">
        {renderSection(coupons.filter((c) => c.expireAt >= now), false, "받을 수 있는 쿠폰이 없습니다")}
      </SectionBlock>
      <SectionBlock title="종료된 쿠폰">
        {renderSection(coupons.filter((c) => c.expireAt < now), true, "종료된 쿠폰이 없습니다")}
      </SectionBlock>
    </>
  );
}
