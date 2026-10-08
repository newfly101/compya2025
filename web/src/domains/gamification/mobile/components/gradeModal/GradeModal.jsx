import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { requestGetLevels } from "@/domains/gamification/store/public/thunks.js";
import { tierOf } from "@/domains/gamification/config/tier.js";
import BallIcon from "@/domains/gamification/mobile/components/ballIcon/BallIcon.jsx";
import ModalFrame from "@/domains/gamification/mobile/components/modalFrame/ModalFrame.jsx";
import styles from "./GradeModal.module.scss";

const GUIDE_PATH = "/guides/gamification";

// 등급 10단계 목록. 열 때 내 위치 행이 가운데 오도록 스크롤한다.
export default function GradeModal({ myLevel, onClose }) {
  const dispatch = useDispatch();
  const { levels, detailLoading, detailError } = useSelector((s) => s.gamification);
  const mineRef = useRef(null);

  useEffect(() => {
    dispatch(requestGetLevels());
  }, [dispatch]);

  useEffect(() => {
    mineRef.current?.scrollIntoView({ block: "center" });
  }, [levels]);

  const closeBtn = (
    <button type="button" className={styles.closeBtn} onClick={onClose}>닫기</button>
  );

  let body;
  if (detailLoading && levels.length === 0) {
    body = <StateBox status="loading" message="등급표를 불러오는 중..." compact />;
  } else if (detailError && levels.length === 0) {
    body = <StateBox status="error" message={detailError} onRetry={() => dispatch(requestGetLevels())} compact />;
  } else if (levels.length === 0) {
    body = <StateBox status="empty" message="등급 정보가 없어요" compact />;
  } else {
    body = (
      <>
        <ul className={styles.list}>
          {levels.map((l) => {
            const mine = l.level === myLevel;
            const future = l.level > myLevel;
            return (
              <li key={l.level} ref={mine ? mineRef : null} className={`${styles.row} ${mine ? styles.mine : ""}`}>
                <span className={future ? styles.ballFuture : undefined}>
                  <BallIcon tier={tierOf(l.level)} size={24} />
                </span>
                <span className={styles.text}>
                  <strong className={styles.name}>Lv.{l.level} {l.name}</strong>
                  <span className={styles.sub}>
                    {l.requiredXp.toLocaleString()} XP부터{l.bonusPoint > 0 ? ` · 보너스 ${l.bonusPoint.toLocaleString()} P` : ""}
                  </span>
                </span>
                {mine && <span className={styles.mineChip}>내 위치</span>}
              </li>
            );
          })}
        </ul>
        <div className={styles.guide}>
          <strong className={styles.guideTitle}>XP 얻는 법</strong>
          <ul className={styles.guideList}>
            <li>하루 첫 방문 10 XP</li>
            <li>저장 1회당 2 XP (하루 5회까지)</li>
            <li>처음 저장하면 20 XP</li>
          </ul>
          <span className={styles.shop}>포인트 사용처는 상점 준비 중이에요</span>
          <Link to={GUIDE_PATH} className={styles.guideLink} onClick={onClose}>전체 안내 보기 ›</Link>
        </div>
      </>
    );
  }

  return (
    <ModalFrame title="등급표" onClose={onClose} footer={closeBtn}>
      {body}
    </ModalFrame>
  );
}
