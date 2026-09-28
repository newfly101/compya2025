import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
import { formatNow, normalizeHHMM, toHHMMSS } from "@/global/utils/datetime/dateUtils.js";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestGetAdminCouponList,
  requestAdminInsertNewCoupon,
  requestAdminUpdateCoupon,
  requestAdminUpdateCouponVisible,
  requestAdminBulkDeleteCoupons,
  requestAdminBulkUpdateCouponsVisible,
  requestAdminRefreshCoupons,
} from "@/domains/coupons/store/admin/thunks.js";
import styles from "./AdminCouponScreen.module.scss";

// 만료 시각을 비워두면 "그날 끝"(23:59:59) 으로 본다 — 날짜만 보내고 서버가 채운다.
// 응답·폼 모두 초 단위라 편집 시 원본 시각이 그대로 채워지고, 다른 필드만 고쳐 저장해도 시각이 밀리지 않는다.
const END_OF_DAY_TIME = "23:59:59";

// 서버 CouponRequest 와 일치하는 필드만 다룬다. 만료는 날짜·시각 두 칸으로 받아 전송 직전에 합친다.
const EMPTY_FORM = {
  couponCode: "",
  title: "",
  detail: "",
  expireDate: "",
  expireTime: "",
  visible: true,
};

// 시각을 비우면 날짜만 보낸다(서버가 그날 끝으로 채움). 넣으면 HH:MM 을 저장용 HH:MM:SS 로 변환.
const toExpireAt = ({ expireDate, expireTime }) =>
  expireDate ? (expireTime ? `${expireDate} ${toHHMMSS(expireTime)}` : expireDate) : "";

// v2 필터 두 줄 — "사용"(만료 기준: 전체·사용가능·만료) · "노출"(visible 기준: 전체·노출·숨김).
// 두 축은 서로 독립이라 각각 따로 필터링한다(예: 만료됐지만 아직 노출 중인 쿠폰도 존재 가능).
// 만료 판정은 공개 화면(useCouponList)과 같은 기준을 쓴다 — KST "yyyy-MM-dd HH:mm:ss" 문자열 초 단위
// 비교. 날짜 단위로 자르거나 UTC 기준일을 쓰면 같은 쿠폰이 어드민·공개에서 다르게 보인다.
const isExpired = (coupon, now) => !!coupon.expireAt && coupon.expireAt < now;

