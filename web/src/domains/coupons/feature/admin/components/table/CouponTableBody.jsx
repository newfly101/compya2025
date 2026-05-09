import React from "react";
import { COUPON_TABLE } from "@/domains/coupons/config/couponTable.config.js";
import VisibleToggle from "@/domains/admin/feature/components/toggle/VisibleToggle.jsx";

const cellEllipsis = {
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const CouponTableBody = ({ coupons, changeVisible, setEditCoupon }) => {
  if (!coupons || coupons.length === 0) {
    return (
      <tr>
        <td colSpan={COUPON_TABLE.length} style={{ textAlign: "center", padding: 24 }}>
          등록된 쿠폰이 없습니다.
        </td>
      </tr>
    );
  }

  return coupons.map((c) => (
    <tr key={c.id}>
      <td>{c.id}</td>
      <td>{c.couponCode}</td>
      <td style={cellEllipsis} title={c.title}>{c.title}</td>
      <td style={cellEllipsis} title={c.detail}>{c.detail}</td>
      <td>{c.expireAt}</td>
      <td>
        <VisibleToggle visible={c.visible} onChange={changeVisible(c.id)} />
      </td>
      <td>
        <button onClick={() => setEditCoupon(c)}>수정</button>
      </td>
    </tr>
  ));
};

export default CouponTableBody;
