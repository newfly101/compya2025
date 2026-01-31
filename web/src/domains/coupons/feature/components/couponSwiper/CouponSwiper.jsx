import { CardSwiper } from "@/global/ui/cardSwiper/index.js";
import { SwiperSlide } from "swiper/react";
import React from "react";
import { useCouponListUser } from "@/domains/coupons/feature/hooks/user/useCouponListUser.js";
import CouponCard from "@/domains/coupons/feature/components/user/CouponCard.jsx";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

const CouponSwiper = (short = false) => {
  const { activeCoupons } = useCouponListUser();

  if (activeCoupons.length === 0) return null;

  return (
    <CardSwiper>
      {activeCoupons.map(c => (
        <SwiperSlide key={c.id}>
          <CouponCard
            key={c.id}
            code={c.couponCode}
            rewardTitle={c.title}
            rewardDetail={c.detail}
            expireDate={c.expireAt}
            disabled={dateUtils.expired(c.expireAt) || c.couponCode.length === 0}
            short={short}
          />
        </SwiperSlide>
      ))}
    </CardSwiper>
  );
};

export default CouponSwiper;
