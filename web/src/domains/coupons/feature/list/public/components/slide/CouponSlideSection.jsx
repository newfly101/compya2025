import React from "react";
import CouponCardSummary from "@/domains/coupons/feature/list/public/components/card/CouponCardSummary.jsx";
import { useCouponList } from "@/domains/coupons/feature/list/public/hooks/useCouponList.js";
import styles from "./CouponSlideSection.module.scss";

const CouponSlideSection = ({ limit = null }) => {
  const { activeCoupons } = useCouponList();

  if (!activeCoupons || activeCoupons.length === 0) return null;

  const visibleCoupons = limit
    ? activeCoupons.slice(0, limit)
    : activeCoupons;

  return (
    <div className={styles.couponScrollWrapper}>
      <div className={styles.couponScrollViewport}>
        <div className={styles.couponScrollTrack}>
          {activeCoupons.map(c => (
            <div key={c.id} className={styles.couponScrollItem}>
              <CouponCardSummary
                code={c.couponCode}
                rewardTitle={c.title}
                expireDate={c.expireAt}
                disabled={!c.couponCode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CouponSlideSection;
