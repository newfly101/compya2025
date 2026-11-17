"use client";
import { useEffect, useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerBrowserQueryClient } from "@/lib/query/queryClientRef.js";
import { useOperationStore } from "@/stores/operationStore.js";

// 작업 결과 모달을 띄우는 단일 경로 — 원본 operationListener(meta.notify) 대체.
// query/mutation 에 meta: { notify: { success: "문구", failure: "문구" } } 를 달면 성공·실패 때 전역 모달이 뜬다.
// 문구는 호출하는 쪽이 정한다(권한 조건 없음). 화면이 직접 실패를 보여주는 곳에는 달지 않는다(이중 표시).
const notify = (meta, success) => {
  const message = meta?.notify?.[success ? "success" : "failure"];
  if (message) useOperationStore.getState().setLastOperation({ success, message });
};

const makeClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onSuccess: (_data, query) => notify(query.meta, true),
      onError: (_error, query) => notify(query.meta, false),
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => notify(mutation.meta, true),
      onError: (_error, _vars, _ctx, mutation) => notify(mutation.meta, false),
    }),
    defaultOptions: {
      // 재시도는 화면의 [다시 시도] 버튼이 맡는다 — 자동 재시도는 실패 화면을 늦출 뿐이다
      queries: { retry: false, refetchOnWindowFocus: false, staleTime: 60 * 1000 },
    },
  });

const QueryProvider = ({ children }) => {
  const [client] = useState(makeClient); // 컴포넌트당 1회 생성 — 서버에서 요청 간 캐시가 섞이지 않는다
  // 렌더 중이 아니라 커밋 뒤에 등록 — StrictMode 가 버린 client 가 등록되지 않는다.
  useEffect(() => {
    registerBrowserQueryClient(client);
  }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProvider;
