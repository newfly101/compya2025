import React from "react";
import styles from "./UserProfile.module.scss";
import { useDispatch, useSelector } from "react-redux";

const stateToString = (status) => {
  switch (status) {
    case "BLOCKED":
      return "이용정지";
    case "WITHDRAWN":
      return "회원탈퇴";
    case "SUSPENDED":
      return "보호조치";
    case "ACTIVE":
    default:
      return "활성화";
  }
};

const statusClassMap = {
  ACTIVE: styles.success,
  BLOCKED: styles.danger,
  WITHDRAWN: styles.danger,
  SUSPENDED: styles.info,
};

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const {
    email,
    lastLoginAt,
    nickName,
  } = user;


  return (
    <section className={styles.profilePage}>

      {/* 상단 프로필 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          <img
            src={user?.profileImage || ""}
            alt="profile"
          />
        </div>

        <div className={styles.profileInfo}>
          <label>닉네임</label>
          <input
            value={nickName}
            className={styles.editable}
          />

          <div className={styles.badges}>
            <span className={styles.role}>{role.role}</span>
            <span className={`${styles.statusBadge} ${statusClassMap[role?.status]}`}>{stateToString(role.status)}</span>
          </div>
        </div>
      </div>

      {/* 계정 정보 */}
      <div className={styles.section}>
      <h3>계정 정보</h3>

        <label>이메일 (네이버)</label>
        <input value={email} disabled />

        <label>마지막 로그인</label>
        <input value={lastLoginAt} disabled />
      </div>

      {/* 상태 정보 */}
      <div className={styles.section}>
        <h3>계정 상태</h3>

        <div className={styles.statusRow}>
          <span className={`${styles.statusBadge} ${statusClassMap[role?.status]}`}>{stateToString(role.status)}</span>
          {role?.status === "BLOCKED" && (
            <div className={styles.warning}>
              <h3>사유</h3>
              <div className={styles.reason}>
                <span> {role?.banReason}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.btnGroup}>
        {role?.status !== "BLOCKED" && role?.status !== "WITHDRAWN" && (
          <button className={styles.success}>정보수정</button>
        )}
        <button className={styles.info}>문의하기</button>
        {role?.status !== "WITHDRAWN" && (
          <button className={styles.danger}>회원탈퇴</button>
        )}
      </div>
    </section>

  );
};

export default UserProfile;
