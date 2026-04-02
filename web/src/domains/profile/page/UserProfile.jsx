import React from "react";
import styles from "./UserProfile.module.scss";
import { useSelector } from "react-redux";
import { stateToString, statusClassMap } from "@/domains/profile/utils/userStatusUtils.js";

const UserProfile = () => {
  const { user, authority } = useSelector((state) => state.auth);
  const { email, lastLoginAt, nickName } = user;

  return (
    <section className={styles.profilePage}>

      {/* 상단 프로필 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          <img src={user?.profileImage || ""} alt="profile" />
        </div>

        <div className={styles.profileInfo}>
          <label>닉네임</label>
          <input value={nickName} className={styles.editable} />

          <div className={styles.badges}>
            <span className={styles.role}>{authority.role}</span>
            <span className={`${styles.statusBadge} ${statusClassMap[authority?.status]}`}>
              {stateToString(authority.status)}
            </span>
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
          <span className={`${styles.statusBadge} ${statusClassMap[authority?.status]}`}>
            {stateToString(authority.status)}
          </span>
          {authority?.status === "BLOCKED" && (
            <div className={styles.warning}>
              <h3>사유</h3>
              <div className={styles.reason}>
                <span>{authority?.banReason}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.btnGroup}>
        {authority?.status !== "BLOCKED" && authority?.status !== "WITHDRAWN" && (
          <button className={styles.success}>정보수정</button>
        )}
        <button className={styles.info}>문의하기</button>
        {authority?.status !== "WITHDRAWN" && (
          <button className={styles.danger}>회원탈퇴</button>
        )}
      </div>
    </section>
  );
};

export default UserProfile;
