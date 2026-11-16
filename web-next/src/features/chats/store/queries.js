import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGetAdminChatOnline } from "@/features/chats/store/adminApi.js";

export const adminChatKeys = { online: ["admin", "chats", "online"] };

// 고정 키. tick(PRESENCE 수신마다 +1)이 바뀌면 키를 바꾸지 않고 refetch 한다(키가 바뀌면 캐시 항목이 쌓이고 매번 빈 로딩).
export const useAdminChatOnline = (tick) => {
  const q = useQuery({ queryKey: adminChatKeys.online, queryFn: fetchGetAdminChatOnline, staleTime: 0 });
  const { refetch } = q;
  const last = useRef(tick);
  useEffect(() => {
    if (last.current === tick) return; // 첫 마운트는 useQuery 가 조회한다
    last.current = tick;
    refetch();
  }, [tick, refetch]);
  return q;
};
