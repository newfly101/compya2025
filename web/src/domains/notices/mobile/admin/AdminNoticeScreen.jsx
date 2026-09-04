import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminGetNoticeList,
  requestAdminUpdateNoticeVisible,
  requestAdminBulkDeleteNotices,
  requestAdminBulkUpdateNoticesVisible,
} from "@/domains/notices/store/admin/thunks.js";
import styles from "./AdminNoticeScreen.module.scss";

// v2 필터 두 줄 — "구분"(source 기준: 전체·사이트·공식) · "노출"(isVisible 기준: 전체·노출·숨김).
// 두 축은 서로 독립이라 각각 따로 필터링한다(쿠폰 어드민의 사용/노출 두 줄과 동일 원리).
const SRC_MATCH = {
  all: () => true,
  site: (n) => n.source === "INTERNAL",
  official: (n) => n.source === "EXTERNAL",
};

const SRC_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "site", label: "사이트" },
  { value: "official", label: "공식" },
];

const VIS_MATCH = {
  all: () => true,
  visible: (n) => !!n.isVisible,
  hidden: (n) => !n.isVisible,
};

const VIS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "visible", label: "노출" },
  { value: "hidden", label: "숨김" },
];

const dateOf = (n) => (n.publishedAt ?? n.createdAt ?? "").slice(0, 10);

// 어드민 셸(AdminShellScreen)의 공지 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 등록·수정은 모달이 아니라 별도 글쓰기 페이지(AdminNoticeWriteScreen)로 전환한다
// (핸드오프 § 6 — 공지만 갖는 유일한 예외, 커뮤니티 게시판 재사용 전제).
//
// v2: 행에 삭제 버튼 없음(체크박스 일괄 삭제로 이동), 상단 고정은 목록에서 바로 켜고 끄지 않고
// 글쓰기(수정) 페이지의 토글로만 바꾼다 — 목록에는 고정된 공지에 한해 "상단 고정" 캡션만 표시.
export default function AdminNoticeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { siteNotices, loading, error } = useSelector((s) => s.notices);

  const [search, setSearch] = useState("");
  const [src, setSrc] = useState("all");
  const [vis, setVis] = useState("all");
  const [sortAsc, setSortAsc] = useState(false); // 기본: 등록일 최신순
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(requestAdminGetNoticeList());
  }, [dispatch]);

  const searched = siteNotices.filter((n) => n.title?.toLowerCase().includes(search.toLowerCase()));

  const srcOptions = SRC_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((n) => SRC_MATCH[opt.value](n) && VIS_MATCH[vis](n)).length,
  }));

  const visOptions = VIS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((n) => VIS_MATCH[opt.value](n) && SRC_MATCH[src](n)).length,
  }));

  const filtered = searched
    .filter((n) => SRC_MATCH[src](n) && VIS_MATCH[vis](n))
    .sort((a, b) => {
      const da = dateOf(a);
      const db = dateOf(b);
      return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
    });

  // 번호식 페이지네이션(8개/페이지, 클라이언트 슬라이스) — 검색/필터/정렬이 바뀌면 1페이지로.
  const { page, pageCount, pageItems, setPage, resetPage } = useAdminPagination(filtered, 8);
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, src, vis, sortAsc]);

  // 현재 페이지에 없는 행의 선택은 자동으로 떨어져 나간다(다음 페이지 이동 시 실수 방지).
  const pageIds = useMemo(() => new Set(pageItems.map((n) => n.id)), [pageItems]);
  const selectedOnPageCount = pageItems.filter((n) => selectedIds.has(n.id)).length;
  const allSelectedOnPage = pageItems.length > 0 && selectedOnPageCount === pageItems.length;

  const toggleRow = (notice) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(notice.id)) next.delete(notice.id);
      else next.add(notice.id);
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

  // 일괄 삭제·숨김 — 삭제는 되돌릴 수 없어 확인 다이얼로그를 거친다. 숨김은 언제든 다시 켤 수 있어 바로 실행.
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    dispatch(requestAdminBulkDeleteNotices([...selectedIds]));
    setSelectedIds(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  const handleBulkHide = () => {
    if (selectedIds.size === 0) return;
    dispatch(requestAdminBulkUpdateNoticesVisible({ ids: [...selectedIds], visible: false }));
    setSelectedIds(new Set());
  };

  const handleToggleVisible = (n, next) => {
    dispatch(requestAdminUpdateNoticeVisible({ id: n.id, visible: next }));
  };

  // v2: 행 번호(#) 칸 추가, 노출 칸은 헤더 라벨 없이 토글만, 관리 칸은 수정 버튼만.
  const columns = [
    {
      key: "idx",
      label: "#",
      width: 22,
      render: (_n, index) => <span className={styles.idx}>{page * 8 + index + 1}</span>,
    },
    {
      key: "title",
      label: "공지",
      align: "left",
      render: (n) => (
        <div className={styles.mainCell}>
          <div className={styles.titleRow}>
            <AdminTag variant={n.source === "EXTERNAL" ? "green" : "purple"}>
              {n.source === "EXTERNAL" ? "공식" : "사이트"}
            </AdminTag>
            <span className={styles.title}>{n.title}</span>
          </div>
          {n.isPinned && <span className={styles.pinnedCaption}>상단 고정</span>}
        </div>
      ),
    },
    {
      key: "date",
      label: "등록일",
      width: 72,
      render: (n) => <span className={styles.dateCell}>{dateOf(n) || "-"}</span>,
    },
    {
      key: "isVisible",
      label: "",
      width: 42,
      render: (n) => (
        <AdminToggleSwitch
          checked={n.isVisible}
          onChange={(next) => handleToggleVisible(n, next)}
          label={`${n.title} 노출 여부`}
        />
      ),
    },
    {
      key: "actions",
      label: "관리",
      width: 56,
      render: (n) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTE_PATHS.admin_notice_write_edit(n.id));
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
        searchPlaceholder="공지 제목 검색"
        filters={[
          { key: "src", label: "구분", options: srcOptions, value: src, onChange: setSrc },
          { key: "vis", label: "노출", options: visOptions, value: vis, onChange: setVis },
        ]}
        totalCount={filtered.length}
        totalLabel="개"
        sortLabel={sortAsc ? "등록일 오래된순" : "등록일 최신순"}
        onToggleSort={() => setSortAsc((prev) => !prev)}
        onCreate={() => navigate(ROUTE_PATHS.admin_notice_write)}
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
          onRetry={() => dispatch(requestAdminGetNoticeList())}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <AdminStateBox status="empty" message="공지가 없습니다." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <>
          <AdminTable
            columns={columns}
            rows={pageItems}
            rowKey={(n) => n.id}
            selectable
            selectedKeys={selectedIds}
            allSelected={allSelectedOnPage}
            onToggleRow={toggleRow}
            onToggleAll={toggleAllOnPage}
          />
          <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
      )}

      <AdminConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="공지 일괄 삭제"
        message={`선택한 공지 ${selectedIds.size}개를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
}
