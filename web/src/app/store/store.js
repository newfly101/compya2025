import { configureStore } from "@reduxjs/toolkit";
// dictionary 도메인 폐기 (legacy PC) — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/dictionary.md TODO 참조)
// import dictionaryReducer from "../../domains/dictionary/store/slices.js";
// simulate + playerCard 도메인 폐기 (legacy PC) — 2026-05-09 (사용자 특화 컨텐츠 240명 user 기반 신규 기획 IA 후 모바일 재구현. docs/prd/domains/{simulate,playerCard}.md TODO 참조)
// import simulateReducer from "../../domains/simulate/store/slices.js";
import authReducer from "../../domains/authentication/store/slices.js";
import eventsReducer from "@/domains/events/store/slices.js";
import couponReducer from "@/domains/coupons/store/slices.js";
// community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
// import communityReducer from "@/domains/community/store/slices.js";
// import playerCardReducer from "@/domains/playerCard/store/slices.js";
import upLoadReducer from "@/infra/api/uploads/slices.js";
import quizReducer from "@/domains/quiz/store/slices.js";
// LEGACY kbo 도메인 잠정 보류 — 2026-05-09 (frontend kbo 화면 폐기. BE API 미구현 / DB 는 kbocrol 운영)
// import kboReducer from "@/domains/kbo/store/slices.js";
import noticesReducer from "@/domains/notices/store/slices.js";
import operationReducer from "@/app/store/operation/slices.jsx";
import { operationListener } from "@/app/store/operation/operationListener.js";

export const store = configureStore({
  reducer: {
    operation: operationReducer,
    // dictionary 도메인 폐기 (legacy PC) — 2026-05-09 (기획 IA 후 모바일 재구현. docs/prd/domains/dictionary.md TODO 참조)
    // dictionary: dictionaryReducer,
    // simulate + playerCard 도메인 폐기 (legacy PC) — 2026-05-09 (사용자 특화 컨텐츠 신규 기획 IA 후 모바일 재구현)
    // simulate: simulateReducer,
    auth: authReducer,
    events: eventsReducer,
    coupon: couponReducer,
    // community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
    // community: communityReducer,
    upload: upLoadReducer,
    // playerCard: playerCardReducer,
    quiz: quizReducer,
    // LEGACY kbo 도메인 잠정 보류 — 2026-05-09 (frontend kbo 화면 폐기. BE API 미구현 / DB 는 kbocrol 운영)
    // kbo: kboReducer,
    notices: noticesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(operationListener.middleware),
});
