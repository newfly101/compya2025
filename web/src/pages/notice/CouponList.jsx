import React from "react";
import CouponCard from "@/components/common/CouponCard.jsx";
import styles from "@/styles/layout/CouponCard.module.scss";

import { parseDate } from "@/utils/parseDate.js";
import { sortCoupons } from "@/utils/sortCoupons.js";

const CouponList = ({data}) => {
  const sorted = sortCoupons(data);
  const now = new Date();

  return (
    <div>🎁 쿠폰 리스트
      <div className={styles.listGrid}>
        {sorted.map((item) => {
          const expired = parseDate(item.expireDate) < now;

          console.log(parseDate(item.expireDate), now);

          return (
            <CouponCard
              key={item.code}
              code={item.code}
              rewardTitle={item.rewardTitle}
              rewardDetail={item.rewardDetail}
              expireDate={item.expireDate}
              disabled={expired}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CouponList;
