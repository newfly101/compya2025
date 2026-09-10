import { pushEvent } from "@/infra/analytics/ga.js";

export const trackCouponGo = (couponCode, targetUrl) => {
  pushEvent({
    event: 'coupon_clicked',
    coupon_code: couponCode,
    coupon_target_url: targetUrl,
  })
}
