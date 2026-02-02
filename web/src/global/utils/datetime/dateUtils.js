
// data 만료 일자와 현재 시간 비교
const isExpired = (expireAt) => {
  if (!expireAt) return false;
  return new Date(expireAt) <= new Date();
};

export const dateUtils = {
  expired: isExpired
}

export const formatNow = () => {
  const d = new Date();

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
