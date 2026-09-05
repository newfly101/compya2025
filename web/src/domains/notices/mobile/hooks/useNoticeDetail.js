import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { requestGetNoticeList, requestGetNoticeBySlug } from "@/domains/notices/store/public/thunks.js";

// 주소 조각이 숫자면 id, 아니면 slug 로 취급한다.
// (DB 마이그레이션 전에는 slug 가 전부 null 이라 항상 숫자 id 로만 들어온다)
const isNumeric = (value) => /^\d+$/.test(value ?? "");

export const useNoticeDetail = (param) => {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const siteNotices  = useSelector(state => state.notices.siteNotices);
  const noticeBySlug = useSelector(state => state.notices.noticeBySlug);

  const numeric = isNumeric(param);

  useEffect(() => {
    if (siteNotices.length === 0) dispatch(requestGetNoticeList());
  }, [dispatch, siteNotices.length]);

  const found = useMemo(() => {
    if (numeric) return siteNotices.find(n => Number(n.id) === Number(param)) ?? null;
    return siteNotices.find(n => n.slug === param) ?? null;
  }, [siteNotices, param, numeric]);

  // 목록에 없으면(직접 URL 진입 등) slug 단건 조회로 보완한다. id 는 목록만으로 처리.
  useEffect(() => {
    if (numeric || found) return;
    dispatch(requestGetNoticeBySlug(param));
  }, [dispatch, numeric, found, param]);

  // 숫자 주소로 들어왔는데 slug 가 이미 생겼으면 새 주소로 옮긴다(구글 색인 이전).
  // slug 가 null 이면(마이그레이션 전) 절대 이동하지 않는다 — 안 그러면 무한 루프.
  useEffect(() => {
    if (numeric && found?.slug) {
      navigate(ROUTE_PATHS.notice_details(found), { replace: true });
    }
  }, [numeric, found, navigate]);

  const notice = found ?? (!numeric && noticeBySlug?.slug === param ? noticeBySlug : null);

  return { notice };
};
