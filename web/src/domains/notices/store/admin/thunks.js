import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_NOTICE_ACTIONS } from "@/domains/notices/store/admin/endpoints.js";
import {
  fetchAdminGetNoticeList,
  fetchAdminGetNotice,
  fetchAdminInsertNotice,
  fetchAdminUpdateNotice,
  fetchAdminUpdateVisible,
  fetchAdminUpdatePinned,
  fetchAdminDeleteNotice,
  fetchAdminBulkDeleteNotices,
  fetchAdminBulkUpdateNoticesVisible,
} from "@/domains/notices/store/admin/api.js";

export const requestAdminGetNoticeList = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.GET_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const list = await fetchAdminGetNoticeList();
      return [...list].reverse();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 글쓰기 화면을 새로고침/직접 URL 진입한 경우 목록 store 가 비어있을 수 있어 단건 조회로 보강한다.
export const requestAdminGetNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.GET_ONE,
  async (id, { rejectWithValue }) => {
    try {
      return await fetchAdminGetNotice(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminInsertNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.INSERT,
  async (notice, { rejectWithValue }) => {
    try {
      const created = await fetchAdminInsertNotice(notice);
      return { ...notice, id: created.id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE,
  async ({ id, ...notice }, { rejectWithValue }) => {
    try {
      await fetchAdminUpdateNotice(id, notice);
      return { id, ...notice };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNoticeVisible = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE_VISIBLE,
  async ({ id, visible }, { rejectWithValue }) => {
    try {
      // visible 토글 응답의 data 는 Void(null) — 응답에서 id 를 꺼내지 않고 요청 param 을 그대로 사용.
      await fetchAdminUpdateVisible(id, visible);
      return { id, isVisible: visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNoticePinned = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE_PINNED,
  async ({ id, pinned }, { rejectWithValue }) => {
    try {
      // pinned 토글 응답도 Void(null) — visible 토글과 동일 패턴.
      await fetchAdminUpdatePinned(id, pinned);
      return { id, isPinned: pinned };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminDeleteNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.DELETE,
  async (id, { rejectWithValue }) => {
    try {
      await fetchAdminDeleteNotice(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// v2 일괄 삭제 — 쿠폰 어드민과 동일 패턴(낙관적 갱신, 요청한 ids 를 그대로 반환).
// 서버가 부분 실패(failedIds)를 응답해도 현재는 별도 토스트 없이 요청 id 전량을 반영한다
// (쿠폰 화면과 동일한 한계 — 프로젝트에 토스트 시스템이 없다).
export const requestAdminBulkDeleteNotices = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.BULK_DELETE, async (ids, { rejectWithValue }) => {
    try {
      await fetchAdminBulkDeleteNotices(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// v2 일괄 노출 변경(주로 숨김) — 쿠폰 어드민과 동일 패턴.
export const requestAdminBulkUpdateNoticesVisible = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.BULK_UPDATE_VISIBLE, async ({ ids, visible }, { rejectWithValue }) => {
    try {
      await fetchAdminBulkUpdateNoticesVisible(ids, visible);
      return { ids, visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
