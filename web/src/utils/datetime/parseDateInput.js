export const parseDateInput = (value) => {
  // 숫자만 허용
  const digits = value.replace(/\D/g, "");

  // YYYYMMDD
  if (digits.length === 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    return `${y}-${m}-${d} 00:00`;
  }

  // YYYYMMDDHHmm
  if (digits.length === 12) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    const hh = digits.slice(8, 10);
    const mm = digits.slice(10, 12);
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }

  // 입력 중일 때는 그대로
  return value;
};
