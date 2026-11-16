import TopBar from "./parts/TopBar.jsx";

// 화면별 상단바 — 각 page.jsx 가 <PageShell title="쿠폰"> 로 감싼다(title 생략 시 홈형 로고).
// 레이아웃은 자식 page 의 값을 받을 수 없어 route group 대신 이 래퍼를 쓴다.
const PageShell = ({ title, children }) => (
  <>
    <TopBar title={title} />
    {children}
  </>
);

export default PageShell;
