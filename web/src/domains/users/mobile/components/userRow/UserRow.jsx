import styles from "./UserRow.module.scss";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
} from "@/domains/users/mobile/admin/userAdmin.constants.js";

const ROLE_VARIANTS = {
  ADMIN: styles.roleAdmin,
  USER:  styles.roleUser,
};

// 운영 DB 실측 enum('ACTIVE','BLOCKED','WITHDRAWN','SUSPENDED') 과 1:1 대응.
const STATUS_VARIANTS = {
  ACTIVE:    styles.statusActive,
  BLOCKED:   styles.statusBlocked,
  WITHDRAWN: styles.statusWithdrawn,
  SUSPENDED: styles.statusSuspended,
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
          {USER_ROLE_LABELS[userRole] ?? userRole ?? "-"}
        </span>
        <span className={`${styles.chip} ${STATUS_VARIANTS[userStatus] ?? ""}`}>
          {USER_STATUS_LABELS[userStatus] ?? userStatus ?? "-"}
        </span>
      </div>
      <span className={styles.lastLogin}>{lastLoginAt?.slice(0, 10) ?? "-"}</span>
    </li>
  );
}
