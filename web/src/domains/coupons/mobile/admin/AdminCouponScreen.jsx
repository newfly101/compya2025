import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
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

const VISIBLE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "visible", label: "노출" },
  { value: "hidden", label: "숨김" },
];

const COLUMNS = [
  { key: "title", label: "제목", align: "left" },
  { key: "couponCode", label: "쿠폰코드" },
  {
    key: "expireAt",
    label: "만료일",
    render: (c) => c.expireAt?.slice(0, 10) ?? "-",
  },
  {
    key: "visible",
    label: "노출여부",
    render: (c) => (c.visible ? "노출" : "숨김"),
  },
];

const formOf = (coupon) => ({
  title: coupon.title ?? "",
  couponCode: coupon.couponCode ?? "",
  discountType: coupon.discountType ?? "FIXED",
  discountValue: coupon.discountValue ?? "",
  minOrderAmount: coupon.minOrderAmount ?? "",
  expireAt: coupon.expireAt?.slice(0, 10) ?? "",
  visible: coupon.visible ?? true,
});

export default function AdminCouponScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((s) => s.coupon);

  useSetTopBar({ variant: "page", title: "쿠폰 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

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

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    openCreate();
  };

  const handleOpenEdit = (coupon) => {
    setForm(formOf(coupon));
    openEdit(coupon);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleDelete = (coupon) => setDeleteTarget(coupon);

  const confirmDelete = () => {
    if (deleteTarget) dispatch(requestAdminDeleteCoupon(deleteTarget.id));
    setDeleteTarget(null);
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
    closeModal();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const columns = [
    ...COLUMNS,
    {
      key: "actions",
      label: "관리",
      render: (c) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(c);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(c);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="제목 또는 코드 검색"
        filters={[
          {
            key: "visible",
            options: VISIBLE_OPTIONS,
            value: visibleFilter,
            onChange: setVisibleFilter,
          },
        ]}
        onCreate={handleOpenCreate}
        createLabel="쿠폰 등록"
      />

      {loading && <AdminStateBox status="loading" />}
      {!loading && error && (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestGetAdminCouponList())}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <AdminStateBox status="empty" message="쿠폰이 없습니다." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <AdminTable columns={columns} rows={filtered} rowKey={(c) => c.id} />
      )}

      <AdminModal open={isOpen} title={editTarget ? "쿠폰 수정" : "쿠폰 등록"} onClose={closeModal}>
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
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="쿠폰 삭제"
        message={`"${deleteTarget?.title ?? ""}" 쿠폰을 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
