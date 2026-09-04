import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
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

// 프로토타입 § 4 정렬 순환: 가입일↓ → 가입일↑ → 최근 로그인↓ → 최근 로그인↑.
const SORT_MODES = [
  { label: "가입일 최신순", field: "createdAt", dir: -1 },
  { label: "가입일 오래된순", field: "createdAt", dir: 1 },
  { label: "최근 로그인 최신순", field: "lastLoginAt", dir: -1 },
  { label: "최근 로그인 오래된순", field: "lastLoginAt", dir: 1 },
];

const CHIP_MATCH = {
  all: () => true,
  ACTIVE: (u) => u.userStatus === "ACTIVE",
  BLOCKED: (u) => u.userStatus === "BLOCKED",
  WITHDRAWN: (u) => u.userStatus === "WITHDRAWN",
  SUSPENDED: (u) => u.userStatus === "SUSPENDED",
};

const CHIP_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "ACTIVE", label: "활성" },
  { value: "BLOCKED", label: "비활성" },
  { value: "WITHDRAWN", label: "탈퇴" },
  { value: "SUSPENDED", label: "영구정지" },
];

// 어드민 셸(AdminShellScreen)의 유저관리 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 셸이 상단바(제목/로그아웃)를 한 번만 소유하고, 탭 전환은 뒤로가기가 아니라 탭 클릭으로 처리된다.
export default function AdminUserScreen() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.adminUsers);
  const currentUserId = useSelector((s) => s.auth.user?.id);

  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("all");
  const [sortIndex, setSortIndex] = useState(0);

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

  const chipOptions = CHIP_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter(CHIP_MATCH[opt.value]).length,
  }));

  const sortMode = SORT_MODES[sortIndex];
  const filtered = [...searched.filter(CHIP_MATCH[chip])].sort((a, b) => {
    const va = a[sortMode.field] ?? "";
    const vb = b[sortMode.field] ?? "";
    return sortMode.dir * va.localeCompare(vb);
  });

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

  const columns = [
    {
      key: "user",
      label: "닉네임 / 이메일",
      align: "left",
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
      key: "meta",
      label: "가입일 / 최근 로그인",
      width: 92,
      render: (u) => (
        <div className={styles.metaCell}>
          <span className={styles.metaTop}>{u.createdAt?.slice(0, 10) ?? "-"}</span>
          <span className={styles.metaBottom}>{u.lastLoginAt?.slice(0, 10) ?? "-"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "관리",
      width: 64,
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
        filters={[{ key: "status", options: chipOptions, value: chip, onChange: setChip }]}
        totalCount={filtered.length}
        totalLabel="명"
        sortLabel={sortMode.label}
        onToggleSort={() => setSortIndex((i) => (i + 1) % SORT_MODES.length)}
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
        <AdminTable columns={columns} rows={filtered} rowKey={(u) => u.id} onRowClick={openDetail} />
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
