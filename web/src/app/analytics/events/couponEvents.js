import { pushEvent } from "@/app/analytics/ga.js";

export const trackCouponGo = (couponCode) => {
  pushEvent({
    event: 'coupon_clicked',
    coupon_code: couponCode,
  })
}
