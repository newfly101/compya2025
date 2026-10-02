import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gradeColorKey, groupSkillsByGrade, isRecommended } from "@/domains/legendCollectionSkills/config/legendCollectionSkills.js";
import styles from "./SkillSelect.module.scss";

/**
 * 스킬 선택 드롭다운 — 등급별 묶음 라벨(칩) + 목록. 모바일 기본 선택창은 묶음·색을 못 보여 줘서 직접 만든다.
 * skills: [{serverId, name, grade}], isTaken(serverId): 같은 카드 다른 칸에서 이미 고른 스킬이면 true(선택 불가)
 */
const SkillSelect = ({ label, value, skills, isTaken, disabled, onChange }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef(null);
  const listId = useId();
  const groups = useMemo(() => groupSkillsByGrade(skills), [skills]);
  const flat = useMemo(() => groups.flatMap((g) => g.skills), [groups]);
  const current = flat.find((s) => s.serverId === value);
  const enabledIdx = (from, step) => {
    for (let i = from; i >= 0 && i < flat.length; i += step) if (!isTaken(flat[i].serverId)) return i;
    return -1;
  };

  useEffect(() => {
    if (!open) return;
    const away = (e) => !root.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  const show = () => {
    setActive(Math.max(0, flat.findIndex((s) => s.serverId === value)));
    setOpen(true);
  };
  const choose = (i) => {
    onChange(flat[i].serverId);
    setOpen(false);
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const step = e.key === "ArrowDown" ? 1 : -1;
      const next = enabledIdx(active + step, step);
      if (next >= 0) setActive(next);
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (active >= 0 && !isTaken(flat[active].serverId)) choose(active);
    }
  };

  let n = -1;
  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.btn}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={disabled}
        data-empty={!current || undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        {current ? (
          <span className={styles.chip} data-grade={gradeColorKey(current.grade)}>
            {current.name}
          </span>
        ) : (
          <span>스킬 선택</span>
        )}
      </button>
      {open && (
        <div className={styles.list} id={listId} role="listbox" aria-label={label}>
          {groups.map((g) => (
            <div key={g.grade} role="presentation">
              {g.skills.map((s) => {
                const i = ++n;
                const taken = isTaken(s.serverId);
                return (
                  <div
                    key={s.serverId}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={s.serverId === value}
                    aria-disabled={taken || undefined}
                    data-active={i === active || undefined}
                    onPointerEnter={() => !taken && setActive(i)}
                    onClick={() => !taken && choose(i)}
                  >
                    <span className={styles.chip} data-grade={g.key}>
                      {s.name}
                    </span>
                    {isRecommended(s) && <span className={styles.rec}>추천</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillSelect;
