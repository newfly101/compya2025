import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import "@/domains/legendCollectionSkills/mobile/legendCollectionSkills.tokens.scss";
import "@/domains/legendCollections/mobile/legendCollections.tokens.scss"; // FilterChips 칩 색 토큰
import GsbLoginGuide from "./components/gsbLoginGuide/GsbLoginGuide.jsx";
import PlayerPicker from "./components/playerPicker/PlayerPicker.jsx";
import SimulatorPanel from "./components/simulatorPanel/SimulatorPanel.jsx";
import { useGsbSimulator } from "./hooks/useGsbSimulator";
import "./simulators.tokens.scss";
import styles from "./SimulatorGsbScreen.module.scss";

/** 고스변 시뮬레이터 본문 — 로그인한 이용자 전용. 상태 4종: 로딩(골격) · 오류 · 빈(선수 미선택/필터 0명) · 정상 */
const GsbBody = () => {
  useDomainTopBar("스킬 시뮬레이션");
  const { user } = useAuthentication();
  const sim = useGsbSimulator();

  if (sim.unauthorized) return <GsbLoginGuide />; // 세션이 끊긴 경우 — 같은 안내로

  return (
    <div className={styles.screen}>
      {sim.loading && !sim.error && (
        <div className={styles.skeleton}>
          <Skeleton count={6} height={48} />
        </div>
      )}
      {sim.error && <StateBox status="error" onRetry={sim.retry} />}
      {!sim.loading && !sim.error && (
        <>
          <PlayerPicker legends={sim.legends} selectedId={sim.legend?.id ?? null} onSelect={sim.select} />
          {sim.legend ? (
            <SimulatorPanel key={sim.legend.id} sim={sim} nickname={user?.nickname} />
          ) : (
            <StateBox status="empty" message="위에서 레전드 선수를 골라 보세요." compact />
          )}
        </>
      )}
    </div>
  );
};

// 로그인 확인 전(initialized=false)에는 아무것도 그리지 않는다 — 로그인 사용자에게 안내 화면이 깜빡이지 않게
const SimulatorGsbScreen = () => {
  const { initialized, isAuthenticated } = useAuthentication();
  if (!initialized) return null;
  return isAuthenticated ? <GsbBody /> : <GsbLoginGuide />;
};

export default SimulatorGsbScreen;
