import React from "react";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import CouponListVertical from "@/domains/coupons/containers/public/CouponListVertical.jsx";
import { MOCK_COUPONS2 } from "@/domains/home/config/MOCK_COUPONS.js";

const CouponScreen = () => {
  const coupons = MOCK_COUPONS2;
  return (
      <>
        <SectionBlock title="최신 쿠폰">
          <CouponListVertical
            coupons={coupons.filter((coupon) => !coupon.isExpired)}
            isExpired={false}
          />
        </SectionBlock>

        <SectionBlock title="종료된 쿠폰">
          <CouponListVertical
            coupons={coupons.filter((coupon) => coupon.isExpired)}
            isExpired={true}
          />
        </SectionBlock>
      </>
  );
};

export default CouponScreen;
