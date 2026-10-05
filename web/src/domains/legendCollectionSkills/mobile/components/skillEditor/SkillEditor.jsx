import { useEffect, useState } from "react";
import {
  ACTION,
  BULK,
  REG_GRADES,
  SLOT_COUNT,
  applyActions,
  calcNeed,
  showEnhanceControls,
  bulkEnabled,
  canEnhance,
  enhanceEnabled,
  isEditLocked,
  slotCanTake,
  usageTotal,
} from "@/domains/legendCollectionSkills/config/legendCollectionSkills.js";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import SkillCard from "@/domains/legendCollectionSkills/mobile/components/skillCard/SkillCard.jsx";
import SkillSelect from "@/domains/legendCollectionSkills/mobile/components/skillSelect/SkillSelect.jsx";
import styles from "./SkillEditor.module.scss";

const toDraft = (slots) =>
  Array.from({ length: SLOT_COUNT }, (_, i) => ({
    skillId: slots?.[i]?.skillId ?? "",
    baseGrade: slots?.[i]?.baseGrade ?? "E",
  }));

const ENHANCE = [
  [ACTION.BASE_UP, "기본 강화"],
  [ACTION.GCG_UP, "고추강"],
  [ACTION.GGG_UP, "고고각"],
];

const errorText = (e) =>
  e.unauthorized
    ? "로그인이 만료됐어요. 다시 로그인해 주세요."
    : e.conflict
      ? "다른 기기에서 먼저 수정됐어요. 새로 불러온 뒤 다시 시도해 주세요."
      : e.message;

/**
 * 펼친 행의 스킬 편집 (왼쪽 카드 + 오른쪽 슬롯 3칸·필요 재화·버튼).
 * 서버 응답(저장·강화·UNDO·RESET)마다 부모가 key(item.rev)로 다시 만든다 — 초안·선택·대기 목록은 그때 비워진다.
 * 강화 버튼 → 슬롯 선택 → 대기 목록(actions)에 쌓기 → '저장' 한 번에 batch. armed = 선택된 강화 버튼.
 */
