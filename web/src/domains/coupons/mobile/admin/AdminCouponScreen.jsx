import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestGetAdminCouponList,
  requestAdminInsertNewCoupon,
  requestAdminUpdateCoupon,
  requestAdminUpdateCouponVisible,
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

// 프로토타입 § 4 쿠폰 칩: 전체 · 사용가능 · 만료 · 숨김.
// 만료 판정은 서버 count API 가 없어 클라이언트에서 expireAt 비교로 처리한다.
const todayStr = () => new Date().toISOString().slice(0, 10);

const isExpired = (coupon) => {
  const d = coupon.expireAt?.slice(0, 10);
  return !!d && d < todayStr();
};

const CHIP_MATCH = {
  all: () => true,
  usable: (c) => c.visible && !isExpired(c),
  expired: (c) => isExpired(c),
  hidden: (c) => !c.visible,
};

const CHIP_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "usable", label: "사용가능" },
  { value: "expired", label: "만료" },
  { value: "hidden", label: "숨김" },
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

// 어드민 셸(AdminShellScreen)의 쿠폰 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 셸이 상단바(제목/로그아웃)를 한 번만 소유하고, 탭 전환은 뒤로가기가 아니라 탭 클릭으로 처리된다.
export default function AdminCouponScreen() {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((s) => s.coupon);

  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("all");
  const [sortAsc, setSortAsc] = useState(true); // 기본: 만료 임박순
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestGetAdminCouponList());
  }, [dispatch]);

  const searched = coupons.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.couponCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const chipOptions = CHIP_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter(CHIP_MATCH[opt.value]).length,
  }));

  const filtered = [...searched.filter(CHIP_MATCH[chip])].sort((a, b) => {
    const da = a.expireAt?.slice(0, 10) ?? "";
    const db = b.expireAt?.slice(0, 10) ?? "";
    return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
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

  const handleToggleVisible = (coupon, nextVisible) => {
    dispatch(requestAdminUpdateCouponVisible({ id: coupon.id, visible: nextVisible }));
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
    {
      key: "title",
      label: "쿠폰",
      align: "left",
      render: (c) => (
        <div className={styles.mainCell}>
          <span className={styles.title}>{c.title}</span>
          <span className={styles.code}>{c.couponCode}</span>
        </div>
      ),
    },
    {
      key: "expireAt",
      label: "만료",
      width: 96,
      render: (c) => (
        <div className={styles.expireCell}>
          <span>{c.expireAt?.slice(0, 10) ?? "-"}</span>
          {isExpired(c) && <AdminTag variant="rose">만료</AdminTag>}
        </div>
      ),
    },
    {
      key: "visible",
      label: "노출",
      width: 44,
      render: (c) => (
        <AdminToggleSwitch
          checked={c.visible}
          onChange={(next) => handleToggleVisible(c, next)}
          label={`${c.title} 노출 여부`}
        />
      ),
    },
    {
      key: "actions",
      label: "관리",
      width: 96,
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
            key: "chip",
            options: chipOptions,
            value: chip,
            onChange: setChip,
          },
        ]}
        totalCount={filtered.length}
        totalLabel="개"
        sortLabel={sortAsc ? "만료 임박순" : "만료 먼 순"}
        onToggleSort={() => setSortAsc((prev) => !prev)}
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
            쿠폰 제목
            <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            쿠폰 코드
            <input className={styles.inputCode} name="couponCode" value={form.couponCode} onChange={handleFormChange} required />
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
          <div className={styles.toggleRow}>
            <span>노출 여부</span>
            <AdminToggleSwitch
              checked={form.visible}
              onChange={(next) => setForm((prev) => ({ ...prev, visible: next }))}
              label="노출 여부"
            />
          </div>
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
