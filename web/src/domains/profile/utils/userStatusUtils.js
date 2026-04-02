import styles from "@/domains/profile/page/UserProfile.module.scss";

export const stateToString = (status) => {
  switch (status) {
    case "BLOCKED":   return "이용정지";
    case "WITHDRAWN": return "회원탈퇴";
    case "SUSPENDED": return "보호조치";
    case "ACTIVE":
    default:          return "활성화";
  }
};

export const statusClassMap = {
  ACTIVE:    styles.success,
  BLOCKED:   styles.danger,
  WITHDRAWN: styles.danger,
  SUSPENDED: styles.info,
};
