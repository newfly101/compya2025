import styles from "./HomeCardRows.module.scss";
import CouponCard from "@/domains/coupons/mobile/components/couponCard/CouponCard.jsx";
import EventCard from "@/domains/events/mobile/components/eventCard/EventCard.jsx";

// 홈 가로 스크롤 목록. 원본은 coupons/events 도메인의 *ListHorizontal 컨테이너였으나 web-next 에는 아직 없어
// (수정 금지 범위) 홈 안에 같은 모양으로 둔다. 도메인에 옮겨지면 이 파일은 지운다.
export const CouponRow = ({ coupons }) => (
  <div className={styles.couponScroll}>
    {coupons.map((coupon) => (
      <CouponCard key={coupon.id} coupon={coupon} showDetail={false} isExpired={false} />
    ))}
  </div>
);

export const EventRow = ({ events }) => (
  <div className={styles.eventScroll}>
    {events.map((event) => (
      <EventCard key={event.id} event={event} />
    ))}
  </div>
);
