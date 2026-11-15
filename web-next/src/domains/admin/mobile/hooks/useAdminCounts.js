"use client";
// 6개 관리 도메인(퀴즈·이벤트·쿠폰·공지·유저·동기화 대상) 목록을 탭 바 배지 건수와 홈 탭 카드/요약에 함께 공급한다.
// 각 목록 query 는 해당 탭 화면과 같은 키라, 탭을 옮겨 다녀도 같은 요청을 공유한다(중복 요청 없음).
// 동기화 카드 숫자는 하드코딩하지 않고 실제 불러온 대상 개수를 쓴다.
import { useAdminQuizList } from "@/domains/quiz/store/admin/queries.js";
import { useAdminEventList, EVENTS_FETCH_ALL_SIZE } from "@/domains/events/store/admin/queries.js";
import { useAdminCouponList } from "@/domains/coupons/store/admin/queries.js";
import { useAdminNoticeList } from "@/domains/notices/store/admin/queries.js";
import { useAdminUserList, USERS_FETCH_ALL_SIZE } from "@/domains/users/store/admin/queries.js";
import { useCacheSyncTargets } from "@/domains/admin/store/admin/queries.js";

// 로딩 중이거나 실패한 도메인은 건수를 못 구한 것으로 보고 null — 홈 카드는 "–", 탭 바는 배지를 숨긴다.
// ponytail: 상한을 꽉 채우면 잘린 목록이라 셀 수 없다 — 틀린 숫자 대신 null. 그 시점이 오면 BE 에 총건수(count) 가 필요하다.
const countOf = (query, limit) => {
  const length = query.data?.length;
  if (query.isPending || query.error || length == null) return null;
  return limit && length >= limit ? null : length;
};

export function useAdminCounts() {
  const quiz = useAdminQuizList();
  const events = useAdminEventList();
  const coupons = useAdminCouponList();
  const notices = useAdminNoticeList();
  const users = useAdminUserList();
  const targets = useCacheSyncTargets();

  const counts = {
    quiz: countOf(quiz),
    event: countOf(events, EVENTS_FETCH_ALL_SIZE),
    coupon: countOf(coupons),
    notice: countOf(notices),
    user: countOf(users, USERS_FETCH_ALL_SIZE),
    sync: countOf(targets),
  };

  return {
    counts,
    lists: { quizzes: quiz.data ?? [], events: events.data ?? [], coupons: coupons.data ?? [], notices: notices.data ?? [] },
  };
}
