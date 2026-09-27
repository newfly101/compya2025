import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminInsertExEvent,
  fetchAdminUpdateExEvent, fetchAdminUpdateExVisible,
  fetchAdminAllEventList,
  fetchAdminBulkDeleteEvents, fetchAdminBulkUpdateEventsVisible,
} from "@/domains/events/store/admin/api.js";
import { ADMIN_EVENT_ACTIONS } from "@/domains/events/store/admin/endpoints.js";
import { baseEventDTO } from "@/domains/events/store/dto.js";
import { requestUploadImage } from "@/infra/api/uploads/index.js";

export const requestAdminInsertNewExEvent = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.CREATE, async (newEvent, { rejectWithValue, fulfillWithValue }) => {
    try {
      // 폼 값이 아니라 서버가 저장한 값을 그대로 목록에 넣는다 — 폼은 날짜(10자리)만 다루므로
      // 폼 값을 되돌리면 목록의 기간이 서버에 저장된 시각과 달라진다.
      const saved = await fetchAdminInsertExEvent(baseEventDTO(newEvent));

      // 통지 문구는 payload 가 아니라 meta 에 싣는다 — payload 에 섞으면 응답 엔티티가 아닌
      // 필드가 리듀서를 거쳐 목록 행에 그대로 저장되고, 실패는 payload 가 오류 문구 문자열이라
      // 통지를 담을 자리 자체가 없다(operationListener.js).
      return fulfillWithValue(saved, {
        notify: { success: true, message: "이벤트를 등록했습니다." },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestAdminUpdateExEvent = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.UPDATE, async ({ id, ...event }, { rejectWithValue, fulfillWithValue }) => {
    try {
      // 등록과 같은 이유로 서버 응답을 그대로 반영한다(보존된 시작·종료 시각 포함).
      const saved = await fetchAdminUpdateExEvent(id, baseEventDTO(event));

      return fulfillWithValue(saved, {
        notify: { success: true, message: "이벤트를 수정했습니다." },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestAdminUpdateExEventVisible = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.UPDATE_VISIBLE, async ({ id, visible }, { rejectWithValue }) => {
    try {
      // visible 토글 응답의 data 는 Void(null) — 응답에서 id 를 꺼내지 않고 요청 param 을 그대로 사용.
      await fetchAdminUpdateExVisible(id, visible);
      return {
        id,
        visible,
      };
    } catch (e) {
      // 행 토글은 화면에 오류 자리가 없다 — 실패하면 스위치가 조용히 제자리로 돌아간다.
      return rejectWithValue(e.message, {
        notify: { success: false, message: "노출 설정을 바꾸지 못했습니다." },
      });
    }
  });

export const requestAdminUploadEventImage = (file) => {
  return requestUploadImage({
    file,
    directory: "events"
  });
};

export const EVENTS_ADMIN_PAGE_SIZE = 20;

export const requestAdminGetAllEventList = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.GET_ALL_LISTS,
  async ({ page = 0, size = EVENTS_ADMIN_PAGE_SIZE } = {}, { rejectWithValue }) => {
    try {
      // BE 는 created_at DESC(최신순)로 내려준다. 페이지를 이어붙여야 하므로 뒤집지 않는다.
      const list = await fetchAdminAllEventList({ page, size });
      return list;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다. 관리자 셸(useAdminCounts)과 이벤트 화면이 같이 마운트되는 경로가 있다.
  { condition: (_, { getState }) => !getState().events.loading },
);

// 서버는 존재하지 않는 id 를 failedIds 로 분리해 돌려준다(BulkOperationResponse).
// 요청한 ids 를 그대로 반환하면 실패분까지 성공 처리돼 관리자 화면에서 조용히 사라진다.
const toBulkResult = (response) => {
  const { successIds = [], failedIds = [] } = response ?? {};
  return { successIds: successIds.map(Number), failedIds: failedIds.map(Number) };
};

// v2 일괄 삭제 — 쿠폰·공지와 동일 계약: 서버 응답 { successIds, failedIds } 를 반환한다.
export const requestAdminBulkDeleteEvents = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.BULK_DELETE, async (ids, { rejectWithValue }) => {
    try {
      return toBulkResult(await fetchAdminBulkDeleteEvents(ids));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

// v2 일괄 노출 변경(주로 숨김) — { successIds, failedIds, visible }.
export const requestAdminBulkUpdateEventsVisible = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.BULK_UPDATE_VISIBLE, async ({ ids, visible }, { rejectWithValue }) => {
    try {
      return { ...toBulkResult(await fetchAdminBulkUpdateEventsVisible(ids, visible)), visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });
