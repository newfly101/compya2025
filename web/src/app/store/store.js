import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../domains/authentication/store/slices.js";
import eventsReducer from "@/domains/events/store/slices.js";
import couponReducer from "@/domains/coupons/store/slices.js";
import upLoadReducer from "@/infra/api/uploads/slices.js";
import quizReducer from "@/domains/quiz/store/slices.js";
import noticesReducer from "@/domains/notices/store/slices.js";
import communityReducer from "@/domains/community/store/slices.js";
import operationReducer from "@/app/store/operation/slices.jsx";
import { operationListener } from "@/app/store/operation/operationListener.js";
import adminUsersReducer, { myPageReducer } from "@/domains/users/store/slices.js";
import legendStatReducer from "@/domains/legendStats/store/slices.js";
import historyLegendReducer from "@/domains/historyLegend/store/slices.js";
import playerSkillsReducer from "@/domains/playerSkills/store/slices.js";
import mileageReducer from "@/domains/mileage/store/slices.js";
import playersReducer from "@/domains/players/store/slices.js";
import cacheSyncReducer from "@/domains/admin/store/slices.js";

export const store = configureStore({
  reducer: {
    operation: operationReducer,
    auth: authReducer,
    events: eventsReducer,
    coupon: couponReducer,
    community: communityReducer,
    upload: upLoadReducer,
    quiz: quizReducer,
    notices: noticesReducer,
    adminUsers: adminUsersReducer,
    myPage: myPageReducer,
    legendStat: legendStatReducer,
    historyLegend: historyLegendReducer,
    playerSkills: playerSkillsReducer,
    mileage: mileageReducer,
    players: playersReducer,
    cacheSync: cacheSyncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 선수 백과 카드 1.1만 건이 players 슬라이스에 실리면서 dev 전용
      // 직렬화/불변 검사가 32ms 를 넘겨 콘솔 경고를 띄운다 (프로덕션은 원래 비활성).
      // 대용량 슬라이스만 검사에서 제외한다 — 나머지 슬라이스는 계속 검사받는다.
      serializableCheck: { ignoredPaths: ["players"] },
      immutableCheck: { ignoredPaths: ["players"] },
    }).prepend(operationListener.middleware),
});
