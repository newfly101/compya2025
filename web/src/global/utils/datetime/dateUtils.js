
// data 만료 일자와 현재 시간 비교
const isExpired = (expireAt) => {
  if (!expireAt) return false;
  return new Date(expireAt) <= new Date();
};

export const dateUtils = {
  expired: isExpired
}
