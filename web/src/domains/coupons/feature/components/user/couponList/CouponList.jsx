import React, { useMemo } from "react";
import CouponCard from "@/domains/coupons/feature/components/user/CouponCard.jsx";
import styles from "./CouponList.module.scss";

import { parseDate } from "@/global/utils/parseDate.js";
import { sortCoupons } from "@/global/utils/sortCoupons.js";

const CouponList = ({data, limit, short=false}) => {
  const now = new Date();

  const finalList = useMemo(() => {
    const sorted = sortCoupons(data);

    const filtered = short
      ? sorted.filter(
        (item) => parseDate(item.expireDate) >= now
      )
      : sorted;

    return limit ? filtered.slice(0, limit) : filtered;
  }, [data, limit, short]);

  return (
    <section aria-labelledby="coupon-list-title">
      <h3 id="coupon-list-title">{!short && "🎁 쿠폰 리스트"}</h3>
      <div className={`${short ? styles.shortListGrid : styles.listGrid}`}>
        {finalList.map((item) => {
          const expired = parseDate(item.expireDate) < now;
          return (
            <CouponCard
              key={item.code}
              code={item.code}
              rewardTitle={item.rewardTitle}
              rewardDetail={item.rewardDetail}
              expireDate={item.expireDate}
              disabled={expired || item.code.length === 0}
              short={short}
            />
          );
        })}
      </div>
    </section>
  );
};

export default CouponList;
