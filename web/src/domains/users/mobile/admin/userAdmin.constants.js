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

// 이메일 마스킹 — v2 핸드오프 표본 12건을 대조한 결과, 닉네임이 이메일 로컬파트와
// 완전히 같은 경우(가입 시 기본 닉네임을 바꾸지 않은 계정: sh1/lyh/wld)만 마스킹 없이
// 그대로 노출되고, 나머지는 로컬파트 전체 뒤에 "****" 를 붙여 가린다(dol→dol****,
// none→none****, rbgus→rbgus**** ...). BE 가 실제로 이 규칙으로 마스킹하는지 확인된
// 스펙은 아니고 표본 역산 — [확인필요].
export const maskEmail = (email, nickname) => {
  if (!email) return "이메일 미등록";
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (nickname && nickname === local) return email;
  return `${local}****${domain}`;
};
