
// data 만료 일자와 현재 시간 비교
const isExpired = (expireAt) => {
  if (!expireAt) return false;
  return new Date(expireAt) <= new Date();
};

export const dateUtils = {
  expired: isExpired
}

/**
 * KST (Asia/Seoul) 기준 "yyyy-MM-dd HH:mm:ss" 포맷.
 * BE 가 LocalDateTime 을 KST 로 저장/반환하므로 client 도 KST 로 정합 비교.
 * 응답(@JsonFormat)과 자리수가 같아야 만료 비교(expireAt < now)가 문자열 그대로 성립한다 —
 * 한쪽만 초가 붙으면 긴 문자열이 항상 크게 나와 판정이 뒤집힌다.
 * @param {Date} [date] — 기본값 현재 시각
 */
export const formatNow = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  const yyyy = get("year");
  const mm = get("month");
  const dd = get("day");
  let hh = get("hour");
  // Intl 가 "24" 를 반환할 수 있는 환경 보정 (자정 처리)
  if (hh === "24") hh = "00";
  const min = get("minute");
  const ss = get("second");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
