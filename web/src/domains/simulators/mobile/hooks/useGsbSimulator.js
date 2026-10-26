import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats.js";
import { usePlayerSkills } from "@/domains/playerSkills/mobile/hooks/usePlayerSkills.js";
import { buildPools, emptyEntry, randTier, rollGsb, rollSelect } from "@/domains/simulators/config/gsb.js";
import { requestDeleteGsb, requestGetGsb, requestPostGsbSave } from "@/domains/simulators/store/public/thunks.js";
import { deliverImage, drawShareCard } from "@/domains/simulators/mobile/utils/drawShareCard.js";
import { useGsbSync } from "./useGsbSync.js";

const toPoolSkill = (s) => ({ serverId: s.serverId, name: s.name, grade: s.grade });
const kindOf = (legend) => (legend?.type === "투수" ? "pitcher" : "hitter");

/**
 * 고스변 시뮬레이터 — 레전드 목록 · 스킬 마스터 · 내 기록을 묶고, 돌리기·선변·초기화를 로컬에서 처리한다.
 * 서버 저장은 useGsbSync 가 묶어서 한다(돌릴 때마다 보내지 않는다). 401 이면 unauthorized=true.
 */
export const useGsbSimulator = () => {
  const dispatch = useDispatch();
  const stats = useLegendStats();
  const hitters = usePlayerSkills("hitter");
  const pitchers = usePlayerSkills("pitcher");
  const { loading: gsbLoading, error: gsbError } = useSelector((state) => state.simulators);

  const [entries, setEntries] = useState({}); // { [legendId]: { g, c, s[3] } }
  const entriesRef = useRef(entries);
  const [selectedId, setSelectedId] = useState(null);
  const [pick, setPick] = useState(null); // null = 평소 · { slot: null | 0~2 } = 선변 선택 모드
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { markDirty, forget } = useGsbSync(entriesRef);

  const load = useCallback(() => {
    dispatch(requestGetGsb())
      .unwrap()
      .then((items) => {
        // 서버 값이 있고 로컬이 없을 때만 채운다 — 이미 돌린 로컬 값이 우선
        const server = Object.fromEntries(items.map((i) => [i.legendId, { g: i.gsbCount, c: i.selCount, s: i.skillIds, t: i.skillTiers ?? [] }]));
        entriesRef.current = { ...server, ...entriesRef.current };
        setEntries(entriesRef.current);
      })
      .catch((payload) => setUnauthorized(Boolean(payload?.unauthorized)));
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const skillById = useMemo(() => new Map(hitters.all.map((s) => [s.serverId, s])), [hitters.all]);
  const pools = useMemo(() => {
    const poolOf = (type) => buildPools(hitters.all.filter((s) => s.type === type).map(toPoolSkill));
    return { hitter: poolOf("hitter"), pitcher: poolOf("pitcher") };
  }, [hitters.all]);

  const legend = useMemo(() => stats.legends.find((l) => l.id === selectedId) ?? null, [stats.legends, selectedId]);
  const kind = kindOf(legend);
  const entry = (legend && entries[legend.id]) ?? null;
  // 카드에 그릴 칸 — 스킬 마스터에 없는 id 가 하나라도 있으면 기록 없음으로 본다
  const slots = useMemo(() => {
    const list = entry?.s.map((id) => skillById.get(id));
    if (!list || list.length !== 3 || list.some((s) => !s)) return null;
    return list.map((s, i) => ({ name: s.name, skillGrade: s.grade, grade: entry.t?.[i] ?? null, tier: entry.t?.[i] ?? null }));
  }, [entry, skillById]);

  const loading = (!stats.loaded && stats.loading) || !hitters.loaded || !pitchers.loaded || gsbLoading;
  const error = stats.error || hitters.error || pitchers.error || gsbError;
  const skillsReady = hitters.loaded && pitchers.loaded;

  const update = (id, fn) => {
    entriesRef.current = { ...entriesRef.current, [id]: fn(entriesRef.current[id] ?? emptyEntry()) };
    setEntries(entriesRef.current);
    markDirty(id);
  };

  const select = (id) => {
    setSelectedId(id); // null = 선택 해제
    setPick(null);
  };

  const rollAll = () => {
    if (!legend || !skillsReady) return;
    const next = rollGsb(pools[kind]);
    update(legend.id, (e) => ({ ...e, g: e.g + 1, s: next.map((s) => s.serverId), t: next.map((s) => s.tier) }));
    setPick(null);
  };

  const startPick = () => slots && setPick({ slot: null });
  const pickSlot = (slot) => setPick({ slot });
  const cancelPick = () => setPick(null);
  const confirmPick = () => {
    if (!legend || !slots || pick?.slot == null) return;
    const current = entry.s.map((id, i) => ({ ...toPoolSkill(skillById.get(id)), tier: entry.t?.[i] ?? randTier() })); // 등급 글자 없는 옛 기록은 선변 때 채운다(서버는 3개를 받는다)
    const next = rollSelect(pools[kind], current, pick.slot);
    update(legend.id, (e) => ({ ...e, c: e.c + 1, s: next.map((s) => s.serverId), t: next.map((s) => s.tier) }));
    setPick(null);
  };

  const reset = () => {
    if (!legend) return;
    const rest = { ...entriesRef.current };
    delete rest[legend.id];
    entriesRef.current = rest;
    setEntries(rest);
    forget(legend.id);
    setPick(null);
    dispatch(requestDeleteGsb(legend.id)).unwrap().catch(() => {}); // 서버 삭제 실패는 화면에 영향 없음
  };

  // 이미지 저장 — 서버 기록(POST)은 결과를 기다리지도 신경 쓰지도 않는다. 이미지는 이 기기에서 만든다
  const saveImage = async (nickname) => {
    if (!legend || !slots || saving) return;
    setSaving(true);
    setSaveError(false);
    dispatch(requestPostGsbSave({ legendId: legend.id, gsbCount: entry.g, selCount: entry.c, skillIds: entry.s, skillTiers: entry.t }))
      .unwrap()
      .catch(() => {});
    try {
      const blob = await drawShareCard({ kind, team: legend.team, name: legend.name, position: legend.pos[0], slots, counts: { gsb: entry.g, sel: entry.c }, nickname });
      await deliverImage(blob, `${legend.name}-skill.png`);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const retry = () => {
    stats.retry();
    hitters.retry();
    pitchers.retry();
    load();
  };

  return {
    legends: stats.legends,
    legend,
    kind,
    entry,
    slots,
    counts: { gsb: entry?.g ?? 0, sel: entry?.c ?? 0 },
    pick,
    loading,
    error,
    unauthorized,
    retry,
    select,
    rollAll,
    startPick,
    pickSlot,
    cancelPick,
    confirmPick,
    reset,
    saveImage,
    saving,
    saveError,
  };
};
