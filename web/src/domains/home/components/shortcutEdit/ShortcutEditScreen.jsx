import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MENU_LEAVES } from "@/app/wrapper/mobile/config/MENU_GROUPS.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { MAX_SHORTCUTS, defaultKeys, moveKey, toggleKey } from "@/domains/home/config/quickShortcuts.js";
import { useQuickShortcuts } from "@/domains/home/hooks/useQuickShortcuts.js";
import styles from "./ShortcutEditScreen.module.scss";

const ITEM_BY_KEY = new Map(MENU_LEAVES.map((i) => [i.key, i]));

/**
 * 홈 바로가기 편집 (REQ-HM-14, Figma legendContentFlow 05) — 서랍 메뉴 항목 중 최대 8개를 고르고 끌어서 순서를 바꾼다.
 * 순서 변경: ⋮⋮ 핸들 드래그(포인터 이벤트라 터치 지원) · 핸들에 포커스한 뒤 ↑↓ 방향키. 화살표 버튼은 두지 않는다.
 * 저장은 "저장" 을 눌렀을 때만 (브라우저 localStorage).
 */
const ShortcutEditScreen = () => {
  useDomainTopBar("바로가기 편집");
  const navigate = useNavigate();
  const { keys: savedKeys, save } = useQuickShortcuts();
  const [keys, setKeys] = useState(savedKeys);
  const [dragKey, setDragKey] = useState(null);
  const listRef = useRef(null);
  const focusKey = useRef(null);

  // 방향키로 옮긴 뒤에도 핸들에 포커스가 남게 한다 (행이 다시 그려지며 잃는 것을 되돌림)
  useEffect(() => {
    if (!focusKey.current) return;
    listRef.current?.querySelector(`[data-handle="${focusKey.current}"]`)?.focus();
    focusKey.current = null;
  }, [keys]);

  const rest = MENU_LEAVES.filter((i) => !keys.includes(i.key));
  const full = keys.length >= MAX_SHORTCUTS;

  const startDrag = (e, key) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragKey(key);
  };

  // 포인터가 올라 있는 행 자리로 끌던 항목을 옮긴다 (행 높이가 같아 경계에서 떨리지 않는다)
  const onDrag = (e) => {
    if (!dragKey) return;
    const rows = [...listRef.current.children];
    const over = rows.findIndex((r) => e.clientY < r.getBoundingClientRect().bottom);
    const to = over < 0 ? rows.length - 1 : over;
    setKeys((prev) => moveKey(prev, prev.indexOf(dragKey), to));
  };

  const onHandleKey = (e, key) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!step) return;
    e.preventDefault();
    focusKey.current = key;
    const from = keys.indexOf(key);
    setKeys(moveKey(keys, from, from + step));
  };

  const onSave = () => {
    save(keys);
    navigate(ROUTE_PATHS.home);
  };

  return (
    <div className={styles.screen}>
      <p className={styles.guide}>
        서랍 메뉴에 있는 항목 중 최대 {MAX_SHORTCUTS}개를 골라요. 왼쪽 ⋮⋮ 를 끌어서 순서를 바꾸고, 이 브라우저에 저장돼요.
      </p>

      <h2 className={styles.heading}>{`내 바로가기 ${keys.length} / ${MAX_SHORTCUTS}`}</h2>
      {keys.length === 0 ? (
        <p className={styles.empty}>고른 항목이 없어요. 아래에서 추가해 주세요.</p>
      ) : (
        <ul ref={listRef} className={styles.list}>
          {keys.map((key) => {
            const item = ITEM_BY_KEY.get(key);
            return (
              <li key={key} className={styles.row} data-dragging={key === dragKey || undefined}>
                <button
                  type="button"
                  className={styles.handle}
                  data-handle={key}
                  aria-label={`${item.label} 순서 바꾸기. 끌거나 위아래 방향키를 누르세요`}
                  onPointerDown={(e) => startDrag(e, key)}
                  onPointerMove={onDrag}
                  onPointerUp={() => setDragKey(null)}
                  onPointerCancel={() => setDragKey(null)}
                  onKeyDown={(e) => onHandleKey(e, key)}
                >
                  ⋮⋮
                </button>
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                <button type="button" className={styles.action} onClick={() => setKeys(toggleKey(keys, key))}>
                  해제
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className={styles.heading}>
        {full ? "추가할 수 있는 메뉴 (8개가 꽉 찼어요)" : `추가할 수 있는 메뉴 ${MAX_SHORTCUTS - keys.length}칸 남음`}
      </h2>
      <ul className={styles.list}>
        {rest.map((item) => (
          <li key={item.key} className={styles.row}>
            <span className={styles.icon} aria-hidden="true">{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
            <button type="button" className={styles.action} disabled={full} onClick={() => setKeys(toggleKey(keys, item.key))}>
              추가
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button type="button" className={styles.ghost} onClick={() => setKeys(defaultKeys(true))}>
          기본값으로
        </button>
        <button type="button" className={styles.primary} disabled={keys.length === 0} onClick={onSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default ShortcutEditScreen;
