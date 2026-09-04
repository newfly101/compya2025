// useAdminCounts.js — 5개 관리 도메인(퀴즈·이벤트·쿠폰·공지·유저) 목록을 한 번만 불러와
// 탭 바 배지 건수와 홈 탭 카드/요약을 함께 공급하는 단일 소스.
//
// AdminShellScreen 이 마운트될 때 이 훅을 호출해 fetch 를 트리거한다 — 어느 탭으로
// 처음 진입하든(퀴즈 탭 새로고침 등) 배지 건수가 채워진다. AdminHomeTab 은 같은 훅을
// 다시 호출해도 redux 상태만 읽을 뿐 dispatch 는 "리스트가 비어있고 로딩중이 아닐 때"만
// 실행되므로, 탭을 옮겨 다녀도(같은 Shell 이 리마운트되어도) 중복 요청이 없다.
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestAdminQuizAll } from "@/domains/quiz/store/admin/thunks.js";
import { requestAdminGetAllEventList } from "@/domains/events/store/admin/thunks.js";
import { requestGetAdminCouponList } from "@/domains/coupons/store/admin/thunks.js";
import { requestAdminGetNoticeList } from "@/domains/notices/store/admin/thunks.js";
import { requestAdminGetUserList } from "@/domains/users/store/admin/thunks.js";

// 로딩 중이거나 실패한 도메인은 건수를 못 구한 것으로 보고 null 을 돌려준다.
// 호출부는 null 이면 0/가짜 숫자 대신 "–" 를 보여주거나(홈 카드) 배지 자체를 숨긴다(탭 바).
const countOf = (domainState, listKey) => {
  if (!domainState || domainState.loading || domainState.error) return null;
  return domainState[listKey]?.length ?? null;
};

export function useAdminCounts() {
  const dispatch = useDispatch();
  const quiz = useSelector((s) => s.quiz);
  const events = useSelector((s) => s.events);
  const coupon = useSelector((s) => s.coupon);
  const notices = useSelector((s) => s.notices);
  const adminUsers = useSelector((s) => s.adminUsers);

  // 이미 불러와진(비어있지 않은) 도메인은 다시 부르지 않는다.
  // 하나가 실패해도 나머지 dispatch 는 그대로 진행 — 전체가 죽지 않는다.
  useEffect(() => {
    if (quiz.quizAnswers.length === 0 && !quiz.loading) dispatch(requestAdminQuizAll());
    if (events.events.length === 0 && !events.loading) dispatch(requestAdminGetAllEventList());
    if (coupon.coupons.length === 0 && !coupon.loading) dispatch(requestGetAdminCouponList());
    if (notices.siteNotices.length === 0 && !notices.loading) dispatch(requestAdminGetNoticeList());
    if (adminUsers.users.length === 0 && !adminUsers.loading) dispatch(requestAdminGetUserList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const counts = {
    quiz: countOf(quiz, "quizAnswers"),
    event: countOf(events, "events"),
    coupon: countOf(coupon, "coupons"),
    notice: countOf(notices, "siteNotices"),
    user: countOf(adminUsers, "users"),
  };

  return { counts, domains: { quiz, events, coupon, notices, adminUsers } };
}
