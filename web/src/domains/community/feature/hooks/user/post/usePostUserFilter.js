import { useMemo } from "react";
import { createSearchFilterUnit } from "@/core/filters/index.js";
import { useFilterPipline } from "@/core/filters/hooks/useFilterPipline.js";

export const usePostUserFilter = (posts) => {
  const filterUnits = useMemo(() => [
    createSearchFilterUnit({
      placeholder: "게시글 검색",
      fields: ["title"]
    }),
    // todo: 태그 기준으로 상태값 불러오기 filter 추가해야함
  ], []);

  return useFilterPipline(posts, filterUnits);
}
