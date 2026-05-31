import styles from "./UserRow.module.scss";

const ROLE_VARIANTS = {
  ADMIN: styles.roleAdmin,
  USER:  styles.roleUser,
};

const STATUS_VARIANTS = {
  ACTIVE:    styles.statusActive,
  BANNED:    styles.statusBanned,
  WITHDRAWN: styles.statusWithdrawn,
};

/**
 * UserRow — 유저 관리 목록 1행 컴포넌트
 * @param {object} user
 * @param {function} [onClick]
 */
export default function UserRow({ user, onClick }) {
  const {
    nickname,
    userRole,
    userStatus,
    lastLoginAt,
  } = user;

  return (
    <li className={styles.row} onClick={onClick} role="button" tabIndex={0}>
      <span className={styles.nickname}>{nickname ?? "-"}</span>
      <div className={styles.badges}>
        <span className={`${styles.chip} ${ROLE_VARIANTS[userRole] ?? ""}`}>
          {userRole ?? "-"}
        </span>
        <span className={`${styles.chip} ${STATUS_VARIANTS[userStatus] ?? ""}`}>
          {userStatus ?? "-"}
        </span>
      </div>
      <span className={styles.lastLogin}>{lastLoginAt?.slice(0, 10) ?? "-"}</span>
    </li>
  );
}
