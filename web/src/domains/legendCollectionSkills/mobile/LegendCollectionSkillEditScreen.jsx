import { useRef } from "react";
import { Link, useBlocker, useParams } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { skillsGuide } from "@/domains/legendCollectionSkills/config/skillsGuide.js";
import "@/domains/legendCollections/mobile/legendCollections.tokens.scss";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";
import LegendTabs from "@/global/ui/mobile/legendTabs/LegendTabs.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import SkillEditor from "./components/skillEditor/SkillEditor.jsx";
import SkillsLoginGuide from "./components/skillsLoginGuide/SkillsLoginGuide.jsx";
import { useLegendCollectionSkills } from "./hooks/useLegendCollectionSkills";
import "./legendCollectionSkills.tokens.scss";
import styles from "./LegendCollectionSkillEditScreen.module.scss";

/**
 * 레전드 한 명의 스킬 기록 편집 — 스킬 3개·등급 등록, 강화 버튼, 되돌리기·초기화 (옛 목록 행 펼침 편집기를 화면으로 옮긴 것).
 * 저장 안 된 강화가 있으면 이탈 시 버릴지 묻는다.
 */
const SkillEdit = () => {
  useDomainTopBar("레전드 재료");
  const { legendId } = useParams();
  const c = useLegendCollectionSkills();
  const dirtyRef = useRef(0); // 편집기의 저장 안 된 강화 건수 (편집기가 갱신)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirtyRef.current > 0 && currentLocation.pathname !== nextLocation.pathname,
  );
  const row = c.rows.find((r) => String(r.legend.id) === legendId);

  return (
    <div className={styles.screen}>
      <LegendTabs guide={skillsGuide} />
      <Link to={ROUTE_PATHS.legend_collection_skills} className={styles.back}>
        <span aria-hidden="true">‹</span> 스킬 기록 목록
      </Link>

      {c.loading && !c.error && (
        <div className={styles.skeleton}>
          <Skeleton count={4} height={48} />
        </div>
      )}
      {c.error && <StateBox status="error" onRetry={c.retry} />}
      {!c.loading && !c.error && !row && (
        <>
          <StateBox status="empty" message="보유중·액자로 표시한 레전드만 스킬을 기록할 수 있어요." compact />
          <p className={styles.more}>
            <Link to={ROUTE_PATHS.legend_collection_manage}>보유 현황에서 바꾸기 →</Link>
          </p>
        </>
      )}
      {!c.loading && !c.error && row && <SkillEditor key={row.item.rev} row={row} c={c} dirtyRef={dirtyRef} />}

      <ConfirmModal
        open={blocker.state === "blocked"}
        title="저장하지 않은 강화"
        message="저장하지 않은 강화가 사라져요."
        confirmText="버리기"
        tone="danger"
        onCancel={() => blocker.reset()}
        onConfirm={() => blocker.proceed()}
      />
    </div>
  );
};

// 로그인 확인 전(initialized=false)에는 아무것도 그리지 않는다 — 로그인 사용자에게 안내 화면이 깜빡이지 않게
const LegendCollectionSkillEditScreen = () => {
  const { initialized, isAuthenticated } = useAuthentication();
  if (!initialized) return null;
  return isAuthenticated ? <SkillEdit /> : <SkillsLoginGuide />;
};

export default LegendCollectionSkillEditScreen;
