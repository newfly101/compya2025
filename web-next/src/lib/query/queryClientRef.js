// 브라우저의 QueryClient 참조 — 로그아웃·계정 전환 때 캐시를 비우려는 용도. 서버에서는 등록하지 않는다(요청 간 공유 금지).
let browserClient = null;
export const registerBrowserQueryClient = (client) => {
  if (typeof window !== "undefined") browserClient = client;
  return client;
};
export const clearQueryCache = () => browserClient?.clear();
