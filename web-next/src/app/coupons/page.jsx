import PageShell from "@/components/layout/PageShell.jsx";
import SectionBlock from "@/components/section/SectionBlock.jsx";
import StateBox from "@/components/stateBox/StateBox.jsx";
import CouponListVertical from "@/features/coupons/components/CouponListVertical.jsx";
import GuideAccordion from "@/components/guideAccordion/GuideAccordion.jsx";
import { GUIDES_BY_SLUG } from "@/features/guides/content/index.js";
import { fetchCoupons } from "@/features/coupons/api.js";
import { formatNow } from "@/lib/utils/dateUtils.js";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({ title: "쿠폰 모아보기", description: "컴투스 프로야구 최신 쿠폰 코드와 종료된 쿠폰 이력을 모아보는 페이지입니다.", path: "/coupons" });

// TODO(next-migration): AdSlot(COUPONS_LIST) 미이전
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
      <GuideAccordion guide={GUIDES_BY_SLUG["coupon-guide"]} />
      <SectionBlock title="최신 쿠폰">
        {renderSection(coupons.filter((c) => c.expireAt >= now), false, "받을 수 있는 쿠폰이 없습니다")}
      </SectionBlock>
      <SectionBlock title="종료된 쿠폰">
        {renderSection(coupons.filter((c) => c.expireAt < now), true, "종료된 쿠폰이 없습니다")}
      </SectionBlock>
    </>
  );
}
