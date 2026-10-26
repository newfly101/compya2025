import { useLocation, useNavigate } from "react-router-dom";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";

// 마이페이지(닉네임을 바꾸는 곳)와 OAuth 콜백에서는 띄우지 않는다. 로그아웃은 화면이 없어 예외 불필요.
const isExempt = (pathname) =>
  pathname.startsWith(ROUTE_PATHS.mypage) || pathname.startsWith(ROUTE_PATHS.authentication);

// 닉네임 미설정 로그인 사용자를 마이페이지로 강제 이동시키는 전역 안내 (확인 버튼 하나, 닫기 없음).
const NicknameGuard = () => {
  const { initialized, isAuthenticated, nicknameUnset } = useAuthentication();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const open = initialized && isAuthenticated && nicknameUnset && !isExempt(pathname);
  return (
    <ConfirmModal
      open={open}
      title="닉네임을 설정해 주세요"
      message="닉네임을 설정해야 컴프야펀 콘텐츠를 이용할 수 있어요"
      cancelText="확인"
      onCancel={() => navigate(ROUTE_PATHS.mypage)}
    />
  );
};

export default NicknameGuard;
