export const useHeaderNav = (isAuthenticated, authority) => {
  const nav = [
    { to: "/", label: "홈" },
    { to: "/notice/events", label: "이벤트" },
    { to: "/notice/coupons", label: "쿠폰 코드" },
    { to: "/notice", label: "공지사항" },
    { to: "/community", label: "커뮤니티" },
    // dictionary 도메인 폐기 (legacy PC) — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/dictionary.md TODO 참조)
    // { to: "/dictionary", label: "📌추천 백과사전" },
  ];

  // profile 도메인 폐기 — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/profile.md TODO 참조)
  // if (isAuthenticated) {
  //   nav.push({ to: "/mypage", label: "마이페이지" });
  // }

  if (authority?.role === "ADMIN") {
    nav.push({ to: "/admin/users", label: "사이트 관리"});
  }

  return nav;
};
