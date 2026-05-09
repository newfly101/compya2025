import { configureStore } from "@reduxjs/toolkit";
import dictionaryReducer from "../../domains/dictionary/store/slices.js";
import simulateReducer from "../../domains/simulate/store/slices.js";
import authReducer from "../../domains/authentication/store/slices.js";
import eventsReducer from "@/domains/events/store/slices.js";
import couponReducer from "@/domains/coupons/store/slices.js";
import communityReducer from "@/domains/community/store/slices.js";
import playerCardReducer from "@/domains/playerCard/store/slices.js";
import upLoadReducer from "@/infra/uploads/store/slices.js";
import quizReducer from "@/domains/quiz/store/slices.js";
// LEGACY kbo 도메인 잠정 보류 — 2026-05-09 (frontend kbo 화면 폐기. BE API 미구현 / DB 는 kbocrol 운영)
// import kboReducer from "@/domains/kbo/store/slices.js";
import noticesReducer from "@/domains/notices/store/slices.js";
import operationReducer from "@/app/store/operation/slices.jsx";
import { operationListener } from "@/app/store/operation/operationListener.js";

export const store = configureStore({
  reducer: {
    operation: operationReducer,
    dictionary: dictionaryReducer,
    simulate: simulateReducer,
    auth: authReducer,
    events: eventsReducer,
    coupon: couponReducer,
    community: communityReducer,
    upload: upLoadReducer,
    playerCard: playerCardReducer,
    quiz: quizReducer,
    // LEGACY kbo 도메인 잠정 보류 — 2026-05-09 (frontend kbo 화면 폐기. BE API 미구현 / DB 는 kbocrol 운영)
    // kbo: kboReducer,
    notices: noticesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(operationListener.middleware),
});
