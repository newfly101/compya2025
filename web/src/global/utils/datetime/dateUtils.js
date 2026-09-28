
// data 만료 일자와 현재 시간 비교
const isExpired = (expireAt) => {
  if (!expireAt) return false;
  return new Date(expireAt) <= new Date();
};

export const dateUtils = {
  expired: isExpired
}

// 관리자 시각 입력칸 — 숫자만 쳐도 "HH:MM" 로 자동 정규화 (예: "2359" → "23:59").
export const normalizeHHMM = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

// 24시간제 HH:MM → 저장용 HH:MM:SS. "23:59" 만 그날 끝의 초(59)를 보존하고 그 밖엔 00 초로 저장한다 —
// 초가 의미를 갖는 경우가 "그날 끝" 하나뿐이라서다. 비우면 빈 문자열 그대로(서버가 기본 시각을 채움).
export const toHHMMSS = (hhmm) => (hhmm ? (hhmm === "23:59" ? `${hhmm}:59` : `${hhmm}:00`) : "");

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

/**
 * KST 기준 "어제" 날짜 (yyyy-MM-dd, `<input type="date">` 값 형식).
 * 24시간을 그대로 빼도 KST 는 고정 오프셋(DST 없음)이라 달력상 하루 전이 정확히 나온다.
 */
export const getYesterdayKst = () => formatNow(new Date(Date.now() - 24 * 60 * 60 * 1000)).slice(0, 10);
