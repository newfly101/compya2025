import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetNoticeList, requestGetNoticeDetail } from "@/domains/notices/store/public/thunks.js";
import {
  requestAdminGetNoticeList,
  requestAdminGetNotice,
  requestAdminInsertNotice,
  requestAdminUpdateNotice,
  requestAdminUpdateNoticeVisible,
  requestAdminBulkDeleteNotices,
  requestAdminBulkUpdateNoticesVisible,
  requestAdminRefreshNotices,
} from "@/domains/notices/store/admin/thunks.js";

// 공개 화면과 어드민 화면은 상태를 나눠 쓴다 — 어드민 목록에는 숨긴 공지가 들어 있어서
// 한 배열을 공유하면 공개 상세가 숨긴 공지를 렌더하고 어드민 오류 문구까지 공개 화면에 새어 나온다.
// publicXxx = 공개(GET /notices), siteNotices/loading/error = 어드민 전용.
const initialState = {
  publicSiteNotices: [],  // 공개 목록 중 INTERNAL(사이트 공지)
  officialNotices:   [],  // 공개 목록 중 EXTERNAL(공식 공지)
  publicLoaded:  false,   // 공개 목록 조회가 한 번이라도 성공했는지 — "0건"과 "아직 로딩 전"을 구분하는 데 쓴다
  publicLoading: false,
  publicError:   null,

  siteNotices: [],        // 어드민 목록(숨긴 공지 포함)
  loading: false,         // 어드민 목록 조회 전용
  error:   null,

  detailLoading: false,   // 어드민 단건 조회(글쓰기 화면 새로고침 대비) 전용
  detailError:   null,

  contentError:  null,    // 공개 상세 본문(requestGetNoticeDetail) 조회 실패 — 제목/날짜는 이미 있어 무음으로 넘어가던 것을 화면이 구분하는 데 쓴다

  mutateLoading: false,   // 등록·수정·노출변경·일괄 (쓰기) 전용
  mutateError:   null,
};

const noticeSlice = createSlice({
  name: "notices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ── 공개 목록 조회 (source 기준 분리) ─────────────────────
       "public" scope = publicLoading/publicError — 공개 전용 칸도 규약이 이미 갖고 있다. */
    applyAsyncHandlers(builder, requestGetNoticeList, (state, action) => {
      state.publicSiteNotices = action.payload.siteNotices;
      state.officialNotices   = action.payload.officialNotices;
      state.publicLoaded      = true;
    }, "public");

    /* ── 공개 상세 본문 채우기 ─────────────────────────────────
       목록 SQL 이 본문을 내려주지 않아 상세 화면에서 한 건만 더 받아 합친다.
       제목·요약은 이미 있으니 공개 목록의 로딩/오류 상태(publicLoading/publicError)는 건드리지
       않는다 — 대신 본문 전용 contentError 를 둬서 실패했는데 정상 화면처럼 보이는 것을 막는다. */
    builder
      .addCase(requestGetNoticeDetail.pending, (state) => {
        state.contentError = null;
      })
      .addCase(requestGetNoticeDetail.fulfilled, (state, action) => {
        const detail = action.payload;
        if (!detail?.id) return;
        const idx = state.publicSiteNotices.findIndex(n => Number(n.id) === Number(detail.id));
        if (idx !== -1) state.publicSiteNotices[idx] = { ...state.publicSiteNotices[idx], ...detail };
      })
      .addCase(requestGetNoticeDetail.rejected, (state, action) => {
        state.contentError = action.payload ?? "본문을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
      });

    /* ── 어드민 조회 (전체 목록) ─────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminGetNoticeList, (state, action) => {
      state.siteNotices = action.payload;
    });

    /* ── 캐시 동기화 — 목록 조회와 동일하게 전체 교체 ──────────── */
    applyAsyncHandlers(builder, requestAdminRefreshNotices, (state, action) => {
      state.siteNotices = action.payload;
    });

    /* ── 어드민 단건 조회(글쓰기 화면 새로고침 대비) ───────────── */
    applyAsyncHandlers(builder, requestAdminGetNotice, (state, action) => {
      const notice = action.payload;
      const idx = state.siteNotices.findIndex(n => n.id === notice.id);
      if (idx !== -1) state.siteNotices[idx] = { ...state.siteNotices[idx], ...notice };
      else state.siteNotices.unshift(notice);
    }, "detail");

    /* ── 신규 등록 ────────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminInsertNotice, (state, action) => {
      state.siteNotices.unshift(action.payload);
    }, "mutate");

    /* ── 수정 ─────────────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminUpdateNotice, (state, action) => {
      const updated = action.payload;
      const idx = state.siteNotices.findIndex(n => n.id === updated.id);
      if (idx !== -1) state.siteNotices[idx] = { ...state.siteNotices[idx], ...updated };
    }, "mutate");

    /* ── visible 변경 ─────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminUpdateNoticeVisible, (state, action) => {
      const { id, isVisible } = action.payload;
      state.siteNotices = state.siteNotices.map(n =>
        Number(n.id) === Number(id) ? { ...n, isVisible } : n
      );
    }, "mutate");

    /* ── 일괄 삭제 (v2) — 서버가 처리한 successIds 만 반영한다 ── */
    applyAsyncHandlers(builder, requestAdminBulkDeleteNotices, (state, action) => {
      const ids = new Set(action.payload.successIds);
      state.siteNotices = state.siteNotices.filter(n => !ids.has(Number(n.id)));
    }, "mutate");

    /* ── 일괄 노출 변경 (v2) — 위와 동일하게 successIds 만 반영 ── */
    applyAsyncHandlers(builder, requestAdminBulkUpdateNoticesVisible, (state, action) => {
      const { successIds, visible } = action.payload;
      const idSet = new Set(successIds);
      state.siteNotices = state.siteNotices.map(n =>
        idSet.has(Number(n.id)) ? { ...n, isVisible: visible } : n
      );
    }, "mutate");
  },
});

export default noticeSlice.reducer;
