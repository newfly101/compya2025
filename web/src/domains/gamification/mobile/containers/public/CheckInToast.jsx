import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissCheckIn } from "@/domains/gamification/store/slices.js";
import { tierOf } from "@/domains/gamification/config/tier.js";
import BallIcon from "@/domains/gamification/mobile/components/ballIcon/BallIcon.jsx";
import styles from "./CheckInToast.module.scss";

const TOAST_MS = 3000;

// "으로/로" — 받침이 있으면 으로 (ㄹ 받침은 로)
const withRo = (word) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}로`;
  const jong = code % 28;
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
};

// 출석 체크인 토스트 — 앱 전역 1곳. 3초 뒤 자동으로 닫힌다. xp>0 일 때만 슬라이스가 값을 채운다.
export default function CheckInToast() {
  const dispatch = useDispatch();
  const last = useSelector((s) => s.gamification.lastCheckIn);

  useEffect(() => {
    if (!last) return undefined;
    const id = setTimeout(() => dispatch(dismissCheckIn()), TOAST_MS);
    return () => clearTimeout(id);
  }, [last, dispatch]);

  if (!last) return null;
  const reward = `+${last.xp} XP${last.point > 0 ? ` · +${last.point}P` : ""}`;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <BallIcon tier={tierOf(last.level)} size={24} />
      <div className={styles.text}>
        {last.leveledUp ? (
          <>
            <strong className={styles.title}>Lv.{last.level} {withRo(last.levelName)} 올랐어요</strong>
            <span className={styles.sub}>{reward}</span>
          </>
        ) : (
          <strong className={styles.title}>{reward}</strong>
        )}
      </div>
    </div>
  );
}
