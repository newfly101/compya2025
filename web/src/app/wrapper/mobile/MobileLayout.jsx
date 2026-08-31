import React, { Suspense, useEffect, useRef } from "react";
import styles from "./MobileLayout.module.scss";
import { Outlet, useLocation } from "react-router-dom";
import { TopBarProvider } from "@/app/provider/TopBarProvider";
import TopBar from "@/app/wrapper/mobile/parts/TopBar";
import Drawer from "@/app/wrapper/mobile/parts/Drawer.jsx";
import Footer from "@/app/wrapper/mobile/parts/Footer.jsx";

const MobileLayout = () => {
  const { pathname, search } = useLocation();
  const scrollRef = useRef(null);

  // 라우트(pathname) + 쿼리(search) 변경 시 스크롤 항상 최상단으로
  // lazy 컴포넌트가 Suspense 후 마운트되는 케이스 cover:
  //  1) 동기 + 단계적 setTimeout 다중 시도
  //  2) MutationObserver 로 자식 노드 추가(Suspense fallback → 실제 컨텐츠 교체) 감지
  useEffect(() => {
    const node = scrollRef.current;

    // .pageContent / window / document 어느 쪽이 실제 scroll container 든 모두 0으로
    const top = () => {
      node?.scrollTo(0, 0);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    top();
    const ids = [
      setTimeout(top, 0),
      setTimeout(top, 100),
      setTimeout(top, 300),
      setTimeout(top, 600),
    ];

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          top();
          return;
        }
      }
    });
    if (node) observer.observe(node, { childList: true });
    const stopId = setTimeout(() => observer.disconnect(), 1500);

    // 사용자가 스크롤/입력을 시작하면 pending scroll-top 모두 취소
    const cancel = () => {
      ids.forEach(clearTimeout);
      clearTimeout(stopId);
      observer.disconnect();
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"];
    events.forEach((e) =>
      window.addEventListener(e, cancel, { once: true, passive: true })
    );

    return () => {
      cancel();
      events.forEach((e) => window.removeEventListener(e, cancel));
    };
  }, [pathname, search]);

  return (
    <TopBarProvider>
      <div className={styles.appWrapper}>
        <TopBar />
        <Drawer />
        <div
          ref={scrollRef}
          className={styles.pageContent}
          data-scroll-root
        >
          <Suspense fallback={<div className={styles.loading}>로딩중...</div>}>
            <Outlet />
          </Suspense>

          {/* 전역 Footer — pageContent(스크롤 컨테이너) 안쪽 맨 아래 배치.
              appWrapper 바깥(고정 영역)에 두면 flex:1 인 pageContent 가 그만큼
              항상 줄어들어 모든 화면의 실사용 뷰포트를 영구 잠식한다.
              스크롤 콘텐츠 흐름 안에 두면 각 페이지 하단에서 자연스럽게 노출되고,
              크롤러도 페이지 DOM 안에서 정책 링크를 그대로 발견할 수 있다. */}
          <Footer />
        </div>
      </div>
    </TopBarProvider>
  );
};

export default MobileLayout;
