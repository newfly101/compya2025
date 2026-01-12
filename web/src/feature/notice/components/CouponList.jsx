import React, { useMemo } from "react";
import CouponCard from "@/feature/notice/components/cards/CouponCard.jsx";
import styles from "@/styles/layout/CouponCard.module.scss";

import { parseDate } from "@/utils/parseDate.js";
import { sortCoupons } from "@/utils/sortCoupons.js";

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
    <div>{!short && "🎁 쿠폰 리스트"}
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
    </div>
  );
};

export default CouponList;
