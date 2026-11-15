// 서버 응답 → 화면 상태. 없는 배열은 빈 배열로 정규화한다.

/** GET /legend-collections → 조회 편의 맵 */
export const toMyCollection = (data) => {
  const legends = {};
  const acquiredAt = {}; // 보유중 날짜
  const frameAcquiredAt = {}; // 액자 날짜
  (data?.legends ?? []).forEach((l) => {
    legends[l.legendId] = l.status;
    if (l.acquiredAt) acquiredAt[l.legendId] = l.acquiredAt;
    if (l.frameAcquiredAt) frameAcquiredAt[l.legendId] = l.frameAcquiredAt;
  });
  const materials = {};
  const materialLegend = {}; // 재료 id → 레전드 id (응답에 legendId 가 있으면 채운다. 없으면 훅이 재료 조회로 채움)
  (data?.materials ?? []).forEach((m) => {
    materials[m.materialId] = m.state;
    if (m.legendId) materialLegend[m.materialId] = m.legendId;
  });
  const preferences = [...(data?.preferences ?? [])]
    .sort((a, b) => a.rank - b.rank)
    .map((p) => p.legendId);
  return { version: data?.version ?? null, legends, acquiredAt, frameAcquiredAt, materials, materialLegend, preferences };
};

/** GET /legend-collections/schedule → { todayDayNo, items[] }. 카드 표기는 `선수'연도` */
export const toSchedule = (data) => ({
  todayDayNo: data?.todayDayNo ?? null,
  items: (data?.items ?? []).map((i) => ({
    dayNo: Number(i.dayNo),
    round: i.roundLabel ?? i.roundNo,
    legendId: i.legendId,
    legendName: i.legendName,
    materialId: i.materialId,
    card: `${i.playerName}'${String(i.seasonYear).slice(-2)}`,
    frame: !!i.frame,
  })),
});