const SkillEditor = ({ row, c, dirtyRef }) => {
  const { item, legend } = row;
  const [draft, setDraft] = useState(() => toDraft(item.slots));
  const [armed, setArmed] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actions, setActions] = useState([]);
  const [ask, setAsk] = useState(null); // 확인 모달 { title, message, confirmText, tone, run }
  const pending = actions.length;

  useEffect(() => {
    dirtyRef.current = pending;
    return () => {
      dirtyRef.current = 0;
    };
  }, [dirtyRef, pending]);

  const saved = item.slots;
  const bulk = item.bulkMode;
  const skillGradeOf = (id) => c.skillById.get(id)?.grade;
  const complete = draft.every((d) => d.skillId);
  const registered =
    !!saved && draft.every((d, i) => d.skillId === saved[i].skillId && d.baseGrade === saved[i].baseGrade);
  const enhanceable = canEnhance(item);
  const options = c.skillsOf(legend.type);

  // 서버 항목 + 대기 목록을 적용한 화면 값
  const view = registered ? applyActions(item, actions, skillGradeOf) : item;
  const usage = view.usage;
  const locked = isEditLocked(usage, bulk);
  const showControls = showEnhanceControls(registered, enhanceable);

  const enhSlots = registered
    ? view.slots.map((s) => ({ currentGrade: s.currentGrade, skillGrade: skillGradeOf(s.skillId) }))
    : [];
  const enabled = registered ? enhanceEnabled(enhSlots, usage, bulk) : {};
  const need = complete
    ? calcNeed(draft.map((d) => ({ baseGrade: d.baseGrade, skillGrade: skillGradeOf(d.skillId) })))
    : null;

  const cardSlots =
    (registered ? view.slots : saved)?.map((s) => ({
      name: c.skillById.get(s.skillId)?.name ?? "",
      grade: s.currentGrade,
      skillGrade: skillGradeOf(s.skillId),
    })) ?? null;

  const change = (i, patch) => {
    setArmed(null);
    setDraft((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  const exec = async (fn) => {
    setBusy(true);
    const err = await fn();
    setBusy(false);
    setError(err);
  };

  const save = () => exec(() => c.save(item.legendId, draft));
  const act = (action, slot) => exec(() => c.act(item.legendId, action, slot));
  const saveBatch = () => exec(() => c.batch(item.legendId, actions));
  // 일괄은 즉시 저장 — 대기 목록은 버린다
  const bulkApply = (action) => {
    const run = () => {
      setActions([]);
      act(action);
    };
    if (!pending) return run();
    setAsk({ title: "저장하지 않은 강화", message: `저장하지 않은 강화 ${pending}건이 사라져요.`, confirmText: "버리기", tone: "danger", run });
  };
  const pick = (i) => {
    if (!slotCanTake(armed, enhSlots[i])) return;
    setActions((a) => [...a, { action: armed, slot: i + 1 }]);
    setArmed(null);
  };
  const undo = () =>
    setAsk({
      title: "되돌리기",
      message: "등록한 스킬·등급 상태로 돌아갑니다. 강화 기록은 지워져요.",
      confirmText: "되돌리기",
      run: () => {
        setActions([]);
        setArmed(null);
        if (usageTotal(item.usage) > 0 || bulk) act(ACTION.UNDO);
      },
    });
  const reset = () =>
    setAsk({
      title: "스킬 초기화",
      message: "스킬 3칸을 모두 비웁니다. 강화 기록도 함께 지워져요.",
      confirmText: "초기화",
      tone: "danger",
      run: () => {
        setActions([]);
        act(ACTION.RESET);
      },
    });

  const needText = (n, used) => (need ? `${used}/${n}장` : "—");

  return (
    <div className={styles.editor}>
      <div className={styles.head}>
        <strong className={styles.name}>{legend.name}</strong>
        <span className={styles.meta}>{[legend.grade, legend.team, ...legend.pos].filter(Boolean).join(" · ")}</span>
        <span className={styles.spacer} />
        <LegendBadge fill={item.status === "OWNED"}>{item.status === "OWNED" ? "보유중" : "액자"}</LegendBadge>
      </div>
      <div className={styles.body}>
      <div className={styles.left}>
        <SkillCard
          kind={legend.type === "투수" ? "pitcher" : "hitter"}
          team={legend.team}
          name={legend.name}
          position={legend.pos[0]}
          enhanceCount={view.enhanceCount}
          slots={cardSlots}
        />
        {showControls && (
          <div className={styles.bulk} role="group" aria-label="일괄 적용">
            <button
              type="button"
              aria-pressed={bulk === BULK.S}
              disabled={busy || bulk === BULK.S || !bulkEnabled(BULK.S, enhSlots)}
              onClick={() => bulkApply(ACTION.BULK_S)}
            >
              S 일괄 적용
            </button>
            <button
              type="button"
              aria-pressed={bulk === BULK.NO_GGG}
              disabled={busy || bulk === BULK.S || bulk === BULK.NO_GGG || !bulkEnabled(BULK.NO_GGG, enhSlots)}
              onClick={() => bulkApply(ACTION.BULK_NO_GGG)}
            >
              고고각 제외 적용
            </button>
          </div>
        )}
      </div>

      <div className={styles.right}>
        <p className={styles.title}>스킬 등록</p>
        {draft.map((d, i) => {
          const takable = !!armed && slotCanTake(armed, enhSlots[i]);
          return (
          <div key={i} className={styles.slot} data-armed={takable || undefined}>
            <SkillSelect
              label={`스킬 ${i + 1}`}
              value={d.skillId}
              skills={options}
              isTaken={(id) => draft.some((x, j) => j !== i && x.skillId === id)}
              disabled={locked}
              onChange={(skillId) => change(i, { skillId })}
            />
            <select
              aria-label={`등급 ${i + 1}`}
              className={styles.grade}
              value={d.baseGrade}
              disabled={locked}
              onChange={(e) => change(i, { baseGrade: e.target.value })}
            >
              {REG_GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            {armed && (
              <button
                type="button"
                className={styles.pick}
                aria-label={`${i + 1}번 스킬에 적용`}
                aria-disabled={!takable}
                data-disabled={!takable || undefined}
                onClick={() => pick(i)}
              />
            )}
          </div>
          );
        })}

        <p className={styles.title}>필요 재화 (사용 / 필요)</p>
        <dl className={styles.need}>
          <div>
            <dt>고고각 (고급 고유능력 각성권)</dt>
            <dd>{needText(need?.ggg, usage.ggg)}</dd>
          </div>
          <div>
            <dt>고추강 (고유능력 추가 강화권)</dt>
            <dd>{needText(need?.gcg, usage.gcg)}</dd>
          </div>
        </dl>

        <div className={styles.actions}>
          {!registered && (
            <button type="button" className={styles.primary} disabled={busy || !complete} onClick={save}>
              저장
            </button>
          )}
          {showControls && bulk !== BULK.S && (
            <div className={styles.enhance}>
              {ENHANCE.map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  aria-pressed={armed === action}
                  disabled={busy || !enabled[action]}
                  onClick={() => setArmed(armed === action ? null : action)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {showControls && pending > 0 && (
            <button type="button" className={styles.primary} disabled={busy} onClick={saveBatch}>
              {`저장 (${pending})`}
            </button>
          )}
          {registered && (
            <div className={styles.enhance}>
              {enhanceable && (
                <button type="button" disabled={busy || (!pending && usageTotal(item.usage) === 0 && !bulk)} onClick={undo}>
                  되돌리기
                </button>
              )}
              <button type="button" disabled={busy} onClick={reset}>
                스킬 초기화
              </button>
            </div>
          )}
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {errorText(error)}
          </p>
        )}
      </div>
      </div>
      <ConfirmModal
        open={!!ask}
        title={ask?.title}
        message={ask?.message}
        confirmText={ask?.confirmText}
        tone={ask?.tone}
        onCancel={() => setAsk(null)}
        onConfirm={() => {
          const { run } = ask;
          setAsk(null);
          run();
        }}
      />
    </div>
  );
};

export default SkillEditor;
