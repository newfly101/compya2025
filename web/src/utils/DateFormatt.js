export const formatDateLabel = (date) => {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${m}/${d} (${w})`;
};

export const isSameDate = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
