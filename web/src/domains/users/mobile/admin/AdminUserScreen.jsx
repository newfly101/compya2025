import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminGetUserList,
  requestAdminPatchUserRole,
  requestAdminPatchUserStatus,
} from "@/domains/users/store/admin/thunks.js";
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUSES,
  USER_STATUS_LABELS,
} from "@/domains/users/mobile/admin/userAdmin.constants.js";
import styles from "./AdminUserScreen.module.scss";

const ROLE_OPTIONS = USER_ROLES.map((r) => ({ value: r, label: USER_ROLE_LABELS[r] }));
const STATUS_OPTIONS = USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s] }));

// 프로토타입 § 4 유저관리 상태 태그 — 활성일 때는 태그 없음.
const STATUS_TAG_VARIANT = {
  BLOCKED: "amber",
  WITHDRAWN: "neutral",
  SUSPENDED: "rose",
};

// v2 핸드오프(480-유저) — 유저 탭은 노출/구분 칩이 없다(noVis:true). 대신 닉네임·가입일·
// 최근 로그인 세 열의 헤더를 눌러 정렬한다(AdminTable sortable). 정보 행의 라벨 텍스트는
// 읽기 전용 — 클릭 버튼이 아니다(onToggleSort 를 넘기지 않음, 헤더 클릭만 정렬을 바꾼다).
const SORT_FIELD_LABELS = { nickname: "닉네임", createdAt: "가입일", lastLoginAt: "최근 로그인" };

