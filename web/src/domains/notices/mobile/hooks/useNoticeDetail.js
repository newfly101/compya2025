import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { noticeTitleToSlug } from "@/domains/notices/mobile/noticeSlug.js";
import { requestGetNoticeList, requestGetNoticeDetail } from "@/domains/notices/store/public/thunks.js";

// 주소 조각이 숫자면 id, 아니면 제목으로 만든 slug 로 취급한다.
const isNumeric = (value) => /^\d+$/.test(value ?? "");

export const useNoticeDetail = (param) => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  // 공개 전용 상태만 읽는다 — 어드민 목록(숨긴 공지 포함)을 공유하면 숨긴 공지가 여기서 렌더된다.
  const siteNotices = useSelector(state => state.notices.publicSiteNotices);
  const loading     = useSelector(state => state.notices.publicLoading);
  const error       = useSelector(state => state.notices.publicError);
  const loaded      = useSelector(state => state.notices.publicLoaded);

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
    // slug 는 `제목-id` 형태다. id 접미어가 없던 옛 주소(`제목`)로 들어와도 같은 글로 받아준다.
    return siteNotices.find(n => {
      const slug = noticeTitleToSlug(n.title, n.id);
      return slug === param || slug === `${param}-${n.id}`;
    }) ?? null;
  }, [siteNotices, param, numeric]);

  // 숫자 주소(구글 색인 등)로 들어왔으면 제목 slug 주소로 옮긴다. 못 찾으면 이동하지 않는다(무한 루프 방지).
  // slug 에는 항상 id 접미어가 붙어 숫자만이 될 수 없으므로 옮겨간 주소는 다시 이 분기를 타지 않는다.
  useEffect(() => {
    if (numeric && found) {
      navigate(ROUTE_PATHS.notice_details(found), { replace: true });
    }
  }, [numeric, found, navigate]);

  // 목록 응답에는 본문이 없다(전량 조회 방지) — 찾은 글의 본문만 상세 API 로 한 번 더 받아온다.
  useEffect(() => {
    if (found?.id != null) dispatch(requestGetNoticeDetail(found.id));
  }, [dispatch, found?.id]);

  // 목록은 불러왔는데(loaded) 이 글만 없는 경우 = 삭제되었거나 잘못된 주소.
  const notFound = loaded && !loading && !error && !found;

  return { notice: found, loading, error, loaded, notFound, retry };
};
