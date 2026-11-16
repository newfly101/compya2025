import styles from "./MobileLayout.module.scss";
import Footer from "./parts/Footer.jsx";
import Drawer from "./parts/Drawer.jsx";
import ChatLoader from "./parts/ChatLoader.jsx";
import ScrollToTop from "./parts/ScrollToTop.jsx";
import NicknameGuard from "./parts/NicknameGuard.jsx";
import { DrawerProvider } from "./DrawerContext.jsx";

// 상단바는 각 page 가 <PageShell> 로 그린다(position: fixed 라 위치 무관).
// ErrorBoundary 는 app/error.jsx 로 대체.
const MobileLayout = ({ children }) => (
  <DrawerProvider>
    <div className={styles.appWrapper}>
      <Drawer />
      <div className={styles.pageContent} data-scroll-root>
        {children}
        <Footer />
      </div>
      <ChatLoader />
      <ScrollToTop />
      <NicknameGuard />
    </div>
  </DrawerProvider>
);

export default MobileLayout;
