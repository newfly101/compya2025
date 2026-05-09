import { createListenerMiddleware } from "@reduxjs/toolkit";
import { setLastOperation } from "@/app/store/operation/slices.jsx";

export const operationListener = createListenerMiddleware();

operationListener.startListening({
  predicate: (action, currentState) => {
    const hasOptions = Boolean(action?.payload?.options);
    const isDone = action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected");
    const isAdmin = currentState?.auth?.userRole === 'ADMIN';
    return isDone && hasOptions && isAdmin;
  },
  effect: async (action, listenerApi) => {
    const options = action?.payload?.options;

    listenerApi.dispatch(setLastOperation(options));
  }
})
