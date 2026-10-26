import { useState } from "react";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";
import SkillCard from "@/global/ui/skillCard/SkillCard.jsx";
import styles from "./SimulatorPanel.module.scss";

/**
 * 시뮬레이터 영역 — 왼쪽 스킬 카드, 오른쪽 변경권 버튼열 · 누적 표시.
 * sim: useGsbSimulator() 결과. 선변은 선택 모드(pick)에서 칸을 고른 뒤 변경/취소. 평상시엔 변경·취소가 없고, 선택 모드에서만 나타난다.
 */
const SimulatorPanel = ({ sim, nickname }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const { legend, kind, slots, counts, pick } = sim;
  const picking = pick !== null;
  const hasSlots = Boolean(slots);
  const hint = picking ? (pick.slot == null ? "바꿀 스킬 1개를 눌러 주세요" : "변경을 누르면 고른 칸만 다시 뽑아요") : "스킬을 바꿔 보세요";

  return (
    <section className={styles.panel} aria-label="시뮬레이터">
      <div className={styles.left}>
        <div className={styles.card}>
          <SkillCard
            kind={kind}
            team={legend.team}
            name={legend.name}
            position={legend.pos[0]}
            slots={slots}
            hideEnhance
            emptyText="고급 고유능력 변경권을 눌러 스킬을 뽑아 보세요"
            selectedSlot={pick?.slot ?? undefined}
            onSelectSlot={picking ? sim.pickSlot : undefined}
          />
        </div>
        <p className={styles.counts}>
          <span className={styles.count}>
            <span className={styles.label}>고스변</span>
            <b className={styles.num}>{counts.gsb}</b>
          </span>
          <span className={styles.count}>
            <span className={styles.label}>선변</span>
            <b className={styles.num}>{counts.sel}</b>
          </span>
        </p>
      </div>
      <div className={styles.side}>
        <p className={styles.hint} role={sim.saveError ? "alert" : undefined}>
          {sim.saveError ? "이미지를 저장하지 못했어요. 다시 시도해 주세요." : hint}
        </p>
        <button type="button" className={styles.gsb} disabled={picking} onClick={sim.rollAll}>
          고급 고유능력 변경권
        </button>
        {/* 선변 금색 = 등급 축 플래티넘. fe-design-audit § 5 예외(게임의 선택 변경권 색) */}
        <button type="button" className={styles.sel} aria-pressed={picking} disabled={!hasSlots} onClick={picking ? sim.cancelPick : sim.startPick}>
          고유능력 선택 변경권
        </button>
        {picking ? (
          <div className={styles.row}>
            <button type="button" className={styles.plain} disabled={pick.slot == null} onClick={sim.confirmPick}>
              변경
            </button>
            <button type="button" className={styles.plain} onClick={sim.cancelPick}>
              취소
            </button>
          </div>
        ) : (
          <div className={styles.row}>
            <button type="button" className={styles.plain} disabled={!hasSlots || sim.saving} onClick={() => sim.saveImage(nickname)}>
              이미지 저장
            </button>
            <button type="button" className={styles.plain} disabled={!hasSlots} onClick={() => setConfirmReset(true)}>
              초기화
            </button>
          </div>
        )}
      </div>
      <ConfirmModal
        open={confirmReset}
        title="이 선수의 기록을 초기화할까요?"
        message={`${legend.name}의 고스변·선변 횟수와 스킬 기록이 모두 지워져요.`}
        confirmText="초기화"
        tone="danger"
        onConfirm={() => {
          setConfirmReset(false);
          sim.reset();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </section>
  );
};

export default SimulatorPanel;
