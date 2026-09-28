import { useEffect, useRef } from "react";
import { AD_CLIENT_ID, ADS_ENABLED } from "./adConfig.js";
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
 * 광고가 아직 붙지 않은 상태에서는 어떤 환경에서도 아무것도 렌더하지 않는다 —
 * 안내 문구, 빈 박스, 테두리, 빈 <ins>, 여백 전부 남기지 않는다.
 * 개발 환경에서도 마찬가지다. "여기에 무언가 있다" 는 신호가 사용자 눈에
 * 닿으면 안 되고, 개발자가 자리를 확인하려고 둔 표시가 그대로 배포되는
 * 사고를 원천적으로 막기 위해서다.
 *
 * 그래서 슬롯이 어디에 배치돼 있는지는 코드가 아니라 문서로 관리한다.
 * 배치 목록: docs/todo-20260927.md 의 "별첨 — 광고 슬롯 배치" 절
 * 호출부를 검색하려면 AD_SLOTS 로 grep 한다.
 */
const AdSlot = ({ slot, format = "auto", className = "" }) => {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  // 슬롯 ID가 아직 자리표시자(TODO_*)면 게재 준비가 안 된 것으로 본다.
  // adConfig 의 승인 후 작업 순서가 "ADS_ENABLED 먼저 true → 슬롯 ID 나중에 교체" 라서
  // 그 사이 구간에 잘못된 슬롯 ID로 광고를 요청하는 것을 막는다.
  const isLive = ADS_ENABLED && Boolean(slot) && !slot.startsWith("TODO_");

  useEffect(() => {
    if (import.meta.env.DEV) return; // 로컬에서는 실제 push 를 하지 않는다
    if (!isLive) return;
    if (pushedRef.current) return;
    if (typeof window === "undefined") return;

    try {
      if (!window.adsbygoogle) return; // 승인 전(스크립트 미로드) — 조용히 skip
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // 광고 push 실패는 화면 동작에 영향을 주면 안 된다 — 조용히 무시
    }
  }, [isLive]);

  // 광고 미연결 — 흔적 없이 접는다. 개발 환경에서도 예외를 두지 않는다.
  // 자리를 눈으로 확인해야 하면 위 주석의 배치 문서를 보거나, 이 줄을 잠시
  // 주석 처리해 확인하고 되돌린다(커밋하지 않는다).
  if (!isLive) return null;

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
