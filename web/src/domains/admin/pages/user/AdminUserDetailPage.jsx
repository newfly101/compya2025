import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./AdminUserDetailPage.module.scss";

/** MOCK DATA (API 연동 전) */
const MOCK_USER = {
  id: 1,
  email: "admin@test.com",
  nickname: "새벽",
  provider: "NAVER",
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2024-12-01",
  lastLoginAt: "2026-01-28",
  loginCount: 183,
  recentPage: "/admin/user",
  adminLogs: [
    { at: "2026-01-29 02:12", action: "ROLE 변경: USER → ADMIN" },
    { at: "2026-01-20 21:03", action: "상태 변경: BAN → ACTIVE" },
  ],
};

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(MOCK_USER.role);
  const [status, setStatus] = useState(MOCK_USER.status);
  const [banReason, setBanReason] = useState("");

  const handleSave = () => {
    // TODO: API 호출
    console.log({
      userId,
      role,
      status,
      banReason,
    });
    alert("변경 사항이 저장되었습니다.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>유저 상세 관리</h1>
        <button onClick={() => navigate(-1)}>목록으로</button>
      </div>

      {/* 기본 정보 */}
      <section className={styles.card}>
        <h2>기본 정보</h2>
        <div className={styles.grid}>
          <div><span>Email</span>{MOCK_USER.email}</div>
          <div><span>닉네임</span>{MOCK_USER.nickname}</div>
          <div><span>가입일</span>{MOCK_USER.createdAt}</div>
          <div><span>최근 로그인</span>{MOCK_USER.lastLoginAt}</div>
        </div>
      </section>

      {/* 상태 관리 */}
      <section className={styles.card}>
        <h2>상태 관리</h2>

        <div className={styles.controlRow}>
          <label>권한</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className={styles.controlRow}>
          <label>계정 상태</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BAN">BAN</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        {(status === "BAN" || status === "SUSPENDED") && (
          <div className={styles.controlRow}>
            <label>정지 사유</label>
            <textarea
              placeholder="정지 사유를 입력하세요"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
            />
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={handleSave}>변경 저장</button>
        </div>
      </section>

      {/* 활동 요약 */}
      <section className={styles.card}>
        <h2>활동 요약</h2>
        <div className={styles.grid}>
          <div><span>로그인 횟수</span>{MOCK_USER.loginCount}</div>
          <div><span>최근 활동 페이지</span>{MOCK_USER.recentPage}</div>
        </div>
      </section>

      {/* 관리자 조작 이력 */}
      <section className={styles.card}>
        <h2>사용자 활동 이력</h2>
        <ul className={styles.logList}>
          {MOCK_USER.adminLogs.map((log, idx) => (
            <li key={idx}>
              <span>{log.at}</span>
              {log.action}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminUserDetailPage;
