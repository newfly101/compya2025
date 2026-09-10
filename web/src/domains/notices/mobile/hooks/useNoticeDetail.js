import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { noticeTitleToSlug } from "@/domains/notices/mobile/noticeSlug.js";
import { requestGetNoticeList } from "@/domains/notices/store/public/thunks.js";

// 주소 조각이 숫자면 id, 아니면 제목으로 만든 slug 로 취급한다.
const isNumeric = (value) => /^\d+$/.test(value ?? "");

export const useNoticeDetail = (param) => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const siteNotices = useSelector(state => state.notices.siteNotices);
  const loading     = useSelector(state => state.notices.loading);
  const error       = useSelector(state => state.notices.error);
  const loaded      = useSelector(state => state.notices.loaded);

  const numeric = isNumeric(param);

  // 목록을 아직 한 번도 못 불러왔으면(loaded=false) 요청한다 — 실패 후 재시도도 loaded 가
  // 안 올라가므로 이 조건으로 커버된다.
  useEffect(() => {
    if (!loaded) dispatch(requestGetNoticeList());
  }, [dispatch, loaded]);

  const retry = () => dispatch(requestGetNoticeList());

  // id 조회든 slug 조회든 서버 필드가 아니라 목록을 훑어서 찾는다(제목→slug 는 단방향).
  const found = useMemo(() => {
    if (numeric) return siteNotices.find(n => Number(n.id) === Number(param)) ?? null;
    return siteNotices.find(n => noticeTitleToSlug(n.title, n.id) === param) ?? null;
  }, [siteNotices, param, numeric]);

  // 숫자 주소(구글 색인 등)로 들어왔으면 제목 slug 주소로 옮긴다. 못 찾으면 이동하지 않는다(무한 루프 방지).
  useEffect(() => {
    if (numeric && found) {
      navigate(ROUTE_PATHS.notice_details(found), { replace: true });
    }
  }, [numeric, found, navigate]);

  // 목록은 불러왔는데(loaded) 이 글만 없는 경우 = 삭제되었거나 잘못된 주소.
  const notFound = loaded && !loading && !error && !found;

  return { notice: found, loading, error, loaded, notFound, retry };
};
