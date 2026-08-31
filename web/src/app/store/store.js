import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../domains/authentication/store/slices.js";
import eventsReducer from "@/domains/events/store/slices.js";
import couponReducer from "@/domains/coupons/store/slices.js";
import upLoadReducer from "@/infra/api/uploads/slices.js";
import quizReducer from "@/domains/quiz/store/slices.js";
import noticesReducer from "@/domains/notices/store/slices.js";
import operationReducer from "@/app/store/operation/slices.jsx";
import { operationListener } from "@/app/store/operation/operationListener.js";
import adminUsersReducer, { myPageReducer } from "@/domains/users/store/slices.js";

export const store = configureStore({
  reducer: {
    operation: operationReducer,
    auth: authReducer,
    events: eventsReducer,
    coupon: couponReducer,
    // community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
    // community: communityReducer,
    upload: upLoadReducer,
    quiz: quizReducer,
    notices: noticesReducer,
    adminUsers: adminUsersReducer,
    myPage: myPageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(operationListener.middleware),
});
