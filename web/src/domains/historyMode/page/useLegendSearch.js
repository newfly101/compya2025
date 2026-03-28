import { useMemo, useState, useCallback } from "react";
import { legendStuff } from "@/data/historyMode/LegendStuff.js";
import { legendMeta } from "@/data/historyMode/LegendMeta.js";

// TODO: legendMeta를 player_legend JOIN teams API 응답으로 교체
const metaMap = Object.fromEntries(legendMeta.map((m) => [m.name, m]));

const fmt = (player, years) => `${player}'${String(years).slice(-2)}`;

export const useLegendSearch = () => {
  const [query, setQuery] = useState("");
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [positionFilter, setPositionFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedStage, setSelectedStage] = useState(null);

  // 포지션 필터 적용
  const legendsByPosition = useMemo(() => {
    if (positionFilter === "all") return legendMeta;
    return legendMeta.filter((m) => m.position === positionFilter);
  }, [positionFilter]);

  // 포지션 필터 기준으로 선택 가능한 구단 목록
  const availableTeams = useMemo(() => {
    const teams = [...new Set(legendsByPosition.map((m) => m.team))];
    return teams.sort((a, b) => a.localeCompare(b, "ko"));
  }, [legendsByPosition]);

  // 포지션 + 구단 필터 적용된 레전드 칩 목록
  const filteredLegendList = useMemo(() => {
    let list = legendsByPosition;
    if (teamFilter !== "all") {
      list = list.filter((m) => m.team === teamFilter);
    }
    return list.map((m) => m.name).sort((a, b) => a.localeCompare(b, "ko"));
  }, [legendsByPosition, teamFilter]);

  const autoCompleteList = useMemo(() => {
    if (!query) return [];
    return filteredLegendList.filter((name) => name.includes(query));
  }, [query, filteredLegendList]);

  const allMatchedStages = useMemo(() => {
    if (!query) return [];
    return legendStuff.filter((s) =>
      s.item.some((it) => it.legend && it.legend === query)
    );
  }, [query]);

  const playerStats = useMemo(() => {
    if (!query || allMatchedStages.length === 0) return null;
    const combos = [];
    allMatchedStages.forEach((s) =>
      s.item.forEach((it) => {
        if (it.legend === query) combos.push(fmt(it.player, it.years));
      })
    );
    const uniqueCombos = [...new Set(combos)];
    const days = [...new Set(allMatchedStages.map((s) => s.day))].sort(
      (a, b) => a - b
    );
    return { uniqueCombos, days, totalSessions: allMatchedStages.length };
  }, [query, allMatchedStages]);

  const handleKeyDown = (e) => {
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
        setQuery(autoCompleteList[idx]);
      }
      setIsAutoOpen(false);
    }
    if (e.key === "Escape") setIsAutoOpen(false);
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setIsAutoOpen(true);
    setHighlightIndex(0);
    setSelectedStage(null);
  };

  const handleSelectSuggestion = (name) => {
    setQuery(name);
    setIsAutoOpen(false);
    setSelectedStage(null);
  };

  const handleClear = () => {
    setQuery("");
    setIsAutoOpen(false);
    setSelectedStage(null);
  };

  const handlePositionChange = useCallback((pos) => {
    setPositionFilter(pos);
    setTeamFilter("all");
    setQuery("");
    setSelectedStage(null);
  }, []);

  const handleTeamChange = useCallback((team) => {
    setTeamFilter((prev) => (prev === team ? "all" : team));
    setQuery("");
    setSelectedStage(null);
  }, []);

  const handleSelectStage = useCallback((stage) => {
    setSelectedStage(stage);
  }, []);

  return {
    query,
    isAutoOpen,
    highlightIndex,
    autoCompleteList,
    allMatchedStages,
    selectedStage,
    playerStats,
    positionFilter,
    teamFilter,
    availableTeams,
    filteredLegendList,
    fmt,
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
