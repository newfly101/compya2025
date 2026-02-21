import React from "react";
import styles from "./CouponTable.module.scss";
import { EVENT_TABLE } from "@/domains/events/config/eventTable.config.js";
import VisibleToggle from "@/domains/admin/feature/components/toggle/VisibleToggle.jsx";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

const CouponTableBody = ({ coupons, changeVisible, setEditCoupon }) => {

  if (coupons.length === 0) {
    return (
      <tr>
        <td colSpan={EVENT_TABLE.length} className={styles.empty}>
          등록된 쿠폰이 없습니다.
        </td>
      </tr>
    );
  }

  return (
    coupons.map(c => (
      <tr key={c.id}>
        <td>{c.id}</td>
        <td>{c.couponCode}</td>
        <td>{c.title}</td>
        <td>
          <div className={styles.detail}>
            {c.detail}
          </div>
        </td>
        <td>{c.expireAt}</td>
        <td>{!dateUtils.expired(c.expireAt) ? "사용 가능" : "만료"}</td>
        <td><VisibleToggle visible={c.visible} onChange={changeVisible(c.id)} /></td>
        <td>
          <div className={styles.actions}>
            <button onClick={() => setEditCoupon(c)}>수정</button>
          </div>
        </td>
      </tr>
    ))
  );
};

export default CouponTableBody;
