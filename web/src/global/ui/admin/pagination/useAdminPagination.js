import { useMemo, useState } from "react";

// 번호식 페이지네이션(8개/페이지) — 목록 전량이 이미 내려온 상태에서
// 클라이언트가 자른다(서버 페이징 아님). 필터/검색 조건이 바뀌면 호출부가
// resetPage() 를 불러 1페이지로 되돌려야 한다.
export default function useAdminPagination(items, pageSize = 8) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  const pageItems = useMemo(
    () => items.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [items, safePage, pageSize],
  );

  return {
    page: safePage,
    pageCount,
    pageItems,
    setPage,
    resetPage: () => setPage(0),
  };
}
