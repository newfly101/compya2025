import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import { adminMetadata } from "@/domains/admin/config/adminMetadata.js";

export const metadata = adminMetadata();

// 관리자 화면 전체의 문 — 로그인 + ADMIN 만 통과(아니면 홈으로). 화면 차단만 하며 실제 보호는 BE /api/admin/** 가 한다.
// 서버는 껍데기만 내고 본문은 전부 클라이언트(CSR)에서 그린다.
export default function AdminLayout({ children }) {
  return (
    <AuthGate guard allow={["ADMIN"]}>
      {children}
    </AuthGate>
  );
}
