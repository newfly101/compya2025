export const useHeaderNav = (isAuthenticated, authority) => {
  const nav = [
    { to: "/", label: "홈" },
    { to: "/notice?tab=events", label: "이벤트" },
    { to: "/notice?tab=coupons", label: "쿠폰 코드" },
    { to: "/notice", label: "공지사항" },
    { to: "/community", label: "커뮤니티" },
    { to: "/dictionary", label: "📌추천 백과사전" },
  ];

  if (isAuthenticated) {
    nav.push({ to: "/mypage", label: "마이페이지" });
  }

  if (authority?.role === "ADMIN") {
    nav.push({ to: "/admin/users", label: "사이트 관리"});
  }

  return nav;
};