const USAGE_MATCH = {
  all: () => true,
  usable: (c, now) => !isExpired(c, now),
  expired: (c, now) => isExpired(c, now),
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

const formOf = (coupon) => {
  const expireAt = coupon.expireAt ?? "";

  return {
    couponCode: coupon.couponCode ?? "",
    title: coupon.title ?? "",
    detail: coupon.detail ?? "",
    expireDate: expireAt.slice(0, 10),
    // 화면엔 HH:mm 만 보여준다(초는 저장 시 toHHMMSS 가 다시 붙인다 — 23:59 는 23:59:59, 그 밖엔 :00).
    expireTime: expireAt.slice(11, 16),
    visible: coupon.visible ?? true,
  };
};

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
  const [bulkNotice, setBulkNotice] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestGetAdminCouponList());
  }, [dispatch]);

  // 만료 판정 기준 시각 — 공개 화면과 같은 KST 초 단위 문자열.
  const now = formatNow();

  const searched = coupons.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.couponCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const usageOptions = USAGE_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((c) => USAGE_MATCH[opt.value](c, now) && VIS_MATCH[vis](c)).length,
  }));

  const visOptions = VIS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((c) => VIS_MATCH[opt.value](c) && USAGE_MATCH[usage](c, now)).length,
  }));

  const filtered = searched
    .filter((c) => USAGE_MATCH[usage](c, now) && VIS_MATCH[vis](c))
    .sort((a, b) => {
      const da = a.expireAt ?? "";
      const db = b.expireAt ?? "";
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

  // 일괄 삭제·숨김 — 서버는 둘 다 is_visible=false 로 처리한다("삭제" 도 행을 지우지 않는다).
  // 삭제 쪽만 확인 다이얼로그를 거치고, 숨김은 언제든 다시 켤 수 있어 바로 실행.
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  // 서버는 존재하지 않는 id 를 failedIds 로 분리해 돌려준다 — 부분 실패를 성공으로 보이게 두면
  // 관리자는 전부 처리된 줄 안다. 처리 못한 건수를 반드시 알린다.
  const noticeBulkResult = ({ successIds, failedIds }, doneLabel) => {
    if (failedIds.length === 0) return;
    setBulkNotice(
      `${successIds.length}개를 ${doneLabel}. ${failedIds.length}개는 이미 없는 쿠폰이라 처리하지 못했습니다 — 목록을 새로 불러오세요.`,
    );
  };

  // .unwrap() 없이 dispatch 만 하면 실패해도 선택만 조용히 풀리고 아무 표시가 없다 — 결과를
  // bulkNotice 로 보여준다(이벤트 화면과 동일 패턴).
  const confirmBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkDeleteConfirmOpen(false);
    setSelectedIds(new Set());
    try {
      noticeBulkResult(await dispatch(requestAdminBulkDeleteCoupons(ids)).unwrap(), "내렸습니다");
    } catch (err) {
      setBulkNotice(typeof err === "string" ? err : "일괄 내리기에 실패했습니다.");
    }
  };

  const handleBulkHide = async () => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    setSelectedIds(new Set());
    try {
      const result = await dispatch(
        requestAdminBulkUpdateCouponsVisible({ ids, visible: false }),
      ).unwrap();
      noticeBulkResult(result, "숨겼습니다");
    } catch (err) {
      setBulkNotice(typeof err === "string" ? err : "일괄 숨김 처리에 실패했습니다.");
    }
  };

  // 캐시 동기화 — 운영자가 DB 에 직접 넣은 row 를 재시작 없이 즉시 반영한다.
  const handleRefresh = () => {
    dispatch(requestAdminRefreshCoupons());
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setSubmitError(null);
    openCreate();
  };

  const handleOpenEdit = (coupon) => {
    setForm(formOf(coupon));
    setSubmitError(null);
    openEdit(coupon);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleToggleVisible = (coupon, nextVisible) => {
    dispatch(requestAdminUpdateCouponVisible({ id: coupon.id, visible: nextVisible }));
  };

  // .unwrap() 없이 dispatch 만 하면 서버가 400/500 을 줘도 모달이 그냥 닫혀 저장 성공처럼
  // 보인다 — 성공했을 때만 모달을 닫고, 실패하면 입력값을 유지한 채 에러를 보여준다.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    // 날짜·시각 두 칸을 서버 필드(expireAt) 하나로 합친다 — 시각을 비우면 그날 끝(23:59:59).
    const { expireDate, expireTime, ...rest } = form;
    const payload = { ...rest, expireAt: toExpireAt({ expireDate, expireTime }) };
    setSubmitError(null);
    setSaving(true);
    try {
      if (editTarget) {
        await dispatch(requestAdminUpdateCoupon({ id: editTarget.id, ...payload })).unwrap();
      } else {
        await dispatch(requestAdminInsertNewCoupon(payload)).unwrap();
      }
      closeModal();
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : err?.message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
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
          {/* 그날 끝(23:59:59)이 아닌 시각이 지정된 쿠폰만 시각을 함께 보여준다 — 표시는 분 단위까지 */}
          {c.expireAt?.slice(11, 19) && c.expireAt.slice(11, 19) !== END_OF_DAY_TIME && (
            <span>{c.expireAt.slice(11, 16)}</span>
          )}
          {isExpired(c, now) && <AdminTag variant="rose">만료</AdminTag>}
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
        bulkDeleteLabel="선택 내리기"
        onRefresh={handleRefresh}
        refreshing={loading}
      />

      {bulkNotice && (
        <div className={styles.bulkNotice}>
          <span>{bulkNotice}</span>
          <button type="button" onClick={() => setBulkNotice(null)} aria-label="닫기">
            ×
          </button>
        </div>
      )}

      {loading && <StateBox status="loading" message="불러오는 중..." />}
      {!loading && error && (
        <StateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestGetAdminCouponList())}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <StateBox status="empty" message="쿠폰이 없습니다." />
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
            쿠폰 코드
            <input className={styles.inputCode} name="couponCode" value={form.couponCode} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            쿠폰 제목
            <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            쿠폰 설명
            <textarea className={styles.textarea} name="detail" value={form.detail} onChange={handleFormChange} rows={4} />
          </label>
          <label className={styles.label}>
            만료일
            <input className={styles.input} type="date" name="expireDate" value={form.expireDate} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            만료 시각 (비우면 그날 23:59:59)
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="23:59"
              pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
              title="24시간 형식 HH:MM (예: 23:59)"
              name="expireTime"
              value={form.expireTime}
              onChange={(e) => setForm((prev) => ({ ...prev, expireTime: normalizeHHMM(e.target.value) }))}
            />
          </label>
          <div className={styles.toggleRow}>
            <span>노출 여부</span>
            <AdminToggleSwitch
              checked={form.visible}
              onChange={(next) => setForm((prev) => ({ ...prev, visible: next }))}
              label="노출 여부"
            />
          </div>
          {submitError && <p className={styles.submitError}>{submitError}</p>}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? "저장 중..." : editTarget ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="쿠폰 일괄 내리기"
        message={`선택한 쿠폰 ${selectedIds.size}개를 목록에서 내립니다(노출 끄기). 행은 남고 쿠폰 코드도 계속 점유하므로 같은 코드로 새로 등록할 수 없습니다.`}
        confirmLabel="내리기"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
}
