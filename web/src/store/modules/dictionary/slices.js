import { createSlice } from "@reduxjs/toolkit";

const dictionaryInitState = {

}

const dictionarySlice = createSlice({
  name: "dictionary",
  initialState: dictionaryInitState,
  reducers: {

  },
  // extraReducers: (builder) => {
  //   builder
  // }
})

/**
 * export const {} = authSlice.actions;
 * {} 안에는 state를 저장하는 함수 reducer: {} 에 정의된 함수를 사용시 .jsx 에서 사용가능
 */
export const {} = dictionarySlice.actions;
/**
 * extraReducers 에서 정의된 .addCase를 사용하기 위해서 주입용으로 내보내는 구문
 * /api/Store.jsx
 */
export default dictionarySlice.reducer;
