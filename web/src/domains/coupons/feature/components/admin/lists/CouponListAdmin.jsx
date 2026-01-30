import React, { useEffect } from "react";
import styles from "./CouponListAdmin.module.scss";
import CouponCreateModal from "@/domains/coupons/feature/components/admin/modal/CouponCreateModal.jsx";
import EventVisibilityToggle from "@/domains/events/feature/components/user/support/EventVisibilityToggle.jsx";
import { useCouponListAdmin } from "@/domains/coupons/feature/hooks/admin/useCouponListAdmin.js";

const CouponListAdmin = () => {
  const { coupons, nowDate, handleVisibleChange } = useCouponListAdmin();
  const [open, setOpen] = React.useState(false);
  const [editCoupon, setEditCoupon] = React.useState(false);
  const hasCoupons = coupons.length > 0;

  return (
    <div className={styles.wrapper}>
      <button className={styles.create} onClick={() => setOpen(true)}>쿠폰 생성</button>

      <table className={styles.table}>
        <thead>
        <tr>
          <th>ID</th>
          <th>코드</th>
          <th>이름</th>
          <th>보상</th>
          <th>만료일</th>
          <th>상태</th>
          <th>노출</th>
          <th>액션</th>
        </tr>
        </thead>
        <tbody>
        {!hasCoupons && (
          <tr>
            <td colSpan={6} className={styles.empty}>
              등록된 쿠폰이 없습니다.
            </td>
          </tr>
        )}
        {hasCoupons && coupons.map(c => {
          const isExpired = new Date(c.expireAt) <= nowDate;
          return (
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
              <td><EventVisibilityToggle visible={c.visible} onChange={handleVisibleChange(c.id)} /></td>
              <td>
                <div className={styles.actions}>
                  <button onClick={() => setEditCoupon(c)}>수정</button>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>

      {
        open && <CouponCreateModal onClose={() => setOpen(false)} />}
    </div>
  );
};

export default CouponListAdmin;
