import { parseDate } from "./parseDate.js";

export const sortCoupons = (list) => {
  const now = new Date();

  return [...list].sort((a, b) => {
    const aDate = parseDate(a.expireDate);
    const bDate = parseDate(b.expireDate);

    const aValid = aDate >= now;
    const bValid = bDate >= now;

    // 1) 유효한 쿠폰 먼저
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;

    // 2) 둘 다 유효 → 최신 날짜가 위로
    return bDate - aDate;

    // 3) 둘 다 만료 → 최신 날짜가 위로
    // (위 return 문 하나면 둘 다 처리됨)
  });
};
