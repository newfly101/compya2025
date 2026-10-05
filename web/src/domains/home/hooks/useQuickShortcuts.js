import { useCallback, useMemo, useState } from "react";
import { MENU_LEAVES } from "@/app/wrapper/mobile/config/MENU_GROUPS.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { loadStored, resolveKeys, saveStored } from "@/domains/home/config/quickShortcuts.js";

const VALID_KEYS = MENU_LEAVES.map((i) => i.key);
const ITEM_BY_KEY = new Map(MENU_LEAVES.map((i) => [i.key, i]));

/**
 * 홈 바로가기 — 보여 줄 항목(서랍 메뉴 항목)과 저장. 저장은 로그인 사용자만 의미가 있고,
 * 비로그인은 어떤 저장값이 있어도 기본 구성을 쓴다 (REQ-HM-14).
 */
export const useQuickShortcuts = () => {
  const { isAuthenticated } = useAuthentication();
  const [stored, setStored] = useState(loadStored);

  const keys = useMemo(() => resolveKeys(stored, VALID_KEYS, isAuthenticated), [stored, isAuthenticated]);
  const items = useMemo(() => keys.map((k) => ITEM_BY_KEY.get(k)), [keys]);

  const save = useCallback((next) => {
    saveStored(next);
    setStored(next);
  }, []);

  return { isAuthenticated, keys, items, save };
};
