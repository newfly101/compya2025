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
import legendMaterialReducer from "@/domains/legendMaterials/store/slices.js";

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
    legendMaterial: legendMaterialReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(operationListener.middleware),
});
