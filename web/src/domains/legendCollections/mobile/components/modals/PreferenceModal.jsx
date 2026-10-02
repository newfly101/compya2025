import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ALL, TYPE_FILTERS, teamColor } from "@/domains/legendStats/config/legendStats.js";
import { LEGEND, MAX_PREFERENCES } from "@/domains/legendCollections/config/legendCollections.js";
import SearchInput from "@/global/ui/mobile/searchInput/SearchInput.jsx";
import FilterChips from "@/domains/legendCollections/mobile/components/filterChips/FilterChips.jsx";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import styles from "./Modals.module.scss";

const TYPE_OPTIONS = TYPE_FILTERS.map((t) => ({ value: t }));
const metaOf = (l) => [l.team, ...l.pos].filter(Boolean).join(" · ");

/**
 * 선호 레전드 고르기 (Figma 05 424:247) — 가운데 모달. 미보유 레전드만 후보, 최대 10, 1~10 순위.
 * 줄 전체를 끌어(키보드는 줄에 포커스 후 ↑↓) 순서를 바꾸고, 액자 토글은 미보유↔액자만 바꾼다 (REQ-LCOL-05·17).
 */
const PreferenceModal = ({ legends, server, countOf, onSave, onClose }) => {
  const [picked, setPicked] = useState(() => server.preferences.filter((id) => server.legends[id] !== LEGEND.OWNED));
  const [frames, setFrames] = useState(() =>
    Object.fromEntries(legends.map((l) => [l.id, server.legends[l.id] === LEGEND.FRAME])),
  );
  const [query, setQuery] = useState("");
  const [type, setType] = useState(ALL); // 후보 목록만 거른다 — 고른 순위 목록은 그대로
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const byId = new Map(legends.map((l) => [l.id, l]));
  const q = query.trim();
  const candidates = legends.filter(
    (l) => server.legends[l.id] !== LEGEND.OWNED && !picked.includes(l.id) && (type === ALL || l.type === type) && (!q || l.name.includes(q)),
  );

  const add = (id) => {
    if (picked.length >= MAX_PREFERENCES) {
      setNotice(`선호 레전드는 최대 ${MAX_PREFERENCES}명까지 고를 수 있어요.`);
      return;
    }
    setNotice("");
    setPicked([...picked, id]);
  };

  const remove = (id) => {
    setNotice("");
    setPicked(picked.filter((p) => p !== id));
  };

  const move = (from, to) => {
    if (to < 0 || to >= picked.length || from === to) return;
    const next = [...picked];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setPicked(next);
  };

  // 끌어서 순서 바꾸기 — 줄 전체가 포인터를 붙잡고, 포인터가 지나는 줄 자리로 옮긴다.
  // 줄 안의 버튼(액자·빼기)을 누른 경우는 끌기로 보지 않는다
  const onHandleDown = (e, index) => {
    if (e.target.closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(index);
  };
  const onHandleMove = (e) => {
    if (dragging === null || !listRef.current) return;
    const rows = [...listRef.current.children];
    const target = rows.findIndex((row) => {
      const r = row.getBoundingClientRect();
      return e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (target >= 0 && target !== dragging) {
      move(dragging, target);
      setDragging(target);
    }
  };
  const onHandleUp = () => setDragging(null);
  const onHandleKey = (e, index) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      move(index, index - 1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(index, index + 1);
    }
  };

  const submit = async () => {
    setSaving(true);
    const error = await onSave(picked, frames);
    setSaving(false);
    if (error) setNotice(error.message ?? "저장하지 못했습니다.");
    else onClose(true);
  };

  return createPortal(
    <div className={styles.overlay}>
      <div
        className={`${styles.modal} ${styles.prefs}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lcol-prefs-title"
      >
        <div>
          <div className={styles.prefsHead}>
            <h2 id="lcol-prefs-title" className={styles.title}>
              선호 레전드
            </h2>
            <span className={styles.count}>{`${picked.length} / ${MAX_PREFERENCES}`}</span>
            <button type="button" className={styles.close} aria-label="닫기" onClick={() => onClose()}>
              ✕
            </button>
          </div>
          <p className={styles.sub}>미보유 레전드만 · 최대 10명 · 액자는 눌러서 켜고 끄기</p>
          <p className={styles.sub}>드래그 앤 드롭으로 순서를 자유롭게 바꿀 수 있어요</p>
        </div>

        <p className={styles.label}>내 순위</p>
        {picked.length === 0 ? (
          <p className={styles.emptyPick}>아래에서 모으고 싶은 레전드를 골라 주세요.</p>
        ) : (
          <ol className={styles.picked} ref={listRef}>
            {picked.map((id, i) => {
              const l = byId.get(id);
              if (!l) return null;
              return (
                <li
                  key={id}
                  tabIndex={0}
                  aria-label={`${l.name} 순위 ${i + 1}, 끌거나 위아래 화살표로 순서 바꾸기`}
                  data-dragging={dragging === i || undefined}
                  onPointerDown={(e) => onHandleDown(e, i)}
                  onPointerMove={onHandleMove}
                  onPointerUp={onHandleUp}
                  onPointerCancel={onHandleUp}
                  onKeyDown={(e) => onHandleKey(e, i)}
                >
                  <span className={styles.rankNo}>{i + 1}</span>
                  <span className={styles.dot} style={{ color: teamColor(l.team) }} aria-hidden="true" />
                  <strong className={styles.pickName}>{l.name}</strong>
                  <span className={styles.meta}>{metaOf(l)}</span>
                  <button
                    type="button"
                    className={styles.frameBtn}
                    aria-pressed={!!frames[id]}
                    aria-label={`${l.name} 액자`}
                    onClick={() => setFrames({ ...frames, [id]: !frames[id] })}
                  >
                    액자
                  </button>
                  <button type="button" className={styles.iconBtn} aria-label={`${l.name} 선호에서 빼기`} onClick={() => remove(id)}>
                    ✕
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <SearchInput value={query} onChange={setQuery} placeholder="미보유 레전드 이름 검색" />
        <FilterChips label="타자·투수" variant="seg" options={TYPE_OPTIONS} value={type} onChange={setType} />

        <ul className={styles.candidates}>
          {candidates.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => add(l.id)} aria-label={`${l.name} 선호에 추가`}>
                <span className={styles.check} aria-hidden="true" />
                <span className={styles.dot} style={{ color: teamColor(l.team) }} aria-hidden="true" />
                <span className={styles.candName}>{l.name}</span>
                <span className={styles.meta}>{metaOf(l)}</span>
                {frames[l.id] && <LegendBadge>액자</LegendBadge>}
                <span className={styles.meta0}>{`${countOf(l.id)}/8`}</span>
              </button>
            </li>
          ))}
          {candidates.length === 0 && <li className={styles.emptyPick}>조건에 맞는 미보유 레전드가 없습니다.</li>}
        </ul>

        {notice && (
          <p className={styles.notice} role="alert">
            {notice}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => onClose()}>
            닫기
          </button>
          <button type="button" className={styles.primary} disabled={saving} onClick={submit}>
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
        <p className={styles.foot}>레전드를 &quot;보유중&quot;으로 바꾸면 선호에서 자동으로 빠지고 순위가 당겨져요.</p>
      </div>
    </div>,
    document.getElementById("modal") ?? document.body,
  );
};

export default PreferenceModal;
