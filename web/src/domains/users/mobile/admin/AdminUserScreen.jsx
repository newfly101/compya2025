import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import {
  requestAdminGetUserList,
  requestAdminPatchUserRole,
  requestAdminPatchUserStatus,
} from "@/domains/users/store/admin/thunks.js";
import UserRow from "@/domains/users/mobile/components/userRow/UserRow.jsx";
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUSES,
  USER_STATUS_LABELS,
} from "@/domains/users/mobile/admin/userAdmin.constants.js";
import styles from "./AdminUserScreen.module.scss";

export default function AdminUserScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.adminUsers);
  const currentUserId = useSelector((s) => s.auth.user?.id);

  useSetTopBar({ variant: "page", title: "유저 관리", onBack: () => navigate(-1) });

  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* 상세 Bottom Sheet */
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDraft, setRoleDraft]       = useState("");
  const [statusDraft, setStatusDraft]   = useState("");
  const [pendingChange, setPendingChange] = useState(null); // { field, value }
  const [withdrawAgree, setWithdrawAgree] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState(null);

  useEffect(() => {
    dispatch(requestAdminGetUserList());
  }, [dispatch]);

  const filtered = (users ?? []).filter((u) => {
    const matchSearch = u.nickname?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.userRole === roleFilter;
    const matchStatus = statusFilter === "all" || u.userStatus === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const isSelf = currentUserId != null && selectedUser?.id === currentUserId;
  const isWithdrawPending = pendingChange?.field === "userStatus" && pendingChange.value === "WITHDRAWN";
  const confirmDisabled = saving || (isWithdrawPending && !withdrawAgree);

  const openDetail = (user) => {
    setSelectedUser(user);
    setRoleDraft(user.userRole);
    setStatusDraft(user.userStatus);
    setPendingChange(null);
    setWithdrawAgree(false);
    setSaveError(null);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    if (saving) return;
    setSheetOpen(false);
    setSelectedUser(null);
    setPendingChange(null);
  };

  const requestRoleChange = () => {
    if (isSelf || !selectedUser || roleDraft === selectedUser.userRole) return;
    setSaveError(null);
    setPendingChange({ field: "userRole", value: roleDraft });
  };

  const requestStatusChange = () => {
    if (isSelf || !selectedUser || statusDraft === selectedUser.userStatus) return;
    setSaveError(null);
    setPendingChange({ field: "userStatus", value: statusDraft });
  };

  const cancelPendingChange = () => {
    if (saving) return;
    setPendingChange(null);
    setWithdrawAgree(false);
    setSaveError(null);
    if (selectedUser) {
      setRoleDraft(selectedUser.userRole);
      setStatusDraft(selectedUser.userStatus);
    }
  };

  const confirmPendingChange = async () => {
    if (!pendingChange || !selectedUser) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (pendingChange.field === "userRole") {
        await dispatch(
          requestAdminPatchUserRole({ id: selectedUser.id, userRole: pendingChange.value })
        ).unwrap();
        setSelectedUser((prev) => ({ ...prev, userRole: pendingChange.value }));
      } else {
        await dispatch(
          requestAdminPatchUserStatus({ id: selectedUser.id, userStatus: pendingChange.value })
        ).unwrap();
        setSelectedUser((prev) => ({ ...prev, userStatus: pendingChange.value }));
      }
      setPendingChange(null);
      setWithdrawAgree(false);
    } catch (e) {
      setSaveError(typeof e === "string" ? e : "변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
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
          <button className={styles.retryBtn} onClick={() => dispatch(requestAdminGetUserList())}>
            다시 시도
          </button>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>유저가 없습니다.</p>
        </div>
      );
    }
    return (
      <ul className={styles.list}>
        {filtered.map((u) => (
          <UserRow key={u.id} user={u} onClick={() => openDetail(u)} />
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
          placeholder="닉네임 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterRow}>
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">역할 전체</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">상태 전체</option>
            {USER_STATUSES.map((s) => (
              <option key={s} value={s}>{USER_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 유저 수 표시 */}
      <p className={styles.countText}>총 {filtered.length}명</p>

      {renderContent()}

      {/* 유저 상세 Bottom Sheet */}
      {sheetOpen && selectedUser && (
        <div className={styles.overlay} onClick={closeSheet}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.sheetTitle}>유저 상세</h3>

            <div className={styles.detailFields}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>닉네임</span>
                <span className={styles.detailValue}>{selectedUser.nickname ?? "-"}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>이메일</span>
                <span className={styles.detailValue}>{selectedUser.email || "이메일 미등록"}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>가입일</span>
                <span className={styles.detailValue}>{selectedUser.createdAt ?? "-"}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>마지막 로그인</span>
                <span className={styles.detailValue}>{selectedUser.lastLoginAt ?? "-"}</span>
              </div>
            </div>

            {isSelf && (
              <p className={styles.selfNotice}>
                본인 계정의 역할·상태는 이 화면에서 변경할 수 없습니다.
              </p>
            )}

            <div className={styles.editRow}>
              <span className={styles.detailLabel}>역할</span>
              <select
                className={styles.filterSelect}
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
                disabled={isSelf || saving || roleDraft === selectedUser.userRole}
                onClick={requestRoleChange}
              >
                역할 변경
              </button>
            </div>

            <div className={styles.editRow}>
              <span className={styles.detailLabel}>상태</span>
              <select
                className={styles.filterSelect}
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
                disabled={isSelf || saving || statusDraft === selectedUser.userStatus}
                onClick={requestStatusChange}
              >
                상태 변경
              </button>
            </div>

            {pendingChange && (
              <div className={styles.confirmBox}>
                <p className={isWithdrawPending ? styles.confirmWarnStrong : styles.confirmWarn}>
                  {pendingChange.field === "userRole"
                    ? `역할을 "${USER_ROLE_LABELS[pendingChange.value]}"(으)로 변경합니다.`
                    : `상태를 "${USER_STATUS_LABELS[pendingChange.value]}"(으)로 변경합니다.`}
                  {isWithdrawPending && " 탈퇴 처리는 되돌리기 어렵습니다. 신중히 확인해 주세요."}
                </p>
                {isWithdrawPending && (
                  <label className={styles.agreeLabel}>
                    <input
                      type="checkbox"
                      checked={withdrawAgree}
                      onChange={(e) => setWithdrawAgree(e.target.checked)}
                    />
                    탈퇴 처리에 동의합니다.
                  </label>
                )}
                {saveError && <p className={styles.stateError}>{saveError}</p>}
                <div className={styles.confirmActions}>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={cancelPendingChange}
                    disabled={saving}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={confirmPendingChange}
                    disabled={confirmDisabled}
                  >
                    {saving ? "처리 중..." : "확인"}
                  </button>
                </div>
              </div>
            )}

            <button className={styles.closeBtn} onClick={closeSheet} disabled={saving}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
