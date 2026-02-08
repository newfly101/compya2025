// @/global/handler/asyncHandlers.js
export const applyAsyncHandlers = (builder, thunk, onFulfilled) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload?.options) {
        state.lastOperation = action.payload.options;
      }
      onFulfilled(state, action); // fulfilled만 커스텀
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading = false;
      const error = "[내부 오류] " + action.payload ?? action.error?.message;
      state.error = error;
      state.lastOperation = {
        success: false,
        message: error,
      };
    });
};
