import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import {
  requestAdminGetNoticeList,
  requestAdminUpdateNoticeVisible,
  requestAdminUpdateNoticePinned,
  requestAdminDeleteNotice,
} from "@/domains/notices/store/admin/thunks.js";
import styles from "./AdminNoticeScreen.module.scss";

// 프로토타입 § 4 공지 칩: 전체 · 사이트 공지 · 공식 링크 · 고정.
const CHIP_MATCH = {
  all: () => true,
  site: (n) => n.source === "INTERNAL",
  official: (n) => n.source === "EXTERNAL",
  pinned: (n) => n.isPinned,
};

const CHIP_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "site", label: "사이트 공지" },
  { value: "official", label: "공식 링크" },
  { value: "pinned", label: "고정" },
];

const dateOf = (n) => (n.publishedAt ?? n.createdAt ?? "").slice(0, 10);

// 어드민 셸(AdminShellScreen)의 공지 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 등록·수정은 모달이 아니라 별도 글쓰기 페이지(AdminNoticeWriteScreen)로 전환한다
// (핸드오프 § 6 — 공지만 갖는 유일한 예외, 커뮤니티 게시판 재사용 전제).
export default function AdminNoticeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { siteNotices, loading, error } = useSelector((s) => s.notices);

  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("all");
  const [sortAsc, setSortAsc] = useState(false); // 기본: 등록일 최신순
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(requestAdminGetNoticeList());
  }, [dispatch]);

  const searched = siteNotices.filter((n) => n.title?.toLowerCase().includes(search.toLowerCase()));

  const chipOptions = CHIP_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter(CHIP_MATCH[opt.value]).length,
  }));

  const filtered = [...searched.filter(CHIP_MATCH[chip])].sort((a, b) => {
    const da = dateOf(a);
    const db = dateOf(b);
    return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
  });

  const handleDelete = (notice) => setDeleteTarget(notice);

  const confirmDelete = () => {
    if (deleteTarget) dispatch(requestAdminDeleteNotice(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleToggleVisible = (n, next) => {
    dispatch(requestAdminUpdateNoticeVisible({ id: n.id, visible: next }));
  };

  const handleTogglePinned = (n) => {
    dispatch(requestAdminUpdateNoticePinned({ id: n.id, pinned: !n.isPinned }));
  };

  const columns = [
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
          <button
            type="button"
            className={`${styles.pinnedToggle} ${n.isPinned ? styles.pinnedOn : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePinned(n);
            }}
          >
            {n.isPinned ? "상단 고정" : "고정하기"}
          </button>
        </div>
      ),
    },
    {
      key: "date",
      label: "등록일",
      width: 88,
      render: (n) => dateOf(n) || "-",
    },
    {
      key: "isVisible",
      label: "노출",
      width: 44,
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
      width: 88,
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
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(n);
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
        searchPlaceholder="공지 제목 검색"
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
        sortLabel={sortAsc ? "등록일 오래된순" : "등록일 최신순"}
        onToggleSort={() => setSortAsc((prev) => !prev)}
        onCreate={() => navigate(ROUTE_PATHS.admin_notice_write)}
        createLabel="공지 등록"
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
        <AdminTable columns={columns} rows={filtered} rowKey={(n) => n.id} />
      )}

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="공지 삭제"
        message={`"${deleteTarget?.title ?? ""}" 공지를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
