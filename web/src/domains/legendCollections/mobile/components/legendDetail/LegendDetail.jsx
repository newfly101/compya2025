import { useState } from "react";
import {
  LEGEND,
  MATERIAL,
  canSetMaterial,
  isLockedInsert,
  legendCounts,
  legendStatus,
  materialState,
} from "@/domains/legendCollections/config/legendCollections.js";
import { getTodayKst } from "@/global/utils/datetime/dateUtils.js";
import MaterialCard from "@/domains/legendCollections/mobile/components/materialCard/MaterialCard.jsx";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import ProgressBar from "@/domains/legendCollections/mobile/components/progressBar/ProgressBar.jsx";
import StatusToggles from "@/domains/legendCollections/mobile/components/statusToggles/StatusToggles.jsx";
import styles from "./LegendDetail.module.scss";

/**
 * 펼친 레전드 (Figma 01 Expanded · 02 Expanded 재료 편집).
 * 머리(이름·구분·상태) → 8칸 막대 → 재료 선수 2열 → 코치 2칸 → (편집) 전체 초기화.
 * 재료는 펼친 뒤 도착한다. 늦거나 실패해도 머리 토글은 살아 있다.
 * materialsOnly — 내 목표 카드가 이미 머리·막대를 갖고 있어, 그 아래에 재료 8칸 영역만 같은 모양으로 붙인다.
 */
const LegendDetail = ({ legend, c, historyCards, mileageBadge, onReset, materialsOnly = false }) => {
  const { server, draft, editing, slotsOf, slotsLoading } = c;
  const slots = slotsOf(legend.id);
  const status = legendStatus(legend.id, server, draft);
  const owned = status === LEGEND.OWNED;
  const savedOwned = server.legends[legend.id] === LEGEND.OWNED; // 획득일 칸은 저장된 상태 기준: 액자=액자 칸, 보유중=둘 다
  const savedFrame = server.legends[legend.id] === LEGEND.FRAME;
  const acquiredAt = server.acquiredAt?.[legend.id] ?? "";
  const frameAcquiredAt = server.frameAcquiredAt?.[legend.id] ?? "";
  const pendingDate = draft.legends[legend.id] === LEGEND.FRAME || draft.legends[legend.id] === LEGEND.OWNED; // 편집 중 새로 바꾼 상태
  const [acqError, setAcqError] = useState(null);
  const [today] = useState(getTodayKst);
  const changeAcquiredAt = async (field, value) => {
    const error = await c.saveAcquiredAt(legend.id, { [field]: value || null });
    setAcqError(error?.message ?? null);
  };
  const { inserted, have, left } = legendCounts(legend.id, server, draft);
  const players = slots.filter((s) => !s.coach);
  const coaches = slots.filter((s) => s.coach);

  const renderCard = (slot) => (
    <MaterialCard
      key={slot.id}
      slot={slot}
      state={materialState(legend.id, slot.id, server, draft)}
      legendName={legend.name}
      editing={editing}
      locked={isLockedInsert(legend.id, slot.id, server, draft)}
      frozen={owned}
      canInsert={canSetMaterial(legend.id, slot.id, MATERIAL.INSERTED, server, draft)}
      mileageTarget={slot.cardId ? mileageBadge.get(slot.cardId) : undefined}
      inHistory={historyCards.has(slot.label)}
      onChange={(next) => c.changeMaterial(legend.id, slot.id, next)}
    />
  );

  return (
    <div className={styles.detail} data-embedded={materialsOnly || undefined}>
      {!materialsOnly && (
        <>
          <div className={styles.head}>
            <strong className={styles.name}>{legend.name}</strong>
            <span className={styles.meta}>{[legend.grade, legend.team, ...legend.pos].filter(Boolean).join(" · ")}</span>
            {editing ? (
              <>
                <span className={styles.spacer} />
                <StatusToggles status={status} legendName={legend.name} onChange={(next) => c.changeLegend(legend.id, next)} />
              </>
            ) : (
              <>
                {status === LEGEND.FRAME && <LegendBadge>액자</LegendBadge>}
                {owned && <LegendBadge fill>보유중</LegendBadge>}
              </>
            )}
          </div>

          <ProgressBar inserted={inserted} have={have} />
          <p className={styles.caption}>
            {owned ? "보유중 레전드 — 재료는 0/8 로 저장돼요" : `삽입 ${inserted} · 보유 ${have} · 남은 ${left}칸`}
          </p>
        </>
      )}

      {editing && pendingDate && (
        <div className={styles.acquired}>
          <label className={styles.caption} htmlFor={`acq-new-${legend.id}`}>
            {status === LEGEND.OWNED ? "보유 획득일" : "액자 획득일"}
          </label>
          <input
            id={`acq-new-${legend.id}`}
            type="date"
            value={draft.dates?.[legend.id] || today}
            max={today}
            onChange={(e) => c.changeLegendDate(legend.id, e.target.value || today)}
          />
        </div>
      )}

      {(savedFrame || savedOwned) && c.isAuthenticated && (
        <div className={styles.acquired}>
          {[
            ["frameAcquiredAt", "액자 획득일", frameAcquiredAt, true],
            ["acquiredAt", "보유 획득일", acquiredAt, savedOwned],
          ]
            .filter(([, , , show]) => show)
            .map(([field, label, value]) => (
              <div key={field} className={styles.acqField}>
                <label className={styles.caption} htmlFor={`acq-${field}-${legend.id}`}>
                  {label}
                </label>
                <input
                  id={`acq-${field}-${legend.id}`}
                  type="date"
                  value={value}
                  max={today}
                  disabled={c.saving}
                  onChange={(e) => changeAcquiredAt(field, e.target.value)}
                />
                {value ? (
                  <button type="button" onClick={() => changeAcquiredAt(field, "")} disabled={c.saving}>
                    지우기
                  </button>
                ) : (
                  <span className={styles.note}>미입력</span>
                )}
              </div>
            ))}
          <p className={styles.note}>게임 내 도전과제 › 컬렉션 › 레전드 컬렉션에서 해당 레전드의 획득일을 확인할 수 있어요</p>
          {acqError && <p className={styles.note} role="alert">{acqError}</p>}
        </div>
      )}

      {slots.length === 0 ? (
        <p className={styles.note}>{slotsLoading ? "재료 불러오는 중…" : "재료 정보를 불러오지 못했습니다."}</p>
      ) : (
        <>
          <p className={styles.caption}>재료 선수</p>
          <div className={styles.grid}>{players.map(renderCard)}</div>
          {coaches.length > 0 && (
            <>
              <p className={styles.caption}>코치</p>
              <div className={styles.grid}>{coaches.map(renderCard)}</div>
              <p className={styles.note}>코치는 세트 6장 중 아무 1장만 넣으면 채워져요</p>
            </>
          )}
          {editing && (
            <div className={styles.reset}>
              <span className={styles.note}>저장한 삽입은 되돌릴 수 없어요</span>
              <button type="button" onClick={() => onReset(legend)}>
                재료 전체 초기화
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LegendDetail;
