// 유저 관리 화면 공용 상수 — BE UserRole / UserStatus enum 과 1:1 대응.
// 운영 DB 실측: site_users.user_status enum('ACTIVE','BLOCKED','WITHDRAWN','SUSPENDED')

export const USER_ROLES = ["ADMIN", "USER"];

export const USER_ROLE_LABELS = {
  ADMIN: "관리자",
  USER: "일반회원",
};

export const USER_STATUSES = ["ACTIVE", "BLOCKED", "WITHDRAWN", "SUSPENDED"];

// v2 핸드오프(480-유저) 문구 — 활성/비활성/탈퇴/영구정지. 상태 태그·세그먼트·칩이 전부 이 라벨을 공유한다.
export const USER_STATUS_LABELS = {
  ACTIVE: "활성",
  BLOCKED: "비활성",
  WITHDRAWN: "탈퇴",
  SUSPENDED: "영구정지",
};
