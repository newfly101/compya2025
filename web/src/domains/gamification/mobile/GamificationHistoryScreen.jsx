import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { requestGetHistory } from "@/domains/gamification/store/public/thunks.js";
import LedgerRow from "@/domains/gamification/mobile/components/ledgerRow/LedgerRow.jsx";
import styles from "./GamificationHistoryScreen.module.scss";

const TABS = [
  { type: "XP", label: "XP" },
  { type: "POINT", label: "포인트" },
];

// /mypage/history — XP · 포인트 내역. 탭별 목록을 따로 들고 있고 [더 보기] 로 20건씩 이어 읽는다.
export default function GamificationHistoryScreen() {
  useDomainTopBar("활동 내역");
  const dispatch = useDispatch();
  const { history, publicLoading, publicError } = useSelector((s) => s.gamification);
  const [tab, setTab] = useState("XP");
  const [moreError, setMoreError] = useState(null);
  const cur = history[tab];

  useEffect(() => {
    if (!cur.loaded) dispatch(requestGetHistory({ type: tab, page: 0 }));
  }, [dispatch, tab, cur.loaded]);

  const loadMore = () => {
    setMoreError(null);
    dispatch(requestGetHistory({ type: tab, page: cur.page + 1 }))
      .unwrap()
      .catch((e) => setMoreError(typeof e === "string" ? e : "내역을 더 불러오지 못했어요."));
  };

  let body;
  if (!cur.loaded && publicError) {
    body = <StateBox status="error" message={publicError} onRetry={() => dispatch(requestGetHistory({ type: tab, page: 0 }))} />;
  } else if (!cur.loaded) {
    body = <StateBox status="loading" message="내역을 불러오는 중..." />;
  } else if (cur.items.length === 0) {
    body = <StateBox status="empty" message="아직 내역이 없어요" />;
  } else {
    body = (
      <>
        <ul className={styles.list}>
          {cur.items.map((item, i) => (
            <LedgerRow key={`${item.rewardDate}-${i}`} item={item} type={tab} />
          ))}
        </ul>
        {moreError && <p className={styles.error} role="alert">{moreError}</p>}
        {cur.hasNext && (
          <button type="button" className={styles.moreBtn} onClick={loadMore} disabled={publicLoading}>
            {publicLoading ? "불러오는 중..." : "더 보기"}
          </button>
        )}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabs} role="tablist" aria-label="내역 종류">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            role="tab"
            aria-selected={tab === t.type}
            className={`${styles.tab} ${tab === t.type ? styles.tabOn : ""}`}
            onClick={() => { setTab(t.type); setMoreError(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {body}
    </div>
  );
}
