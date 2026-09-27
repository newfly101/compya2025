import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import styles from "./SupportSection.module.scss";
import qrImage from "@/assets/new/kakaopay-qr.png";
import { requestSupportClick } from "@/domains/home/store/public/thunks.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";

const modalRoot = document.getElementById("modal");

// 카카오페이 코드송금 링크 (QR 원본 디코딩 값) — 금액은 응원해 주는 분이 직접 입력
const KAKAOPAY_URL = "https://qr.kakaopay.com/281006011179222321009427";

// 터치 기기면 송금 링크 우선, 그 외(PC)는 QR 우선
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: coarse)").matches;

const SupportSection = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const touch = isTouchDevice();
  const dispatch = useDispatch();
  const { user } = useAuthentication();

  // 로그인 유저의 후원 진출만 statistic_support_click 에 남긴다 (비로그인은 BE 가 무시).
  // fire-and-forget — thunk 가 실패를 rejectWithValue 로 삼키므로 송금 흐름을 막지 않는다.
  const logSupportClick = (target) => {
    if (!user) return;
    dispatch(requestSupportClick(target));
  };

  const close = () => {
    setOpen(false);
    setCopied(false);
  };

  const copyLink = async () => {
    logSupportClick("kakaopay-copy");
    try {
      await navigator.clipboard.writeText(KAKAOPAY_URL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button type="button" className={styles.banner} onClick={() => setOpen(true)}>
        <span className={styles.bannerIcon} aria-hidden="true">💛</span>
        <span className={styles.bannerBody}>
          <span className={styles.bannerText}>컴프야펀이 도움이 되셨나요?</span>
          <span className={styles.bannerSub}>응원 금액은 자유롭게 입력할 수 있어요</span>
        </span>
        <span className={styles.bannerCta}>응원하기</span>
      </button>

      {open &&
        modalRoot &&
        createPortal(
          <div className={styles.overlay} onClick={close}>
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-label="응원하기"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.title}>컴프야펀 응원하기</h2>
              <p className={styles.desc}>
                서버 비용과 운영에 보탬이 됩니다.
                <br />
                응원 금액은 자유롭게 입력할 수 있습니다.
              </p>

              {touch ? (
                <>
                  <a
                    className={styles.payBtn}
                    href={KAKAOPAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logSupportClick("kakaopay")}
                  >
                    카카오페이로 송금하기
                  </a>
                  <details className={styles.qrFold}>
                    <summary className={styles.qrFoldSummary}>QR 코드로 보기</summary>
                    <img className={styles.qr} src={qrImage} alt="카카오페이 코드송금 QR" />
                  </details>
                </>
              ) : (
                <>
                  <img className={styles.qr} src={qrImage} alt="카카오페이 코드송금 QR" />
                  <p className={styles.qrHint}>카카오톡·카카오페이 앱으로 QR 을 스캔해 주세요.</p>
                  <button type="button" className={styles.copyBtn} onClick={copyLink}>
                    {copied ? "링크 복사 완료" : "송금 링크 복사"}
                  </button>
                </>
              )}

              <button type="button" className={styles.closeBtn} onClick={close}>
                닫기
              </button>
            </div>
          </div>,
          modalRoot
        )}
    </>
  );
};

export default SupportSection;
