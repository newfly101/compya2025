import { useMemo, useState } from "react";
import { legendStuff } from "@/data/historyMode/LegendStuff.js";

export const useLegendSearch = () => {
  const [query, setQuery] = useState("");
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const legendList = useMemo(() => {
    const set = new Set();
    legendStuff.forEach((event) => {
      event.item.forEach((it) => {
        if (it.legend) set.add(it.legend);
      });
    });
    return Array.from(set);
  }, []);

  const autoCompleteList = useMemo(() => {
    if (!query) return [];
    return legendList.filter((name) => name.includes(query));
  }, [query, legendList]);

  const searchResults = useMemo(() => {
    if (!query) return [];

    const result = [];
    legendStuff.forEach((event) => {
      event.item.forEach((it) => {
        if (it.legend?.includes(query)) {
          result.push({
            day: event.day,
            player: it.player,
            years: it.years,
            roaster: event.roaster,
          });
        }
      });
    });
    return result;
  }, [query]);

  const searchResultMap = useMemo(() => {
    const map = {};
    searchResults.forEach(({ day, player, years, roaster }) => {
      if (!map[day]) map[day] = [];
      map[day].push({ player, years, roaster });
    });
    return map;
  }, [searchResults]);

  const activeDays = useMemo(() => new Set(searchResults.map((r) => r.day)), [searchResults]);

  const handleKeyDown = (e) => {
    if (!isAutoOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, autoCompleteList.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (autoCompleteList.length > 0) {
        const index =
          highlightIndex >= 0 && highlightIndex < autoCompleteList.length ? highlightIndex : 0;
        setQuery(autoCompleteList[index]);
      }
      setIsAutoOpen(false);
    }
    if (e.key === "Escape") {
      setIsAutoOpen(false);
    }
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setIsAutoOpen(true);
    setHighlightIndex(0);
  };

  const handleSelectSuggestion = (name) => {
    setQuery(name);
    setIsAutoOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsAutoOpen(false);
  };

  return {
    query,
    isAutoOpen,
    highlightIndex,
    autoCompleteList,
    searchResultMap,
    activeDays,
    setIsAutoOpen,
    handleQueryChange,
    handleSelectSuggestion,
    handleClear,
    handleKeyDown,
  };
};
