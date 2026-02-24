export const EVENTS = {
  GET_EVENTS: "/admin/events/external",
  SET_NEW_EVENT: "/admin/events",
  SET_UPDATE_EVENT: (id) => `/admin/events/${id}`,
  SET_UPDATE_VISIBLE:  (id) => `/admin/events/${id}/visible`,
  UPLOAD_EVENT_IMAGE: `/upload/events`,
}

export const ADMIN_EVENT_ACTIONS = {
  GET_EVENT_LISTS: "GET/admin/events/external/list",
  CREATE: "POST/admin/events",
  UPDATE: "PATCH/admin/events/update",
  UPDATE_VISIBLE: "PATCH/admin/events/updateVisible",
  UPLOAD_IMAGES: "PUT/upload/eventImageFiles",
}
