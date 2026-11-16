import { useQuery } from "@tanstack/react-query";
import { fetchGetAdminChatOnline } from "@/features/chats/store/adminApi.js";

export const adminChatKeys = { online: (tick) => ["admin", "chats", "online", tick] };

// tick(PRESENCE 수신마다 +1)이 바뀌면 다시 조회
export const useAdminChatOnline = (tick) =>
  useQuery({ queryKey: adminChatKeys.online(tick), queryFn: fetchGetAdminChatOnline, staleTime: 0 });
