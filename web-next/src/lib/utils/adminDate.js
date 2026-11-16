// 관리자 시각 입력 헬퍼 — web/src/global/utils/datetime/dateUtils.js 에서 필요한 것만 복사(원본 파일은 다른 agent 영역).
// 관리자 시각 입력칸 — 숫자만 쳐도 "HH:MM" 로 자동 정규화 (예: "2359" → "23:59").
export const normalizeHHMM = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

// 24시간제 HH:MM → 저장용 HH:MM:SS. "23:59" 만 그날 끝의 초(59)를 보존하고 그 밖엔 00 초로 저장한다. 비우면 빈 문자열.
export const toHHMMSS = (hhmm) => (hhmm ? (hhmm === "23:59" ? `${hhmm}:59` : `${hhmm}:00`) : "");
