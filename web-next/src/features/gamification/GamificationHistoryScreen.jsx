"use client";
import { useState } from "react";
import StateBox from "@/components/stateBox/StateBox.jsx";
import { useHistoryInfiniteQuery } from "@/features/gamification/store/queries.js";
import LedgerRow from "@/features/gamification/components/ledgerRow/LedgerRow.jsx";
import styles from "./GamificationHistoryScreen.module.scss";

const TABS = [
  { type: "XP", label: "XP" },
  { type: "POINT", label: "포인트" },
];

// /mypage/history — XP · 포인트 내역. 탭별 목록을 따로 들고 있고 [더 보기] 로 20건씩 이어 읽는다.
export default function GamificationHistoryScreen() {
  const [tab, setTab] = useState("XP");
  const [moreError, setMoreError] = useState(null);
  const q = useHistoryInfiniteQuery(tab);
  const loaded = q.data != null;
  const cur = {
    loaded,
    items: q.data?.pages.flatMap((p) => p.items) ?? [],
    hasNext: q.hasNextPage,
  };
  const publicLoading = q.isFetchingNextPage;
  const publicError = loaded ? null : (q.error?.message ?? null);

  const loadMore = () => {
    setMoreError(null);
    q.fetchNextPage().then((r) => {
      if (r.isError) setMoreError(r.error?.message || "내역을 더 불러오지 못했어요.");
    });
  };

  let body;
  if (!cur.loaded && publicError) {
    body = <StateBox status="error" message={publicError} onRetry={() => q.refetch()} />;
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
