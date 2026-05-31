// useWikiGameInfo.js — ENC-5/6 게임 정보 fetch hook
// GET /api/wiki/game-info/{target} — staleTime 30분 (로컬 캐시)

import { useState, useEffect, useRef } from "react";
import { API } from "@/infra/http/client.js";

const cache = {};
const STALE_MS = 30 * 60 * 1000;

/**
 * @param {"pitcher"|"hitter"} target
 */
export function useWikiGameInfo(target) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const retryCountRef = useRef(0);
  const MAX_RETRY = 3;

  const fetchData = async () => {
    if (!target) return;
    const key = target.toUpperCase();

    if (cache[key] && Date.now() - cache[key].ts < STALE_MS) {
      setData(cache[key].data);
      setIsError(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const { data: res } = await API.get(`/wiki/game-info/${key}`);
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
