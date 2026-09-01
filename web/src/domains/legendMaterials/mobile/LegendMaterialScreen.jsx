import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TEAM_COLOR,
  ROLE_FILTERS,
  OWNED_FILTERS,
  SOURCE_META,
  filterLegends,
  legendMeta,
} from "@/domains/legendMaterials/config/legendMaterials.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useLegendMaterials } from "./hooks/useLegendMaterials";
import { useOwnedMaterials } from "./hooks/useOwnedMaterials";
import MaterialSourceSheet from "./components/materialSourceSheet/MaterialSourceSheet";
import "./legendMaterials.tokens.scss";
import styles from "./LegendMaterialScreen.module.scss";

const LegendMaterialScreen = () => {
  useDomainTopBar("레전드 재료");

  const [searchParams, setSearchParams] = useSearchParams();
  const { legends: allLegends, teams, loading, loaded, error } = useLegendMaterials();
  const { isOwned, toggle } = useOwnedMaterials();

  const [ownedFilter, setOwnedFilter] = useState("ALL");
  const [sheetMaterial, setSheetMaterial] = useState(null);

  // ── URL 파라미터로 상태를 잡는다 — 뒤로가기·공유가 그대로 동작한다.
  // team 파라미터 값은 team_code 소문자다 (예: 한화 → han). teams 목록에 없는 값이면 기본값으로 대체한다.
  const teamParam = searchParams.get("team");
  const defaultTeamSlug = teams.find((t) => t.slug === "kia")?.slug ?? teams[0]?.slug ?? null;
  const activeTeamSlug = teams.some((t) => t.slug === teamParam) ? teamParam : defaultTeamSlug;

  const roleParam = searchParams.get("role");
  const activeRole = ROLE_FILTERS.some((r) => r.key === roleParam) ? roleParam : "ALL";

  const legends = useMemo(
    () => filterLegends(allLegends, activeTeamSlug, activeRole),
    [allLegends, activeTeamSlug, activeRole]
  );

  // 재료 리스트는 이름 pill 을 눌렀을 때만 바뀐다.
  // 구단·타입을 바꿔도 이미 펼쳐 둔 레전드는 그대로 남는다 (디자인 규칙 1·2·3).
  const legendParam = searchParams.get("legend");
  const activeLegend = allLegends.find((l) => l.slug === legendParam) ?? null;

  const patch = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams);
      for (const [k, v] of Object.entries(next)) {
        if (v === null) params.delete(k);
        else params.set(k, v);
      }
      // 칩을 누를 때마다 히스토리가 쌓이면 뒤로가기로 화면을 빠져나갈 수 없다.
      // 현재 항목을 갈아끼워 한 번의 뒤로가기로 이전 화면으로 돌아가게 한다.
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const materials = activeLegend?.materials ?? [];
  const ownedCount = materials.filter((m) => isOwned(m.key)).length;
  const progress = materials.length > 0 ? (ownedCount / materials.length) * 100 : 0;

  const isDimmed = (m) => {
    if (ownedFilter === "OWNED") return !isOwned(m.key);
    if (ownedFilter === "MISSING") return isOwned(m.key);
    return false;
  };

  // 같은 필터를 다시 누르면 '전체'로 해제된다.
  const handleOwnedFilter = (key) => setOwnedFilter((prev) => (prev === key ? "ALL" : key));

  if (!loaded) {
    return (
      <div className={styles.screen}>
        <p className={styles.stateText}>{loading ? "불러오는 중…" : " "}</p>
      </div>
    );
  }

  if (error || teams.length === 0) {
    return (
      <div className={styles.screen}>
        <p className={styles.stateText}>
          재료 정보를 불러오지 못했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      {/* ── 구단 칩 ─────────────────────────────────────────── */}
      <div className={styles.teamScroller}>
        {teams.map((t) => {
          const active = t.slug === activeTeamSlug;
          return (
            <button
              key={t.slug}
              type="button"
              className={`${styles.teamChip} ${active ? styles.chipActive : ""}`}
              onClick={() => patch({ team: t.slug })}
              aria-pressed={active}
            >
              <span className={styles.teamDot} style={{ backgroundColor: TEAM_COLOR[t.slug] }} aria-hidden="true" />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* ── 타입 세그먼트 ───────────────────────────────────── */}
      <div className={styles.typeRow}>
        {ROLE_FILTERS.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`${styles.typeButton} ${activeRole === r.key ? styles.chipActive : ""}`}
            onClick={() => patch({ role: r.key })}
            aria-pressed={activeRole === r.key}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── 레전드 이름 pill ────────────────────────────────── */}
      <div className={styles.legendScroller}>
        {legends.length === 0 ? (
          <span className={styles.legendEmpty}>해당 조건의 레전드가 없습니다.</span>
        ) : (
          legends.map((l) => {
            const active = l.slug === activeLegend?.slug;
            return (
              <button
                key={l.slug}
                type="button"
                className={`${styles.legendPill} ${active ? styles.chipActive : ""}`}
                onClick={() => patch({ legend: l.slug })}
                aria-pressed={active}
              >
                {l.name}
              </button>
            );
          })
        )}
      </div>

      {!activeLegend ? (
        /* ── 미선택 안내 ───────────────────────────────────── */
        <div className={styles.placeholder}>
          <span className={styles.placeholderRing} aria-hidden="true" />
          <p className={styles.placeholderText}>
            레전드 선수를 선택하시면,
            <br />
            재료 리스트가 나옵니다.
          </p>
          <p className={styles.placeholderHint}>위 이름 버튼을 눌러주세요</p>
        </div>
      ) : (
        <>
          {/* ── 요약행 ──────────────────────────────────────── */}
          <div className={styles.summary}>
            <div className={styles.summaryMain}>
              <div className={styles.summaryTitleRow}>
                <span className={styles.summaryName}>{activeLegend.name}</span>
                <span className={styles.summaryMeta}>{legendMeta(activeLegend)}</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className={styles.progressCount}>
              {ownedCount}/{materials.length}
            </span>
          </div>

          {/* ── 보유 필터 ───────────────────────────────────── */}
          <div className={styles.filterRow}>
            {OWNED_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${styles.filterChip} ${ownedFilter === f.key ? styles.chipActive : ""}`}
                onClick={() => handleOwnedFilter(f.key)}
                aria-pressed={ownedFilter === f.key}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ── 재료 그리드 ─────────────────────────────────── */}
          <div className={styles.grid}>
            {materials.map((m) => {
              const owned = isOwned(m.key);
              const sourceMeta = m.source ? SOURCE_META[m.source.type] : null;
              return (
                // 카드 안에 획득처 버튼이 들어가므로 카드는 button 이 아니라
                // role="button" div 로 둔다 (button 중첩은 유효하지 않은 마크업).
                <div
                  key={m.key}
                  role="button"
                  tabIndex={0}
                  className={[
                    styles.card,
                    owned ? styles.cardOwned : "",
                    isDimmed(m) ? styles.cardDimmed : "",
                  ].join(" ")}
                  onClick={() => toggle(m.key)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    toggle(m.key);
                  }}
                  aria-pressed={owned}
                  aria-label={`${m.name} ${owned ? "보유" : "미보유"}`}
                >
                  <span className={styles.stripe} aria-hidden="true" />

                  <span className={styles.cardTop}>
                    <span className={styles.teamTag}>{m.team}</span>

                    {sourceMeta && (
                      // 카드 보유 토글이 함께 실행되면 안 된다.
                      <button
                        type="button"
                        className={`${styles.sourceBadge} ${
                          m.source.type === "HISTORY" ? styles.sourceHistory : styles.sourceMileage
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSheetMaterial(m);
                        }}
                        aria-label={`${m.name} 획득처 — ${sourceMeta.label}`}
                      >
                        <span className={styles.sourceDot} aria-hidden="true" />
                        {sourceMeta.label}
                      </button>
                    )}

                    <span className={styles.spacer} />

                    {owned ? (
                      <span className={styles.check} aria-hidden="true">
                        ✓
                      </span>
                    ) : (
                      <span className={styles.lock} aria-hidden="true">
                        <span className={styles.lockShackle} />
                        <span className={styles.lockBody} />
                      </span>
                    )}
                  </span>

                  <span className={styles.cardName}>{m.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <MaterialSourceSheet material={sheetMaterial} onClose={() => setSheetMaterial(null)} />
    </div>
  );
};

export default LegendMaterialScreen;
