export const EVENTS = {
  GET_EVENTS: "/admin/events/external",
  GET_ALL_EVENTS: "/admin/events",
  SET_NEW_EVENT: "/admin/events",
  SET_UPDATE_EVENT: (id) => `/admin/events/${id}`,
  SET_UPDATE_VISIBLE:  (id) => `/admin/events/${id}/visible`,
  DELETE_EVENT: (id) => `/admin/events/${id}`,
  UPLOAD_EVENT_IMAGE: `/upload/events`,
}

export const ADMIN_EVENT_ACTIONS = {
  GET_EVENT_LISTS: "GET/admin/events/external/list",
  GET_ALL_LISTS: "GET/admin/events/all/list",
  CREATE: "POST/admin/events",
  UPDATE: "PATCH/admin/events/update",
  UPDATE_VISIBLE: "PATCH/admin/events/updateVisible",
  DELETE: "DELETE/admin/events/delete",
  UPLOAD_IMAGES: "PUT/upload/eventImageFiles",
}
