import React from "react";
import CouponCard from "@/domains/coupons/feature/components/user/CouponCard.jsx";
import styles from "./CouponList.module.scss";

import { useCouponListUser } from "@/domains/coupons/feature/hooks/user/useCouponListUser.js";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

const CouponList = ({ limit = null, short = false }) => {
  const { coupons, activeCoupons, expireCoupons, shortCoupons } = useCouponListUser();

  // const finalList = useMemo(() => {
  //   const sorted = sortCoupons(data);
  //
  //   const filtered = short
  //     ? sorted.filter(
  //       (item) => parseDate(item.expireDate) >= now
  //     )
  //     : sorted;
  //
  //   return limit ? filtered.slice(0, limit) : filtered;
  // }, [data, limit, short]);

  if (coupons.length === 0) return null;

  return (
    <section aria-labelledby="coupon-list-title">
      <h3 id="coupon-list-title">{!short && "🎁 쿠폰 리스트"}</h3>
      <div className={`${short ? styles.shortGrid : styles.grid}`}>
        {activeCoupons.map((c) => {
          return (
            <CouponCard
              key={c.id}
              code={c.couponCode}
              rewardTitle={c.title}
              rewardDetail={c.detail}
              expireDate={c.expireAt}
              disabled={dateUtils.expired(c.expireAt) || c.couponCode.length === 0}
              short={short}
            />
          );
        })}
      </div>

      {!short && (
        <section aria-labelledby="expired-coupon-list-title">
          <h3 id="expired-coupon-list-title">🎉 종료된 쿠폰 리스트</h3>
          <div className={styles.grid}>
            {expireCoupons.map((c) => (
              <CouponCard
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
    </section>
  );
};

export default CouponList;
