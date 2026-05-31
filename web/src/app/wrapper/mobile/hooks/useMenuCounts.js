import { useState, useEffect } from "react";
import { API } from "@/infra/http/client.js";

/**
 * Drawer 메뉴 배지용 카운트 훅.
 * Redux 미사용 — 단순 fetch. 공지/이벤트/쿠폰 DB 전체 건수 반환.
 */
export const useMenuCounts = () => {
  const [counts, setCounts] = useState({ notices: null, events: null, coupons: null });

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [noticeRes, eventRes, couponRes] = await Promise.allSettled([
          API.get("/notices"),
          API.get("/events/external"),
          API.get("/coupons"),
        ]);

        if (cancelled) return;

        const extract = (res) => {
          if (res.status !== "fulfilled") return null;
          const payload = res.value?.data;
          const list = payload?.data;
          return Array.isArray(list) ? list.length : null;
        };

        setCounts({
          notices: extract(noticeRes),
          events: extract(eventRes),
          coupons: extract(couponRes),
        });
      } catch {
        // 카운트 실패는 무음 처리 — badge 미표시
      }
    };

    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  return counts;
};
