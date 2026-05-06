import { useCallback, useEffect, useMemo, useState } from "react";
import { legendStuff } from "@/data/historyMode/LegendStuff.js";
import { legendMeta } from "@/data/historyMode/LegendMeta.js";

export const fmt = (player, years) => `${player}'${String(years).slice(-2)}`;

const stageKey = (stage) =>
  stage ? `${stage.day}-${stage.roaster}` : null;

const findMeta = (name) => legendMeta.find((m) => m.name === name) ?? null;

export const useHistoryMode = () => {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [positionFilter, setPositionFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedStage, setSelectedStage] = useState(null);

  const legendsByPosition = useMemo(() => {
    if (positionFilter === "all") return legendMeta;
    return legendMeta.filter((m) => m.position === positionFilter);
  }, [positionFilter]);

  const availableTeams = useMemo(() => {
    const teams = [...new Set(legendsByPosition.map((m) => m.team))];
    return teams.sort((a, b) => a.localeCompare(b, "ko"));
  }, [legendsByPosition]);

  const teamCountMap = useMemo(() => {
    const map = {};
    legendsByPosition.forEach((m) => {
      map[m.team] = (map[m.team] ?? 0) + 1;
    });
    return map;
  }, [legendsByPosition]);

  const filteredLegendList = useMemo(() => {
    let list = legendsByPosition;
    if (teamFilter !== "all") {
      list = list.filter((m) => m.team === teamFilter);
    }
    return list.map((m) => m.name).sort((a, b) => a.localeCompare(b, "ko"));
  }, [legendsByPosition, teamFilter]);

  const autoCompleteList = useMemo(() => {
    if (!inputValue) return [];
    return filteredLegendList.filter((name) => name.includes(inputValue));
  }, [inputValue, filteredLegendList]);

  const allMatchedStages = useMemo(() => {
    if (!query) return [];
    return legendStuff.filter((s) =>
      s.item.some((it) => it.legend && it.legend === query)
    );
  }, [query]);

  const playerStats = useMemo(() => {
    if (!query || allMatchedStages.length === 0) return null;
    const seen = new Map();
    allMatchedStages.forEach((s) =>
      s.item.forEach((it) => {
        if (it.legend !== query) return;
        const combo = fmt(it.player, it.years);
        if (!seen.has(combo)) seen.set(combo, s.day);
      })
    );
    const materials = [...seen.entries()]
      .map(([combo, day]) => ({ combo, day }))
      .sort((a, b) => a.day - b.day);
    const uniqueCombos = materials.map((m) => m.combo);
    const days = [...new Set(allMatchedStages.map((s) => s.day))].sort(
      (a, b) => a - b
    );
    return {
      materials,
      uniqueCombos,
      days,
      totalSessions: allMatchedStages.length,
    };
  }, [query, allMatchedStages]);

  const selectedLegendMeta = useMemo(() => {
    if (!query) return null;
    return findMeta(query);
  }, [query]);

  // 검색창 inputValue가 정확히 한 선수와 일치하면 team만 자동 selected.
  // position은 건드리지 않음 — 사용자가 검색 시 전체에서 찾고 싶어 하기 때문.
  useEffect(() => {
    if (!inputValue) return;
    const meta = findMeta(inputValue);
    if (!meta) return;
    setTeamFilter((prev) => (prev === meta.team ? prev : meta.team));
  }, [inputValue]);

  const handleQueryChange = useCallback((value) => {
    setInputValue(value);
    setIsAutoOpen(true);
    setHighlightIndex(0);
    // 직접 검색 시작 → 기존 확정/필터 초기화
    setQuery("");
    setPositionFilter("all");
    setTeamFilter("all");
    setSelectedStage(null);
  }, []);

  const confirmSelection = useCallback((name) => {
    setInputValue(name);
    setQuery(name);
    setIsAutoOpen(false);
    setSelectedStage(null);
    const meta = findMeta(name);
    if (meta) setTeamFilter(meta.team);
  }, []);

  const handleSelectSuggestion = useCallback(
    (name) => confirmSelection(name),
    [confirmSelection]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setQuery("");
    setIsAutoOpen(false);
    setSelectedStage(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isAutoOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          Math.min(prev + 1, autoCompleteList.length - 1)
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (autoCompleteList.length > 0) {
          const idx =
            highlightIndex >= 0 && highlightIndex < autoCompleteList.length
              ? highlightIndex
              : 0;
          confirmSelection(autoCompleteList[idx]);
        } else {
          setIsAutoOpen(false);
        }
      }
      if (e.key === "Escape") setIsAutoOpen(false);
    },
    [isAutoOpen, autoCompleteList, highlightIndex, confirmSelection]
  );

  const handlePositionChange = useCallback((pos) => {
    setPositionFilter(pos);
    setTeamFilter("all");
    setInputValue("");
    setQuery("");
    setSelectedStage(null);
  }, []);

  const handleTeamChange = useCallback((team) => {
    setTeamFilter((prev) => (prev === team ? "all" : team));
    setInputValue("");
    setQuery("");
    setSelectedStage(null);
  }, []);

  const handleSelectStage = useCallback((stage) => {
    setSelectedStage((prev) =>
      stageKey(prev) === stageKey(stage) ? null : stage
    );
  }, []);

  return {
    inputValue,
    query,
    isAutoOpen,
    highlightIndex,
    positionFilter,
    teamFilter,
    selectedStage,
    availableTeams,
    teamCountMap,
    filteredLegendList,
    autoCompleteList,
    allMatchedStages,
    playerStats,
    selectedLegendMeta,
    setIsAutoOpen,
    handleQueryChange,
    handleSelectSuggestion,
    handleClear,
    handleKeyDown,
    handlePositionChange,
    handleTeamChange,
    handleSelectStage,
  };
};
