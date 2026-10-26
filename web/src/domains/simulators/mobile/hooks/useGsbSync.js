import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { requestPutGsb } from "@/domains/simulators/store/public/thunks.js";

const DEBOUNCE_MS = 10000; // 마지막 변경 뒤 이 시간이 지나면 한 번에 저장
const MAX_ITEMS = 100; // BE 한 번에 받는 상한

/**
 * 바뀐 선수만 모아 서버에 한 번에 저장한다 — 돌릴 때마다 보내지 않는다.
 * 트리거: 마지막 변경 10초 뒤 · 탭이 숨겨질 때 · 화면을 떠날 때. 요청은 한 번에 하나, 겹치면 끝난 뒤 다시.
 * 실패하면 dirty 를 유지하고 다음 트리거에 재시도한다. entriesRef: { [legendId]: { g, c, s[3], t[3] } } 최신 값.
 */
export const useGsbSync = (entriesRef) => {
  const dispatch = useDispatch();
  const dirty = useRef(new Set());
  const timer = useRef(null);
  const inflight = useRef(false);
  const again = useRef(false);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (inflight.current) {
      again.current = true;
      return;
    }
    const ids = [...dirty.current].slice(0, MAX_ITEMS);
    const items = ids
      .map((id) => ({ id, e: entriesRef.current[id] }))
      .filter(({ e }) => e && e.s.length === 3)
      .map(({ id, e }) => ({ legendId: id, gsbCount: e.g, selCount: e.c, skillIds: e.s, skillTiers: e.t }));
    ids.forEach((id) => dirty.current.delete(id));
    if (items.length === 0) return;

    inflight.current = true;
    try {
      await dispatch(requestPutGsb(items)).unwrap();
    } catch {
      ids.forEach((id) => dirty.current.add(id)); // 실패 — 다음 트리거에 다시
    } finally {
      inflight.current = false;
      if (again.current) {
        again.current = false;
        flush();
      }
    }
  }, [dispatch, entriesRef]);

  const markDirty = useCallback(
    (legendId) => {
      dirty.current.add(legendId);
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush],
  );

  // 초기화한 선수는 보낼 필요가 없다
  const forget = useCallback((legendId) => dirty.current.delete(legendId), []);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      flush(); // 화면 이탈
    };
  }, [flush]);

  return { markDirty, forget, flush };
};
