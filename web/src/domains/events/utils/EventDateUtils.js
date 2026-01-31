// visible 옵션 기준으로 배열을 재생성
export const filterEventVisible = (events) => {
  return events.filter(e => e.visible === true);
}

// 날짜 두개 비교, 오늘보다 날짜가 지났으면 true : false 반환
export const isExpiredEvent = (expireAt, now = new Date()) => {
  if (!expireAt) return false;
  return new Date(expireAt).getTime() < now.getTime();
}

// 종료/진행중 이벤트 반환
export const splitEventsByExpired = (events) => {
  // visible 옵션 기준 이벤트 노출 정렬
  const visibleEvents = filterEventVisible(events);

  // 노출:o 기준으로 만료/진행중 이벤트 배열 생성
  const now = new Date();

  const activeEvents = [];
  const expireEvents = [];

  visibleEvents.forEach(e => {
    if (isExpiredEvent(e.expireAt, now)) {
      expireEvents.push(e);
    } else {
      activeEvents.push(e);
    }
  });

  return { activeEvents, expireEvents };
}

export const filterCouponVisible = (coupons) => {
  return coupons.filter(e => e.visible === true);
}

// 종료/진행중 이벤트 반환
export const splitCouponsByExpired = (coupons) => {
  // visible 옵션 기준 이벤트 노출 정렬
  const visibleEvents = filterCouponVisible(coupons);

  // 노출:o 기준으로 만료/진행중 이벤트 배열 생성
  const now = new Date();

  const activeCoupons = [];
  const expireCoupons = [];

  visibleEvents.forEach(e => {
    if (isExpiredEvent(e.expireAt, now)) {
      expireCoupons.push(e);
    } else {
      activeCoupons.push(e);
    }
  });

  return { activeCoupons, expireCoupons };
}
