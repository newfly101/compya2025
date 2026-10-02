import { useState } from "react";
import { LoginRequiredModal } from "@/global/ui/loginRequiredModal";
import { LOGIN_REASONS } from "@/global/ui/loginRequiredModal/loginReasons.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";

/**
 * 공용 로그인 안내 모달 (REQ-AUTH-13) — 서랍·홈 바로가기·화면 안 편집 버튼이 모두 이것을 쓴다.
 * 사용: const { askLogin, loginModal } = useLoginRequiredModal();  askLogin("holdings");  JSX 끝에 {loginModal}
 * reason: LOGIN_REASONS 의 키 (holdings | skills | edit). 없으면 기본 문구.
 */
export const useLoginRequiredModal = () => {
  const { login } = useAuthentication();
  const [reason, setReason] = useState(null); // null = 닫힘

  const askLogin = (key = "default") => setReason(key);
  const loginModal = (
    <LoginRequiredModal
      isOpen={reason !== null}
      message={LOGIN_REASONS[reason]}
      onClose={() => setReason(null)}
      onLogin={login}
    />
  );
  return { askLogin, loginModal };
};
