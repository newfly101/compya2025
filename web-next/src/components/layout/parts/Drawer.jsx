"use client";
import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import styles from "./Drawer.module.scss";
import DrawerMenu from "./DrawerMenu.jsx";
import { useDrawer } from "@/components/layout/DrawerContext.jsx";
import { Avatar, pickProfileImageSrc } from "@/components/avatar";
import { ROUTE_PATHS } from "@/lib/routePath.js";
import { useAuthentication } from "@/features/authentication/hooks/useAuthentication.js";
import { useLoginRequiredModal } from "@/features/authentication/hooks/useLoginRequiredModal.jsx";
// 로그인 사용자만 쓰는 프로필 카드(조회 훅·axios 포함) — 비로그인 첫 화면 번들에서 뺀다.
const DrawerProfile = dynamic(() => import("@/features/gamification/components/DrawerProfile.jsx"), { ssr: false });
import { useLayoutStore } from "@/stores/layoutStore.js";

// 메뉴 링크는 닫힌 상태에서도 DOM 에 있다(SSR HTML → 크롤러 내부 링크). 숨김은 CSS translate, 포커스 차단은 inert.
// 로그인 영역(프로필·로그인 모달) · loginRequired 비로그인 클릭 차단 · 접힘 상태 sessionStorage · admin 메뉴.
// TODO(next-migration): RenewalNoticeModal(comingSoon 메뉴) — 지금 메뉴에 comingSoon 항목이 없어 미이전
const Drawer = () => {
  const { isOpen, close } = useDrawer();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, initialized, login } = useAuthentication();
  const { askLogin, loginModal } = useLoginRequiredModal();
  const collapsedIds = useLayoutStore((s) => s.drawerCollapsed);

  // 접힘 상태는 마운트 뒤에 복원한다 — 서버 HTML(모두 펼침)과 첫 렌더를 맞추기 위해
  useEffect(() => {
    useLayoutStore.persist.rehydrate();
  }, []);

  // Esc 로 닫기(접근성)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // close · askLogin 은 렌더마다 새 함수 — 메뉴 memo 가 깨지지 않게 최신 값을 ref 로 들고 참조 고정 콜백을 넘긴다.
  const latest = useRef({ close, askLogin });
  useEffect(() => { latest.current = { close, askLogin }; });
  const onNavigate = useCallback(() => latest.current.close(), []);
  const onLoginRequired = useCallback((reason) => latest.current.askLogin(reason), []);

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`} onClick={close} />
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`} inert={!isOpen}>
        {/* 유저 프로필 — 로그인 상태일 때는 박스 자체가 마이페이지 진입점이다. 로그아웃은 상단바 소유. */}
        {user ? (
          <Link
            href={ROUTE_PATHS.mypage}
            className={`${styles.profile} ${styles.profileLink} ${styles.profileTier}`}
            onClick={close}
          >
            <DrawerProfile
              avatar={<Avatar src={pickProfileImageSrc(user)} nickname={user?.nickname} size={48} alt="" />}
              nickname={user?.nickname}
            />
          </Link>
        ) : !initialized ? (
          <div className={styles.profile} aria-hidden="true" />
        ) : (
          <div className={styles.profile}>
            <div className={styles.guestInfo}>
              <span className={styles.guestTitle}>로그인하고 더 많은 컨텐츠 이용하기!</span>
              <button type="button" className={styles.loginBtn} onClick={login}>N 네이버 로그인</button>
            </div>
          </div>
        )}

        <DrawerMenu
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          pathname={pathname}
          collapsedIds={collapsedIds}
          onNavigate={onNavigate}
          onLoginRequired={onLoginRequired}
        />
      </aside>
      {loginModal}
    </>
  );
};

export default Drawer;
