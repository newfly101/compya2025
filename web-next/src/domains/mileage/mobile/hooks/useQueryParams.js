"use client";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * react-router 의 [searchParams, setSearchParams] 와 같은 모양 — setSearchParams(prev => URLSearchParams).
 * push 라서 뒤로가기로 이전 쿼리(표 화면 등)에 돌아온다. 스크롤은 유지한다.
 */
export const useQueryParams = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setSearchParams = useCallback(
    (update) => {
      const next = update(new URLSearchParams(searchParams.toString()));
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );
  return [searchParams, setSearchParams];
};
