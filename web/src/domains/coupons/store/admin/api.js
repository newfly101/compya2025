import { API } from "@/infra/http/client.js";
import { ADMIN_COUPONS } from "@/domains/coupons/store/admin/endpoints.js";

/**
 * COUPON API
 */

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchAdminCouponList = async () => {
  const { data } = await API.get(`${ADMIN_COUPONS.GET_COUPONS}`);
  return data.data;
};
export const fetchAdminInsertCoupon = async (coupon) => {
  const { data } = await API.post(`${ADMIN_COUPONS.CREATE_COUPONS}`, coupon);
  return data.data;
};
export const fetchAdminUpdateCoupon = async (id, coupon) => {
  const { data } = await API.patch(`${ADMIN_COUPONS.UPDATE_COUPONS(id)}`, coupon);
  return data.data;
};
export const fetchAdminUpdateVisible = async (id, visible) => {
  const { data } = await API.patch(`${ADMIN_COUPONS.UPDATE_COUPON_VISIBLE(id)}`, { visible });
  return data.data;
};
export const fetchAdminDeleteCoupon = async (id) => {
  const { data } = await API.delete(`${ADMIN_COUPONS.DELETE_COUPON(id)}`);
  return data.data;
};

// v2 일괄 삭제·숨김 — BE 계약: DELETE .../bulk { ids: [] } / PATCH .../bulk/visible { ids: [], visible }.
// 엔드포인트가 아직 없어 연결 시 404 가 나지만, 배선 자체는 완료해 둔다.
export const fetchAdminBulkDeleteCoupons = async (ids) => {
  const { data } = await API.delete(`${ADMIN_COUPONS.BULK_DELETE_COUPONS}`, { data: { ids } });
  return data.data;
};
export const fetchAdminBulkUpdateVisible = async (ids, visible) => {
  const { data } = await API.patch(`${ADMIN_COUPONS.BULK_UPDATE_COUPON_VISIBLE}`, { ids, visible });
  return data.data;
};
