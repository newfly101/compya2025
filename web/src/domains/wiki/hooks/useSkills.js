// useSkills.js — ENC-1/2 스킬 목록 fetch hook
// GET /api/skills/{target} — staleTime 10분 (로컬 캐시)

import { useState, useEffect, useRef } from "react";
import { API } from "@/infra/http/client.js";

const cache = {}; // 간단한 in-memory 캐시 (10분)
const STALE_MS = 10 * 60 * 1000;

/**
 * @param {"pitcher"|"hitter"} target
 */
export function useSkills(target) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const retryCountRef = useRef(0);
  const MAX_RETRY = 3;

  const fetchData = async () => {
    if (!target) return;
    const key = target.toUpperCase();

    // 캐시 hit
    if (cache[key] && Date.now() - cache[key].ts < STALE_MS) {
      setData(cache[key].data);
      setIsError(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const { data: res } = await API.get(`/skills/${key}`);
      const payload = res?.data ?? res;
      cache[key] = { data: payload, ts: Date.now() };
      setData(payload);
      retryCountRef.current = 0;
    } catch (e) {
      if (retryCountRef.current < MAX_RETRY) {
        retryCountRef.current += 1;
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 8000);
        setTimeout(fetchData, delay);
        return;
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    retryCountRef.current = 0;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { data, isLoading, isError, refetch: fetchData };
}
