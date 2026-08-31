// 유저 관리 화면 공용 상수 — BE UserRole / UserStatus enum 과 1:1 대응.
// 운영 DB 실측: site_users.user_status enum('ACTIVE','BLOCKED','WITHDRAWN','SUSPENDED')

export const USER_ROLES = ["ADMIN", "USER"];

export const USER_ROLE_LABELS = {
  ADMIN: "관리자",
  USER: "일반회원",
};

export const USER_STATUSES = ["ACTIVE", "BLOCKED", "WITHDRAWN", "SUSPENDED"];

export const USER_STATUS_LABELS = {
  ACTIVE: "정상",
  BLOCKED: "차단",
  WITHDRAWN: "탈퇴",
  SUSPENDED: "정지",
};
