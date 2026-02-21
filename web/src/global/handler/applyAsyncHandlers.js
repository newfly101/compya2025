// @/global/handler/asyncHandlers.js
export const applyAsyncHandlers = (builder, thunk, onFulfilled) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false;

      onFulfilled(state, action); // fulfilled만 커스텀
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading = false;

      const errorMessage = action.payload?.message ?? action.error?.message ?? "Unknown error";

      state.error = "[내부 오류] " + errorMessage;
    });
};
