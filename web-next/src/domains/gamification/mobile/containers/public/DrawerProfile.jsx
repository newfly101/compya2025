import { useGamificationMe } from "@/domains/gamification/mobile/hooks/useGamificationMe.js";
import { tierOf } from "@/domains/gamification/config/tier.js";
import TierChip from "@/domains/gamification/mobile/components/tierChip/TierChip.jsx";
import BallIcon from "@/domains/gamification/mobile/components/ballIcon/BallIcon.jsx";
import styles from "./DrawerProfile.module.scss";

// 등급 칩 + 대표 칭호 칩 한 줄(마이페이지용). 칭호가 없어도 "대표 칭호 없음" 칩으로 같은 높이를 지킨다.
export function ProfileChips() {
  const { me } = useGamificationMe();
  const equipped = me?.titles?.find((t) => t.code === me.equippedCode);
  return (
    <div className={styles.chips}>
      {me && <TierChip level={me.level} name={me.levelName} />}
      {me && <span className={equipped ? styles.titleChip : `${styles.titleChip} ${styles.titleNone}`}>{equipped ? equipped.name : "대표 칭호 없음"}</span>}
    </div>
  );
}

// 서랍 프로필 카드 — 티어 면 위에 아바타(T3+ 링) · 닉네임 · 등급 · 대표 칭호 · XP 바. 다른 도메인(Drawer)이 가져다 쓴다.
export default function DrawerProfile({ avatar, nickname }) {
  const { me } = useGamificationMe();
  const tier = tierOf(me?.level);
  const equipped = me?.titles?.find((t) => t.code === me.equippedCode);
  const { xp = 0, nextLevelXp } = me ?? {};
  const percent = nextLevelXp ? Math.min(100, Math.round((xp / nextLevelXp) * 100)) : 100;

  return (
    <div className={styles.card} data-tier={tier}>
      <div className={styles.top}>
        <span className={styles.avatar}>{avatar}</span>
        <div className={styles.info}>
          <span className={styles.name}>{nickname}</span>
          <div className={styles.levelRow}>
            {me && (
              <>
                <BallIcon tier={tier} size={16} />
                <span className={styles.level}>Lv.{me.level} {me.levelName}</span>
              </>
            )}
          </div>
          <div className={styles.chips}>
            {me && (
              <span className={`${styles.titleChip} ${equipped ? "" : styles.titleNone}`}>
                {equipped ? equipped.name : "대표 칭호 없음"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.xpRow}>
        <span>{me && nextLevelXp ? `다음 등급까지 ${Math.max(0, nextLevelXp - xp).toLocaleString()} XP` : ""}</span>
        <span>{me ? (nextLevelXp ? `${xp.toLocaleString()} / ${nextLevelXp.toLocaleString()}` : "최고 등급") : ""}</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={nextLevelXp ?? xp}
        aria-valuenow={xp}
        aria-label="다음 등급까지 경험치"
      >
        {me && <div className={styles.fill} style={{ width: `${percent}%` }} />}
      </div>
    </div>
  );
}
