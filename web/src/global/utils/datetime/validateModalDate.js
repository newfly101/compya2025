const DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

const toDate = (value) => {
  if (!DATETIME_REGEX.test(value)) return null;

  const [date, time] = value.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return new Date(y, m - 1, d, hh, mm);
};

/* =========================
 * Event Date Validator
 * ========================= */
const validateEventDate = ({ startAt, expireAt }) => {
  if (!startAt || !expireAt) {
    return {
      valid: false,
      message: "시작일과 종료일을 모두 입력해야 합니다.",
    };
  }

  if (
    !DATETIME_REGEX.test(startAt) ||
    !DATETIME_REGEX.test(expireAt)
  ) {
    return {
      valid: false,
      message: "날짜 형식이 올바르지 않습니다.",
    };
  }

  const start = toDate(startAt);
  const end = toDate(expireAt);

  if (!start || !end) {
    return {
      valid: false,
      message: "유효한 날짜가 아닙니다.",
    };
  }

  if (end < start) {
    return {
      valid: false,
      message: "종료일은 시작일 이후여야 합니다.",
    };
  }

  return { valid: true };
};

/* =========================
 * Coupon Date Validator
 * ========================= */
const validateCouponDate = ({ expireAt }) => {
  if (!expireAt) {
    return {
      valid: false,
      message: "만료일을 입력해야 합니다.",
    };
  }

  if (!DATETIME_REGEX.test(expireAt)) {
    return {
      valid: false,
      message: "만료일 형식이 올바르지 않습니다.",
    };
  }

  const end = toDate(expireAt);
  if (!end) {
    return {
      valid: false,
      message: "유효한 만료일이 아닙니다.",
    };
  }

  return { valid: true };
};

/* =========================
 * ✅ 단일 export 네임스페이스
 * ========================= */
export const validateModalDate = {
  event: validateEventDate,
  coupon: validateCouponDate,
};
