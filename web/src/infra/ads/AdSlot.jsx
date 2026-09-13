import { useEffect, useRef } from "react";
import { AD_CLIENT_ID } from "./adConfig.js";
import styles from "./AdSlot.module.scss";

/**
 * 수동 광고 슬롯 (AdSense <ins class="adsbygoogle"> 래퍼).
 *
 * 배치 원칙 (2026-08-30 반려 사유 1 재발 방지):
 * - 콘텐츠가 실제로 1건 이상 렌더된 자리에만 둔다. 호출부에서 loading/error/empty 상태를 먼저 걸러야 한다.
 * - 화면당 최대 1개.
 * - 다음 화면에는 절대 배치하지 않는다: 로그인/OAuth 콜백, 404, mypage, admin, community,
 *   Suspense fallback, 빈 상태 화면.
 *
 * 승인 전(web/index.html의 adsbygoogle 스크립트가 주석 처리된 동안)에는
 * window.adsbygoogle 이 존재하지 않으므로 조용히 아무것도 렌더하지 않는다.
 */
const AdSlot = ({ slot, format = "auto", className = "" }) => {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV) return; // 로컬에서는 placeholder만 보여주고 실제 push는 하지 않는다
    if (pushedRef.current) return;
    if (typeof window === "undefined") return;

    try {
      if (!window.adsbygoogle) return; // 승인 전(스크립트 미로드) — 조용히 skip
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // 광고 push 실패는 화면 동작에 영향을 주면 안 된다 — 조용히 무시
    }
  }, []);

  if (import.meta.env.DEV) {
    return (
      <div className={`${styles.placeholder} ${className}`} data-ad-slot={slot}>
        광고 영역 (slot: {slot})
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${styles.ins} ${className}`}
      style={{ display: "block" }}
      data-ad-client={AD_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
};

export default AdSlot;
