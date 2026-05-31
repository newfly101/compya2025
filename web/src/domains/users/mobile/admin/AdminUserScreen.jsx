import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import { requestAdminGetUserList } from "@/domains/users/store/admin/thunks.js";
import UserRow from "@/domains/users/mobile/components/userRow/UserRow.jsx";
import styles from "./AdminUserScreen.module.scss";

const ROLES    = ["ADMIN", "USER"];
const STATUSES = ["ACTIVE", "BANNED", "WITHDRAWN"];

// [HITL] 유저 상세 Bottom Sheet — 이번 사이클 미구현. 별도 사이클 TBD.
export default function AdminUserScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.adminUsers);

  useSetTopBar({ variant: "page", title: "유저 관리", onBack: () => navigate(-1) });

  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen]   = useState(false);

  useEffect(() => {
    dispatch(requestAdminGetUserList());
  }, [dispatch]);

  const filtered = (users ?? []).filter((u) => {
    const matchSearch = u.nickname?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.userRole === roleFilter;
    const matchStatus = statusFilter === "all" || u.userStatus === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleRowClick = () => {
    // [HITL] 유저 상세 화면 — TBD (별도 사이클 구현 예정)
    setSheetOpen(true);
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
          <UserRow key={u.id} user={u} onClick={handleRowClick} />
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
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">상태 전체</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* 유저 수 표시 */}
      <p className={styles.countText}>총 {filtered.length}명</p>

      {renderContent()}

      {/* Bottom Sheet — TBD placeholder */}
      {sheetOpen && (
        <div className={styles.overlay} onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.sheetTitle}>유저 상세</h3>
            <p className={styles.tbd}>유저 상세 기능은 다음 사이클에서 구현 예정입니다.</p>
            <button className={styles.closeBtn} onClick={() => setSheetOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
