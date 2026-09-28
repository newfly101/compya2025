import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";
import { useKstDayTick } from "@/global/hooks/useKstDayTick.js";
import { requestGetHome } from "@/domains/home/store/public/thunks.js";

const PREVIEW_LIMIT = 3;

export const useHomeSections = () => {
  const dispatch = useDispatch();
  const coupons = useSelector(state => state.home.coupons);
  const events = useSelector(state => state.home.events);
  const notices = useSelector(state => state.home.notices);
  const quiz = useSelector(state => state.home.quiz);
  const failedSections = useSelector(state => state.home.failedSections);
  const loading = useSelector(state => state.home.loading);
  const loaded = useSelector(state => state.home.loaded);
  const error = useSelector(state => state.home.error);

  // 홈 전체가 요청 1회다 — 섹션마다 따로 발행하지 않는다.
  useEffect(() => {
    dispatch(requestGetHome());
  }, [dispatch]);

  const retry = useCallback(() => dispatch(requestGetHome()), [dispatch]);

  useKstDayTick(); // 자정을 넘기면 만료 분류를 다시 계산한다
  const now = formatNow(new Date());

  // 요청 자체가 실패하면(error) 네 섹션 모두 실패로 본다 — 낡은 값이 남아 있어도 에러를 감추지 않는다.
  // 섹션 하나만 죽은 경우는 서버가 failedSections 로 알려 주고, 그 섹션만 오류 표시한다.
  const failed = (section) => Boolean(error) || failedSections.includes(section);

  // 고정 공지를 홈 미리보기 맨 앞에 둔다. 공유 thunk·공지 목록 화면 정렬은 건드리지 않는다.
  const featuredNotice = notices.find(n => n.isPinned) ?? notices[0] ?? null;
  const noticePreview = featuredNotice
    ? [featuredNotice, ...notices.filter(n => n !== featuredNotice)].slice(0, PREVIEW_LIMIT)
    : [];

  return {
    activeCoupons: coupons.filter(c => c.expireAt >= now),
    activeEvents: events.filter(e => e.expireAt >= now),
    notices: noticePreview,
    quiz,
    loading,
    loaded,
    retry,
    couponError: failed("coupons"),
    eventError: failed("events"),
    noticeError: failed("notices"),
    quizError: failed("quiz"),
  };
};
