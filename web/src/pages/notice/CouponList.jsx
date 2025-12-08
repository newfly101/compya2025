import React from "react";
import CouponCard from "@/components/common/CouponCard.jsx";
import styles from "@/styles/layout/CouponCard.module.scss";

import { parseDate } from "@/utils/parseDate.js";
import { sortCoupons } from "@/utils/sortCoupons.js";

const CouponList = ({data, limit, short=false}) => {
  const sorted = sortCoupons(data);
  const now = new Date();

  const finalList = limit ? sorted.slice(0, limit) : sorted;
  console.log("finalList",finalList);

  return (
    <div>{!short && "🎁 쿠폰 리스트"}
      <div className={`${short ? styles.shortListGrid : styles.listGrid}`}>
        {finalList.map((item) => {
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
              short={short}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CouponList;
