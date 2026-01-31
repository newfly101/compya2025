import React from "react";
import styles from "./CouponTable.module.scss";
import EventVisibilityToggle from "@/domains/events/feature/components/user/support/EventVisibilityToggle.jsx";
import { EVENT_TABLE } from "@/domains/events/config/eventTable.config.js";

const CouponTableBody = ({ coupons, isExpired, changeVisible, setEditCoupon }) => {

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
        <td>{!isExpired ? "사용 가능" : "만료"}</td>
        <td><EventVisibilityToggle visible={c.visible} onChange={changeVisible(c.id)} /></td>
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
