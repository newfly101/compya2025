export const ADMIN_GAMIFICATION = {
  USER_TITLES: (publicId) => `/admin/gamification/users/${publicId}/titles`,
  GRANT_TITLE: "/admin/gamification/titles/grant",
  REVOKE_TITLE: "/admin/gamification/titles/revoke",
  GRANT_EARLY_ADOPTERS: "/admin/gamification/early-adopters/grant",
};

export const ADMIN_GAMIFICATION_ACTIONS = {
  GET_USER_TITLES: "GET/admin/gamification/users/titles",
  GRANT_TITLE: "POST/admin/gamification/titles/grant",
  REVOKE_TITLE: "POST/admin/gamification/titles/revoke",
  GRANT_EARLY_ADOPTERS: "POST/admin/gamification/early-adopters/grant",
};
