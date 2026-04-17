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
import kboReducer from "@/domains/kbo/store/slices.js";
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
    kbo: kboReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(operationListener.middleware),
});
