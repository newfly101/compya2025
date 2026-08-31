import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import {
  requestGetMyInfo,
  requestUpdateMyNickname,
  requestDeleteMyAccount,
} from "@/domains/users/store/public/thunks.js";
import { clearUser } from "@/domains/authentication/store/slices.js";
import styles from "./MyPageScreen.module.scss";

const NICKNAME_MAX_LENGTH = 20;

export default function MyPageScreen() {
  useDomainTopBar("마이페이지");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((s) => s.myPage);

  const [isEditing, setIsEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  useEffect(() => {
    dispatch(requestGetMyInfo());
  }, [dispatch]);

  const startEdit = () => {
    setNicknameInput(profile?.nickname ?? "");
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setSaveError("닉네임을 입력해 주세요.");
      return;
    }
    if (trimmed.length > NICKNAME_MAX_LENGTH) {
      setSaveError(`닉네임은 ${NICKNAME_MAX_LENGTH}자 이내로 입력해 주세요.`);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await dispatch(requestUpdateMyNickname(trimmed)).unwrap();
      setIsEditing(false);
    } catch (e) {
      setSaveError(typeof e === "string" ? e : "닉네임 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const openWithdraw = () => {
    setAgreeChecked(false);
    setWithdrawError(null);
    setIsWithdrawOpen(true);
  };

  const closeWithdraw = () => {
    if (isWithdrawing) return;
    setIsWithdrawOpen(false);
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setWithdrawError(null);
    try {
      await dispatch(requestDeleteMyAccount()).unwrap();
      // BE 가 refresh token 삭제 + 쿠키 만료까지 처리한다.
      // FE 는 별도 로그아웃 API 호출 없이 인증 상태만 정리한다.
      dispatch(clearUser());
      navigate(ROUTE_PATHS.home, { replace: true });
    } catch (e) {
      setWithdrawError(typeof e === "string" ? e : "탈퇴 처리에 실패했습니다.");
      setIsWithdrawing(false);
    }
  };

  // 상태 분기 — 최초 조회 중
  if (loading && !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 상태 분기 — 조회 실패
  if (error && !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <p className={styles.stateError}>{error}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => dispatch(requestGetMyInfo())}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 상태 분기 — 데이터 없음 (방어적)
  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <p className={styles.stateText}>회원 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 상태 분기 — 정상
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {profile.profileImage && (
          <img
            className={styles.avatar}
            src={profile.profileImage}
            alt="프로필 이미지"
          />
        )}

        <div className={styles.field}>
          <span className={styles.fieldLabel}>닉네임</span>
          {isEditing ? (
            <div className={styles.editRow}>
              <input
                className={styles.input}
                value={nicknameInput}
                maxLength={NICKNAME_MAX_LENGTH}
                onChange={(e) => setNicknameInput(e.target.value)}
                disabled={isSaving}
              />
              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
              {saveError && <p className={styles.fieldError}>{saveError}</p>}
            </div>
          ) : (
            <div className={styles.viewRow}>
              <span className={styles.fieldValue}>{profile.nickname}</span>
              <button type="button" className={styles.editBtn} onClick={startEdit}>
                수정
              </button>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>이메일</span>
          <span className={styles.fieldValueMuted}>{profile.email}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>마지막 로그인</span>
          <span className={styles.fieldValueMuted}>{profile.lastLoginAt ?? "-"}</span>
        </div>
      </section>

      <section className={styles.dangerZone}>
        <button type="button" className={styles.withdrawBtn} onClick={openWithdraw}>
          회원 탈퇴
        </button>
      </section>

      {isWithdrawOpen && (
        <div className={styles.overlay} onClick={closeWithdraw}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>정말 탈퇴하시겠어요?</h3>
            <p className={styles.modalDesc}>
              탈퇴 후 1개월간 계정 정보가 보관되며, 그 기간 안에 다시 네이버로
              로그인하면 계정이 복구됩니다. 1개월이 지나면 계정 정보는 완전히
              삭제되며 되돌릴 수 없습니다.
            </p>
            <label className={styles.agreeLabel}>
              <input
                type="checkbox"
                checked={agreeChecked}
                onChange={(e) => setAgreeChecked(e.target.checked)}
              />
              안내 사항을 확인했으며 탈퇴에 동의합니다.
            </label>
            {withdrawError && <p className={styles.fieldError}>{withdrawError}</p>}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={closeWithdraw}
                disabled={isWithdrawing}
              >
                닫기
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleWithdraw}
                disabled={!agreeChecked || isWithdrawing}
              >
                {isWithdrawing ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
