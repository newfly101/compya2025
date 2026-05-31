import React from "react";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import CouponListVertical from "@/domains/coupons/mobile/containers/public/CouponListVertical.jsx";
import { useCouponList } from "@/domains/coupons/mobile/hooks/useCouponList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";

const CouponScreen = () => {
  useDomainTopBar("쿠폰");
  const { activeCoupon, expiredCoupon } = useCouponList();
  return (
      <>
        <SectionBlock title="최신 쿠폰">
          <CouponListVertical
            coupons={activeCoupon}
            isExpired={false}
          />
        </SectionBlock>

        <SectionBlock title="종료된 쿠폰">
          <CouponListVertical
            coupons={expiredCoupon}
            isExpired={true}
          />
        </SectionBlock>
      </>
  );
};

export default CouponScreen;
