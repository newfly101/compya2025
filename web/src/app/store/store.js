import { configureStore } from "@reduxjs/toolkit";
import dictionaryReducer from "../../domains/dictionary/store/slices.js";
import simulateReducer from "../../domains/simulate/store/slices.js";
import authReducer from "../../domains/auth/store/slices.js";
import eventsReducer from "@/domains/events/store/slices.js";
import couponReducer from "@/domains/coupons/store/slices.js";

export const store = configureStore({
  reducer: {
    dictionary: dictionaryReducer,
    simulate: simulateReducer,
    auth: authReducer,
    events: eventsReducer,
    coupon: couponReducer,
  },
});
