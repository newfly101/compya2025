import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";

/**
 * 저장 실패 안내 — 409 충돌(내 값 유지 / 서버 값 가져오기) · 로그인 만료(임시값 보존, 재로그인) · 그 밖의 실패.
 */
const SaveErrorModal = ({ open, error, onResolve, onLogin, onClose }) => {
  const conflict = !!error?.conflict;
  const unauthorized = !conflict && !!error?.unauthorized;
  return (
    <ConfirmModal
      open={open}
      title={conflict ? "다른 기기에서 먼저 수정했어요" : unauthorized ? "로그인이 만료됐어요" : "저장하지 못했어요"}
      message={
        conflict
          ? "내 값을 유지하고 다시 저장하거나, 서버 값을 가져올 수 있어요."
          : unauthorized
            ? "편집 중인 값은 이 탭에 보관했어요. 다시 로그인하면 이어서 저장할 수 있어요."
            : error?.message ?? "잠시 후 다시 시도해 주세요."
      }
      cancelText={conflict ? "내 값 유지" : "닫기"}
      confirmText={conflict ? "서버 값 가져오기" : "로그인"}
      onConfirm={conflict ? () => onResolve(true) : unauthorized ? onLogin : undefined}
      onCancel={conflict ? () => onResolve(false) : onClose}
    />
  );
};

export default SaveErrorModal;
