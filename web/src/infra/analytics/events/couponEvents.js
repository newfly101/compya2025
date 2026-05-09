import { pushEvent } from "@/infra/analytics/ga.js";

export const trackCouponGo = (couponCode) => {
  pushEvent({
    event: 'coupon_clicked',
    coupon_code: couponCode,
  })
}
