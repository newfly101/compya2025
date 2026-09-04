import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
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

export default function AdminUserScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.adminUsers);
  const currentUserId = useSelector((s) => s.auth.user?.id);

  useSetTopBar({ variant: "page", title: "유저 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filtered = (users ?? []).filter((u) => {
    const matchSearch = u.nickname?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.userRole === roleFilter;
    const matchStatus = statusFilter === "all" || u.userStatus === statusFilter;
    return matchSearch && matchRole && matchStatus;
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
    { key: "nickname", label: "닉네임", align: "left", render: (u) => u.nickname ?? "-" },
    {
      key: "userRole",
      label: "역할",
      render: (u) => USER_ROLE_LABELS[u.userRole] ?? u.userRole ?? "-",
    },
    {
      key: "userStatus",
      label: "상태",
      render: (u) => USER_STATUS_LABELS[u.userStatus] ?? u.userStatus ?? "-",
    },
    {
      key: "lastLoginAt",
      label: "최근접속",
      render: (u) => u.lastLoginAt?.slice(0, 10) ?? "-",
    },
    {
      key: "actions",
      label: "관리",
      render: (u) =>
        u.id === currentUserId ? (
          <span className={styles.selfTag}>본인</span>
        ) : (
          <button
            type="button"
            className={styles.changeBtn}
            onClick={(e) => {
              e.stopPropagation();
              openDetail(u);
            }}
          >
            변경
          </button>
        ),
    },
  ];

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="닉네임 검색"
        filters={[
          { key: "role", label: "역할", options: [{ value: "all", label: "전체" }, ...ROLE_OPTIONS], value: roleFilter, onChange: setRoleFilter },
          { key: "status", label: "상태", options: [{ value: "all", label: "전체" }, ...STATUS_OPTIONS], value: statusFilter, onChange: setStatusFilter },
        ]}
      />

      <p className={styles.countText}>총 {filtered.length}명</p>

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
        <AdminTable columns={columns} rows={filtered} rowKey={(u) => u.id} />
      )}

      <AdminModal
        open={activeUser != null}
        title={`역할·상태 변경 — ${activeUser?.nickname ?? ""}`}
        onClose={closeModal}
        footer={
          <button type="button" className={styles.closeBtn} onClick={closeModal} disabled={saving}>
            닫기
          </button>
        }
      >
        {activeUser && (
          <div className={styles.detailFields}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>이메일</span>
              <span className={styles.detailValue}>{activeUser.email || "이메일 미등록"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>가입일</span>
              <span className={styles.detailValue}>{activeUser.createdAt ?? "-"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>마지막 로그인</span>
              <span className={styles.detailValue}>{activeUser.lastLoginAt ?? "-"}</span>
            </div>

            {isSelf && (
              <p className={styles.selfNotice}>본인 계정의 역할·상태는 이 화면에서 변경할 수 없습니다.</p>
            )}

            <div className={styles.editRow}>
              <span className={styles.detailLabel}>역할</span>
              <select
                className={styles.select}
                value={roleDraft}
                disabled={isSelf || saving}
                onChange={(e) => setRoleDraft(e.target.value)}
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>
                ))}
              </select>
              <button
                type="button"
                className={styles.applyBtn}
                disabled={isSelf || saving || roleDraft === activeUser.userRole}
                onClick={requestRoleChange}
              >
                역할 변경
              </button>
            </div>

            <div className={styles.editRow}>
              <span className={styles.detailLabel}>상태</span>
              <select
                className={styles.select}
                value={statusDraft}
                disabled={isSelf || saving}
                onChange={(e) => setStatusDraft(e.target.value)}
              >
                {USER_STATUSES.map((s) => (
                  <option key={s} value={s}>{USER_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button
                type="button"
                className={styles.applyBtn}
                disabled={isSelf || saving || statusDraft === activeUser.userStatus}
                onClick={requestStatusChange}
              >
                상태 변경
              </button>
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
