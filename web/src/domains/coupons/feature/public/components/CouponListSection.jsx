import React from "react";
import { useCouponList } from "@/domains/coupons/feature/public/hooks/useCouponList.js";
import styles from "./CouponListSection.module.scss";
import CouponCardDetail from "@/domains/coupons/feature/public/components/card/CouponCardDetail.jsx";

const CouponListSection = ({ limit = null }) => {
  const { activeCoupons, expiredCoupons } = useCouponList();

  const visibleActive = limit
    ? activeCoupons.slice(0, limit)
    : activeCoupons;

  return (
    <div className={styles.couponListWrapper}>

      <section className={styles.couponGroupSection}>
        <h3 className={styles.groupTitle}>🎁 쿠폰 리스트</h3>

        <div className={styles.couponGrid}>
          {visibleActive.map(c => (
            <CouponCardDetail
              key={c.id}
              code={c.couponCode}
              rewardTitle={c.title}
              rewardDetail={c.detail}
              expireDate={c.expireAt}
              disabled={!c.couponCode}
            />
          ))}
        </div>
      </section>

      {expiredCoupons && (
        <section className={styles.couponGroupSection}>
          <h3 className={styles.groupTitle}>🎉 종료된 쿠폰 리스트</h3>

          <div className={styles.couponGrid}>
            {expiredCoupons.map(c => (
              <CouponCardDetail
                key={c.id}
                code={c.couponCode}
                rewardTitle={c.title}
                rewardDetail={c.detail}
                expireDate={c.expireAt}
                disabled
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default CouponListSection;
