import PageShell from "@/layout/PageShell.jsx";
import ClientOnly from "@/global/ui/clientOnly/ClientOnly.jsx";
import AuthCallBack from "@/domains/authentication/callback/AuthCallBack.jsx";

export const metadata = { title: "로그인 처리 중", robots: { index: false, follow: false } };

// 로그인 콜백 — CSR. 쿼리(?error=)와 sessionStorage 를 읽으므로 브라우저에서만 그린다.
export default function AuthCallbackPage() {
  return (
    <PageShell>
      <ClientOnly>
        <AuthCallBack />
      </ClientOnly>
    </PageShell>
  );
}