// 어드민 셸(AdminShellScreen)의 유저관리 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 셸이 상단바(제목/로그아웃)를 한 번만 소유하고, 탭 전환은 뒤로가기가 아니라 탭 클릭으로 처리된다.
export default function AdminUserScreen() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.adminUsers);
  const currentUserId = useSelector((s) => s.auth.user?.id);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState(-1);

  /* 상세/변경 모달 */
  const [selectedId, setSelectedId] = useState(null);
  const [roleDraft, setRoleDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [pendingChange, setPendingChange] = useState(null); // { field, value }
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    dispatch(requestAdminGetUserList());
  }, [dispatch]);

  const searched = (users ?? []).filter((u) => {
    const keyword = search.toLowerCase();
    return (
      u.nickname?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword)
    );
  });

  const filtered = [...searched].sort((a, b) => {
    const va = a[sortKey] ?? "";
    const vb = b[sortKey] ?? "";
    return sortDir * va.localeCompare(vb);
  });

  // 번호식 페이지네이션(8명/페이지, 클라이언트 슬라이스) — 검색/정렬이 바뀌면 1페이지로.
  const { page, pageCount, pageItems, setPage, resetPage } = useAdminPagination(filtered, 8);
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => -d);
    } else {
      setSortKey(key);
      setSortDir(key === "nickname" ? 1 : -1);
    }
  };

  const sortLabelText =
    sortKey === "nickname"
      ? `${SORT_FIELD_LABELS.nickname} ${sortDir === 1 ? "가나다순" : "역순"}`
      : `${SORT_FIELD_LABELS[sortKey]} ${sortDir === -1 ? "최신순" : "오래된순"}`;

  const activeUser = selectedId != null ? (users ?? []).find((u) => u.id === selectedId) ?? null : null;
  const isSelf = currentUserId != null && selectedId === currentUserId;
  const isWithdrawPending = pendingChange?.field === "userStatus" && pendingChange.value === "WITHDRAWN";

  const openDetail = (user) => {
    setSelectedId(user.id);
    setRoleDraft(user.userRole);
    setStatusDraft(user.userStatus);
    setPendingChange(null);
    setSaveError(null);
  };

  const closeModal = () => {
    if (saving) return;
    setSelectedId(null);
    setPendingChange(null);
    setSaveError(null);
  };

  const requestRoleChange = () => {
    if (isSelf || !activeUser || roleDraft === activeUser.userRole) return;
    setSaveError(null);
    setPendingChange({ field: "userRole", value: roleDraft });
  };

  const requestStatusChange = () => {
    if (isSelf || !activeUser || statusDraft === activeUser.userStatus) return;
    setSaveError(null);
    setPendingChange({ field: "userStatus", value: statusDraft });
  };

  const cancelPendingChange = () => {
    if (saving) return;
    setPendingChange(null);
    setSaveError(null);
  };

  const confirmPendingChange = async () => {
    if (!pendingChange || !activeUser || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (pendingChange.field === "userRole") {
        await dispatch(
          requestAdminPatchUserRole({ id: activeUser.id, userRole: pendingChange.value })
        ).unwrap();
      } else {
        await dispatch(
          requestAdminPatchUserStatus({ id: activeUser.id, userStatus: pendingChange.value })
        ).unwrap();
      }
      setPendingChange(null);
    } catch (e) {
      setSaveError(typeof e === "string" ? e : "변경에 실패했습니다. 본인 계정이거나 권한이 없을 수 있습니다.");
    } finally {
      setSaving(false);
    }
  };

  const confirmMessage = () => {
    if (!pendingChange) return "";
    const base =
      pendingChange.field === "userRole"
        ? `역할을 "${USER_ROLE_LABELS[pendingChange.value]}"(으)로 변경합니다.`
        : `상태를 "${USER_STATUS_LABELS[pendingChange.value]}"(으)로 변경합니다.`;
    const forced = " 변경 즉시 해당 유저는 강제 로그아웃됩니다.";
    const withdrawNotice = isWithdrawPending ? " 탈퇴 처리는 되돌리기 어렵습니다. 신중히 확인해 주세요." : "";
    return base + forced + withdrawNotice;
  };

  // v2 핸드오프(480-유저) 열 구성 — # · 닉네임(+태그)/이메일 · 가입일 · 최근 로그인 · 관리.
  // 448px 카드 폭 배분: idx 22 + joinedAt 68 + lastLogin 100 + actions 60 = 250(고정),
  // 나머지 198 은 nickname 칸(가변)이 흡수 → 합계 448.
  const columns = [
    {
      key: "idx",
      label: "#",
      width: 22,
      render: (_u, index) => <span className={styles.idx}>{page * 8 + index + 1}</span>,
    },
    {
      key: "nickname",
      label: "닉네임",
      align: "left",
      sortable: true,
      render: (u) => (
        <div className={styles.mainCell}>
          <div className={styles.nameRow}>
            <span className={styles.nickname}>{u.nickname ?? "-"}</span>
            {u.userRole === "ADMIN" && <AdminTag variant="purple">관리자</AdminTag>}
            {STATUS_TAG_VARIANT[u.userStatus] && (
              <AdminTag variant={STATUS_TAG_VARIANT[u.userStatus]}>
                {USER_STATUS_LABELS[u.userStatus]}
              </AdminTag>
            )}
          </div>
          <span className={styles.email}>{u.email || "이메일 미등록"}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "가입일",
      width: 68,
      sortable: true,
      render: (u) => <span className={styles.joinedAt}>{u.createdAt?.slice(0, 10) ?? "-"}</span>,
    },
    {
      key: "lastLoginAt",
      label: "최근 로그인",
      width: 100,
      sortable: true,
      render: (u) => <span className={styles.lastLogin}>{u.lastLoginAt ?? "-"}</span>,
    },
    {
      key: "actions",
      label: "관리",
      width: 60,
      render: (u) =>
        u.id === currentUserId ? (
          <span className={styles.selfTag}>본인</span>
        ) : (
          <button
            type="button"
            className={styles.manageBtn}
            onClick={(e) => {
              e.stopPropagation();
              openDetail(u);
            }}
          >
            관리
          </button>
        ),
    },
  ];

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="이메일 또는 닉네임 검색"
        totalCount={filtered.length}
        totalLabel="명"
        sortLabel={sortLabelText}
      />

      {loading && <AdminStateBox status="loading" />}
      {!loading && error && (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminGetUserList())}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <AdminStateBox status="empty" message="유저가 없습니다." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <>
          <AdminTable
            columns={columns}
            rows={pageItems}
            rowKey={(u) => u.id}
            onRowClick={openDetail}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
      )}

      <AdminModal
        open={activeUser != null}
        title="유저 정보"
        onClose={closeModal}
        footer={
          <button
            type="button"
            className={styles.saveBtn}
            disabled={isSelf || saving || statusDraft === activeUser?.userStatus}
            onClick={requestStatusChange}
          >
            {saving ? "처리 중..." : "상태 저장"}
          </button>
        }
      >
        {activeUser && (
          <div className={styles.detailFields}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>닉네임</span>
              <span className={styles.detailValue}>{activeUser.nickname ?? "-"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>이메일</span>
              <span className={styles.detailValue}>{activeUser.email || "이메일 미등록"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>역할</span>
              <span className={styles.detailValue}>
                {USER_ROLE_LABELS[activeUser.userRole] ?? activeUser.userRole}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>가입일</span>
              <span className={styles.detailValue}>{activeUser.createdAt ?? "-"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>최근 로그인</span>
              <span className={styles.detailValue}>{activeUser.lastLoginAt ?? "-"}</span>
            </div>

            {isSelf && (
              <p className={styles.selfNotice}>본인 계정의 역할·상태는 이 화면에서 변경할 수 없습니다.</p>
            )}

            {/* 핸드오프 모달에는 없는 항목 — 서버 API 가 있어 기존 기능을 유지한다 */}
            <div className={styles.roleEditRow}>
              <span className={styles.detailLabel}>역할 변경</span>
              <select
                className={styles.select}
                value={roleDraft}
                disabled={isSelf || saving}
                onChange={(e) => setRoleDraft(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                className={styles.applyBtn}
                disabled={isSelf || saving || roleDraft === activeUser.userRole}
                onClick={requestRoleChange}
              >
                변경
              </button>
            </div>

            <div className={styles.statusField}>
              <span className={styles.detailLabel}>계정 상태</span>
              <AdminSegmented
                name="userStatus"
                options={STATUS_OPTIONS}
                value={statusDraft}
                onChange={isSelf || saving ? undefined : setStatusDraft}
              />
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={pendingChange != null}
        title={pendingChange?.field === "userRole" ? "역할 변경" : "상태 변경"}
        message={confirmMessage()}
        dangerous
        requireAgree={isWithdrawPending}
        agreeLabel="탈퇴 처리에 동의합니다."
        confirmLabel={saving ? "처리 중..." : "확인"}
        onConfirm={confirmPendingChange}
        onCancel={cancelPendingChange}
      />
    </div>
  );
}
