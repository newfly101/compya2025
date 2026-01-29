import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminUserManagePage.module.scss";

const MOCK_USERS = [
  {
    id: 1,
    email: "admin@test.com",
    nickname: "새벽",
    provider: "NAVER",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2024-12-01",
    lastLoginAt: "2026-01-28",
  },
  {
    id: 2,
    email: "user1@test.com",
    nickname: "유저1",
    provider: "KAKAO",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2025-02-10",
    lastLoginAt: "2026-01-20",
  },
  {
    id: 3,
    email: "user2@test.com",
    nickname: "유저2",
    provider: "NAVER",
    role: "USER",
    status: "BAN",
    createdAt: "2025-05-03",
    lastLoginAt: "2025-12-15",
  },
];

const AdminUserManagePage = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sortKey, setSortKey] = useState("createdAt");

  const filteredUsers = useMemo(() => {
    return MOCK_USERS
      .filter(u =>
        keyword
          ? u.email.includes(keyword) || u.nickname.includes(keyword)
          : true
      )
      .filter(u => (role === "ALL" ? true : u.role === role))
      .filter(u => (status === "ALL" ? true : u.status === status))
      .sort((a, b) => {
        if (sortKey === "createdAt") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return new Date(b.lastLoginAt) - new Date(a.lastLoginAt);
      });
  }, [keyword, role, status, sortKey]);

  return (
    <div className={styles.container}>
      <h1>유저 관리</h1>

      {/* 검색 & 필터 */}
      <div className={styles.filterBar}>
        <input
          placeholder="이메일 또는 닉네임 검색"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />

        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="ALL">전체 Role</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="ALL">전체 상태</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BAN">BAN</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>

        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="createdAt">가입일순</option>
          <option value="lastLoginAt">최근 로그인순</option>
        </select>
      </div>

      {/* 테이블 */}
      <table className={styles.table}>
        <thead>
        <tr>
          <th>Email</th>
          <th>닉네임</th>
          <th>Role</th>
          <th>상태</th>
          <th>가입일</th>
          <th>최근 로그인</th>
          <th>액션</th>
        </tr>
        </thead>

        <tbody>
        {filteredUsers.map(user => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.nickname}</td>
            <td>
                <span className={styles[user.role.toLowerCase()]}>
                  {user.role}
                </span>
            </td>
            <td>
                <span className={styles[user.status.toLowerCase()]}>
                  {user.status}
                </span>
            </td>
            <td>{user.createdAt}</td>
            <td>{user.lastLoginAt}</td>
            <td>
              <button
                onClick={() => navigate(`/admin/users/${user.id}`)}
              >
                상세
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagePage;
