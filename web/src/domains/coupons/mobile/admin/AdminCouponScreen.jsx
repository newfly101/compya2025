import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
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
  requestAdminBulkDeleteCoupons,
  requestAdminBulkUpdateCouponsVisible,
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

// v2 필터 두 줄 — "사용"(만료일 기준: 전체·사용가능·만료) · "노출"(visible 기준: 전체·노출·숨김).
// 두 축은 서로 독립이라 각각 따로 필터링한다(예: 만료됐지만 아직 노출 중인 쿠폰도 존재 가능).
// 만료 판정은 서버 count API 가 없어 클라이언트에서 expireAt 비교로 처리한다.
const todayStr = () => new Date().toISOString().slice(0, 10);

const isExpired = (coupon) => {
  const d = coupon.expireAt?.slice(0, 10);
  return !!d && d < todayStr();
};

const USAGE_MATCH = {
  all: () => true,
  usable: (c) => !isExpired(c),
  expired: (c) => isExpired(c),
};

const USAGE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "usable", label: "사용가능" },
  { value: "expired", label: "만료" },
];

const VIS_MATCH = {
  all: () => true,
  visible: (c) => !!c.visible,
  hidden: (c) => !c.visible,
};

const VIS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "visible", label: "노출" },
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
  // v2 기본값 — 사용:사용가능 / 노출:전체 (스크린샷 기준 초기 진입 상태)
  const [usage, setUsage] = useState("usable");
  const [vis, setVis] = useState("all");
  const [sortAsc, setSortAsc] = useState(true); // 기본: 만료 임박순
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestGetAdminCouponList());
  }, [dispatch]);

  const searched = coupons.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.couponCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const usageOptions = USAGE_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((c) => USAGE_MATCH[opt.value](c) && VIS_MATCH[vis](c)).length,
  }));

  const visOptions = VIS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((c) => VIS_MATCH[opt.value](c) && USAGE_MATCH[usage](c)).length,
  }));

  const filtered = searched
    .filter((c) => USAGE_MATCH[usage](c) && VIS_MATCH[vis](c))
    .sort((a, b) => {
      const da = a.expireAt?.slice(0, 10) ?? "";
      const db = b.expireAt?.slice(0, 10) ?? "";
      return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
    });

  // 번호식 페이지네이션(8개/페이지, 클라이언트 슬라이스) — 검색/필터/정렬이 바뀌면 1페이지로.
  const { page, pageCount, pageItems, setPage, resetPage } = useAdminPagination(filtered, 8);
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, usage, vis, sortAsc]);

  // 현재 페이지에 없는 행의 선택은 자동으로 떨어져 나간다(다음 페이지 이동 시 실수 방지).
  const pageIds = useMemo(() => new Set(pageItems.map((c) => c.id)), [pageItems]);
  const selectedOnPageCount = pageItems.filter((c) => selectedIds.has(c.id)).length;
  const allSelectedOnPage = pageItems.length > 0 && selectedOnPageCount === pageItems.length;

  const toggleRow = (coupon) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(coupon.id)) next.delete(coupon.id);
      else next.add(coupon.id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (allSelectedOnPage ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  // 일괄 삭제·숨김 — 서버 일괄 API(DELETE /admin/coupons/bulk, PATCH /admin/coupons/bulk/visible)는
  // 다음 단계에서 연결된다. 호출 자리(thunk 디스패치)만 지금 배선해 둔다.
  // 삭제는 되돌릴 수 없어 확인 다이얼로그를 거친다 — 숨김은 언제든 다시 켤 수 있어 바로 실행.
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    dispatch(requestAdminBulkDeleteCoupons([...selectedIds]));
    setSelectedIds(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  const handleBulkHide = () => {
    if (selectedIds.size === 0) return;
    dispatch(requestAdminBulkUpdateCouponsVisible({ ids: [...selectedIds], visible: false }));
    setSelectedIds(new Set());
  };

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

  // v2: 행 번호(#) 칸 추가, 관리 칸은 수정 버튼만(삭제는 체크박스 일괄 삭제로 이동).
  const columns = [
    {
      key: "idx",
      label: "#",
      width: 22,
      render: (_c, index) => <span className={styles.idx}>{page * 8 + index + 1}</span>,
    },
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
      width: 70,
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
      width: 56,
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
          { key: "usage", label: "사용", options: usageOptions, value: usage, onChange: setUsage },
          { key: "vis", label: "노출", options: visOptions, value: vis, onChange: setVis },
        ]}
        totalCount={filtered.length}
        totalLabel="개"
        sortLabel={sortAsc ? "만료 임박순" : "만료 먼 순"}
        onToggleSort={() => setSortAsc((prev) => !prev)}
        onCreate={handleOpenCreate}
        createLabel="등록"
        selectedCount={selectedOnPageCount}
        onBulkDelete={handleBulkDelete}
        onBulkHide={handleBulkHide}
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
        <>
          <AdminTable
            columns={columns}
            rows={pageItems}
            rowKey={(c) => c.id}
            selectable
            selectedKeys={selectedIds}
            allSelected={allSelectedOnPage}
            onToggleRow={toggleRow}
            onToggleAll={toggleAllOnPage}
          />
          <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
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
        open={bulkDeleteConfirmOpen}
        title="쿠폰 일괄 삭제"
        message={`선택한 쿠폰 ${selectedIds.size}개를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
}
