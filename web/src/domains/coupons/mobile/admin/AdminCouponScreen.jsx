import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import {
  requestGetAdminCouponList,
  requestAdminInsertNewCoupon,
  requestAdminUpdateCoupon,
  requestAdminDeleteCoupon,
} from "@/domains/coupons/store/admin/thunks.js";
import styles from "./AdminCouponScreen.module.scss";

const EMPTY_FORM = {
  title: "",
  couponCode: "",
  discountType: "FIXED",
  discountValue: "",
  minOrderAmount: "",
  expireAt: "",
  visible: true,
};

export default function AdminCouponScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((s) => s.coupon);

  useSetTopBar({ variant: "page", title: "쿠폰 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(requestGetAdminCouponList());
  }, [dispatch]);

  const filtered = coupons.filter((c) => {
    const matchSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.couponCode?.toLowerCase().includes(search.toLowerCase());
    const matchVisible =
      visibleFilter === "all" ||
      (visibleFilter === "visible" && c.visible) ||
      (visibleFilter === "hidden" && !c.visible);
    return matchSearch && matchVisible;
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const openEdit = (coupon) => {
    setEditTarget(coupon);
    setForm({
      title: coupon.title ?? "",
      couponCode: coupon.couponCode ?? "",
      discountType: coupon.discountType ?? "FIXED",
      discountValue: coupon.discountValue ?? "",
      minOrderAmount: coupon.minOrderAmount ?? "",
      expireAt: coupon.expireAt?.slice(0, 10) ?? "",
      visible: coupon.visible ?? true,
    });
    setSheetOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("쿠폰을 삭제하시겠습니까?")) return;
    dispatch(requestAdminDeleteCoupon(id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
    };
    if (editTarget) {
      dispatch(requestAdminUpdateCoupon({ id: editTarget.id, ...payload }));
    } else {
      dispatch(requestAdminInsertNewCoupon(payload));
    }
    setSheetOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* 상태 분기 */
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateError}>{error}</p>
          <button className={styles.retryBtn} onClick={() => dispatch(requestGetAdminCouponList())}>
            다시 시도
          </button>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>쿠폰이 없습니다.</p>
        </div>
      );
    }
    return (
      <ul className={styles.list}>
        {filtered.map((c) => (
          <li key={c.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{c.title}</span>
              <span className={`${styles.chip} ${c.visible ? styles.chipOn : styles.chipOff}`}>
                {c.visible ? "노출" : "숨김"}
              </span>
            </div>
            <p className={styles.cardCode}>{c.couponCode}</p>
            <p className={styles.cardExpire}>만료: {c.expireAt?.slice(0, 10) ?? "-"}</p>
            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => openEdit(c)}>수정</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>삭제</button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.page}>
      {/* 검색 + 필터 */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="제목 또는 코드 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterChips}>
          {["all", "visible", "hidden"].map((v) => (
            <button
              key={v}
              className={`${styles.chip} ${visibleFilter === v ? styles.chipActive : ""}`}
              onClick={() => setVisibleFilter(v)}
            >
              {v === "all" ? "전체" : v === "visible" ? "노출" : "숨김"}
            </button>
          ))}
        </div>
      </div>

      {/* 등록 버튼 */}
      <div className={styles.addRow}>
        <button className={styles.addBtn} onClick={openCreate}>+ 쿠폰 등록</button>
      </div>

      {renderContent()}

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div className={styles.overlay} onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.sheetTitle}>{editTarget ? "쿠폰 수정" : "쿠폰 등록"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                제목
                <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                쿠폰코드
                <input className={styles.input} name="couponCode" value={form.couponCode} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                할인타입
                <select className={styles.input} name="discountType" value={form.discountType} onChange={handleFormChange}>
                  <option value="FIXED">정액</option>
                  <option value="PERCENT">정률</option>
                </select>
              </label>
              <label className={styles.label}>
                할인값
                <input className={styles.input} type="number" name="discountValue" value={form.discountValue} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                최소주문금액
                <input className={styles.input} type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleFormChange} />
              </label>
              <label className={styles.label}>
                만료일
                <input className={styles.input} type="date" name="expireAt" value={form.expireAt} onChange={handleFormChange} required />
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="visible" checked={form.visible} onChange={handleFormChange} />
                노출 여부
              </label>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSheetOpen(false)}>취소</button>
                <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
