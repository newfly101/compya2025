// 홈 "오늘 히스토리 모드" 카드용 순수 함수 (REQ-LCOL-20). 서버 통신·날짜 계산 없음 — 오늘 일차는 호출자가 넘긴다.
// schedule.items: [{ dayNo, round, legendId, legendName, card, frame }] (선호 레전드의 미보유 재료만 서버가 준다)

/**
 * 오늘 줄 목록과 다음 일정을 만든다.
 * 반환: { count, withFrame[], withoutFrame[], next: { dayNo, count } | null }
 * 한 줄 = { ...item, rank(선호 순위 1~) } — 선호 순위 순, 같으면 서버 순서 유지. 선호가 아닌 레전드는 버린다.
 */
export const buildTodayHistory = (items, preferences, todayDayNo) => {
  const rankOf = (id) => preferences.indexOf(id) + 1;
  const mine = items.filter((i) => rankOf(i.legendId) > 0);
  const today = mine
    .filter((i) => i.dayNo === todayDayNo)
    .map((i) => ({ ...i, rank: rankOf(i.legendId) }))
    .sort((a, b) => a.rank - b.rank);

  const laterDays = mine.map((i) => i.dayNo).filter((d) => d > todayDayNo);
  const nextDay = laterDays.length > 0 ? Math.min(...laterDays) : null;

  return {
    count: today.length,
    withFrame: today.filter((i) => i.frame),
    withoutFrame: today.filter((i) => !i.frame),
    next: nextDay === null ? null : { dayNo: nextDay, count: mine.filter((i) => i.dayNo === nextDay).length },
  };
};
