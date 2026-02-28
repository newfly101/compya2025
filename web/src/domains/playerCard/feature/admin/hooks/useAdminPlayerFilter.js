import { useMemo, useState } from "react";

export const useAdminPlayerFilter = (cards = []) => {
  const [filters, setFilters] = useState({
    keyword: "",
    status: "ALL",
    visible: "ALL",
  });

  const filteredData = useMemo(() => {
    return cards.filter((card) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const match =
          card.name?.toLowerCase().includes(keyword);

        if (!match) return false;
      }

      return true;
    });
  }, [cards, filters]);

  return {
    filters,
    setFilters,
    filteredData
  }
}
