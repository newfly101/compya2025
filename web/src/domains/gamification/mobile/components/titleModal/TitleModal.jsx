import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { requestGetTitles, requestEquipTitle } from "@/domains/gamification/store/public/thunks.js";
import LockIcon from "@/domains/gamification/mobile/components/lockIcon/LockIcon.jsx";
import ModalFrame from "@/domains/gamification/mobile/components/modalFrame/ModalFrame.jsx";
import styles from "./TitleModal.module.scss";

// 칭호 등록 — 가진 칭호를 라디오로 고르고 [등록]. 못 받은 칭호는 조건과 함께 아래에 보여 준다.
export default function TitleModal({ onClose }) {
  const dispatch = useDispatch();
  const { titleDefs, detailLoading, detailError, me, mutateLoading } = useSelector((s) => s.gamification);
  const equippedCode = me?.equippedCode ?? null;
  const [selected, setSelected] = useState(equippedCode);
  const [failMessage, setFailMessage] = useState(null);

  useEffect(() => {
    dispatch(requestGetTitles());
  }, [dispatch]);

  const equip = async (code, closeOnDone) => {
    setFailMessage(null);
    try {
      await dispatch(requestEquipTitle(code)).unwrap();
      if (closeOnDone) onClose();
      else setSelected(null);
    } catch (e) {
      setFailMessage(typeof e === "string" ? e : "칭호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const owned = titleDefs.filter((t) => t.owned);
  const locked = titleDefs.filter((t) => !t.owned);
  const canSubmit = selected != null && selected !== equippedCode && !mutateLoading;

  let body;
  if (detailLoading && titleDefs.length === 0) {
    body = <StateBox status="loading" message="칭호를 불러오는 중..." compact />;
  } else if (detailError && titleDefs.length === 0) {
    body = <StateBox status="error" message={detailError} onRetry={() => dispatch(requestGetTitles())} compact />;
  } else {
    body = (
      <>
        {owned.length === 0 ? (
          <p className={styles.empty}>아직 받은 칭호가 없어요. 아래 조건을 채우면 받을 수 있어요.</p>
        ) : (
          <div role="radiogroup" aria-label="보유 칭호" className={styles.list}>
            {owned.map((t) => (
              <label key={t.code} className={`${styles.option} ${selected === t.code ? styles.optionOn : ""}`}>
                <input
                  type="radio"
                  name="title"
                  className={styles.radio}
                  checked={selected === t.code}
                  onChange={() => setSelected(t.code)}
                />
                <span className={styles.optionText}>{t.name}</span>
                {equippedCode === t.code && <span className={styles.current}>대표</span>}
              </label>
            ))}
          </div>
        )}
        {equippedCode && (
          <button type="button" className={styles.clearLink} onClick={() => equip(null, false)} disabled={mutateLoading}>
            대표 칭호 해제
          </button>
        )}
        {locked.length > 0 && (
          <>
            <strong className={styles.lockedHead}>아직 못 받은 칭호</strong>
            <ul className={styles.list}>
              {locked.map((t) => (
                <li key={t.code} className={styles.lockedRow}>
                  <span className={styles.lockIcon}><LockIcon /></span>
                  <span className={styles.lockedText}>
                    <strong className={styles.lockedName}>{t.name}</strong>
                    <span className={styles.lockedCond}>{t.condition}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  }

  const footer = (
    <>
      {failMessage && <p className={styles.helperError} role="alert">{failMessage}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.closeBtn} onClick={onClose}>닫기</button>
        <button type="button" className={styles.submitBtn} disabled={!canSubmit} onClick={() => equip(selected, true)}>
          {mutateLoading ? "등록 중..." : "등록"}
        </button>
      </div>
    </>
  );

  return (
    <ModalFrame title="칭호 등록" onClose={onClose} footer={footer}>
      {body}
    </ModalFrame>
  );
}
