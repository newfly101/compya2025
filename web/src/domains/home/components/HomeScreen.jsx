import React from "react";
import { Link } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import styles from "./HomeScreen.module.scss";

// ── Mock 데이터 ───────────────────────────────────────────────
const QUICK_MENUS = [
  { id: 1, icon: "🎮", label: "스킬\n시뮬레이터", to: "/skill" },
  { id: 2, icon: "📖", label: "추천\n백과사전",   to: "/encyclopedia" },
  { id: 3, icon: "🎯", label: "히스토리\n모드",   to: "/mode/history" },
  { id: 4, icon: "⚾", label: "KBO\n승부예측",    to: "/kbo" },
];

const MOCK_QUIZ = {
  round: 888,
  question: "2026 KBO 개막전에서 가장 빠른 공을 던진 투수는?",
  options: ["육선일(삼성)", "박정인(롯데)", "이기순(SSG)", "황연왕(한화)"],
};

const MOCK_COUPONS = [
  { id: 1, code: "DREAMY602ND",    title: "GM드리미의 2차 쿠폰",    expiredAt: "2026-05-31 23:59" },
  { id: 2, code: "DREAMYDEBUT1ST", title: "GM드리미의 데뷔 쿠폰",   expiredAt: "2026-05-31 23:59" },
  { id: 3, code: "DREAMYGO2ND",    title: "GM드리미의 2차 트리플렛", expiredAt: "2026-05-31 23:59" },
];

// ── Home ──────────────────────────────────────────────────────
const HomeScreen = () => {
  useSetTopBar({ variant: "home" });

  return (
    <div className={styles.home}>

      {/* ── 1. 히어로 배너 ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>컴투스프로야구 2026</div>
        <h1 className={styles.heroTitle}>컴프야펀</h1>
        <p className={styles.heroSub}>야구 게임 종합 정보 사이트</p>
      </section>

      {/* ── 2. 퀵메뉴 ── */}
      <section className={styles.quickMenu}>
        {QUICK_MENUS.map((menu) => (
          <Link key={menu.id} to={menu.to} className={styles.quickItem}>
            <div className={styles.quickIcon}>{menu.icon}</div>
            <span className={styles.quickLabel}>{menu.label}</span>
          </Link>
        ))}
      </section>

      {/* ── 섹션 구분선 ── */}
      <div className={styles.sep} />

      {/* ── 3. 퀴즈 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>
            컴프야 퀴즈 {MOCK_QUIZ.round}회 정답
          </h2>
          <Link to="/quiz" className={styles.more}>이전 회차 →</Link>
        </div>

        <div className={styles.quizCard}>
          <p className={styles.quizQuestion}>{MOCK_QUIZ.question}</p>
          <ul className={styles.quizOptions}>
            {MOCK_QUIZ.options.map((opt, i) => (
              <li key={i} className={styles.quizOption}>
                <span className={styles.optionDot} />
                {opt}
              </li>
            ))}
          </ul>
          <div className={styles.quizActions}>
            <button className={styles.submitBtn}>정답 제출</button>
            <button className={styles.hintBtn}>힌트 보러가기</button>
          </div>
        </div>
        <p className={styles.quizNotice}>
          ※ 매주 금요일에 신규 퀴즈가 등장합니다. 보상은 목요일까지 수령해주세요.
        </p>
      </section>

      {/* ── 섹션 구분선 ── */}
      <div className={styles.sep} />

      {/* ── 4. 최신 쿠폰 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>
            최신 쿠폰
          </h2>
          <Link to="/coupons" className={styles.more}>전체 보기 →</Link>
        </div>

        <div className={styles.couponScroll}>
          {MOCK_COUPONS.map((coupon) => (
            <div key={coupon.id} className={styles.couponCard}>
              <div className={styles.couponTop}>
                <span className={styles.couponCode}>{coupon.code}</span>
                <button className={styles.couponGoBtn}>바로가기</button>
              </div>
              <p className={styles.couponTitle}>{coupon.title}</p>
              <p className={styles.couponExpire}>
                <span className={styles.expireDot}>●</span>
                유효기간 {coupon.expiredAt}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomeScreen;
