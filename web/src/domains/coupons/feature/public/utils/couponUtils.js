const parseDate = (dateStr) => {
  // "2025-05-31 23:59" → Safari 대응
  return new Date(dateStr.replace(" ", "T"));
};

export const classifyCoupons = (coupons = []) => {
  const now = Date.now();

  const result = coupons.reduce(
    (acc, coupon) => {
      if (!coupon.visible) return acc;

      const expireTime = parseDate(coupon.expireAt).getTime();

      if (expireTime < now) {
        acc.expired.push(coupon);
      } else {
        acc.active.push(coupon);
      }

      return acc;
    },
    { active: [], expired: [] }
  );

  result.active.sort(
    (a, b) =>
      parseDate(a.expireAt) - parseDate(b.expireAt)
  );

  result.expired.sort(
    (a, b) =>
      parseDate(b.expireAt) - parseDate(a.expireAt)
  );

  return result;
};
