import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { requestDeleteGsb, requestPutGsb } from "@/domains/simulators/store/public/thunks.js";

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
  const pending = useRef(Promise.resolve()); // 지금 나가 있는 PUT — 초기화(DELETE)는 이것이 끝난 뒤에 보낸다

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
    const put = dispatch(requestPutGsb(items)).unwrap();
    pending.current = put.catch(() => {});
    try {
      await put;
    } catch {
      // 실패 — 다음 트리거에 다시. 그사이 초기화한 선수는 되살리지 않는다
      ids.filter((id) => entriesRef.current[id]).forEach((id) => dirty.current.add(id));
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

  // 초기화 — 보낼 목록에서 빼고, 나가 있는 PUT 이 끝난 뒤 DELETE 를 보낸다.
  // 순서를 지키지 않으면 늦게 도착한 PUT 이 지운 기록을 되살린다. 실패는 화면에 영향 없음
  const remove = useCallback(
    async (legendId) => {
      dirty.current.delete(legendId);
      await pending.current;
      await dispatch(requestDeleteGsb(legendId)).unwrap().catch(() => {});
    },
    [dispatch],
  );

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      flush(); // 화면 이탈
    };
  }, [flush]);

  return { markDirty, remove, flush };
};
