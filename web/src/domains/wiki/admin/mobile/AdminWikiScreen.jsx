// AdminWikiScreen.jsx — ENC-A0 admin 위키 관리 entry
// /admin/wiki — 3 entity 카드 (마구 / 등급 / 스탯 영향)
import { useNavigate } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./AdminWikiScreen.module.scss";

const ADMIN_SECTIONS = [
  {
    id: "pitches",
    icon: "⚾",
    title: "마구 관리",
    desc: "wiki_pitch 등록 / 수정 / 비활성화",
    to: "/admin/wiki/pitches",
  },
  {
    id: "pitch-grades",
    icon: "📊",
    title: "구종 등급 관리",
    desc: "wiki_pitch_grade 등록 / 수정 / 삭제",
    to: "/admin/wiki/pitch-grades",
  },
  {
    id: "stat-influences",
    icon: "📈",
    title: "스탯 영향 관리",
    desc: "wiki_stat_influence 등록 / 수정 / 비활성화",
    to: "/admin/wiki/stat-influences",
  },
];

export default function AdminWikiScreen() {
  useDomainTopBar("위키 관리");
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <p className={styles.desc}>게임 기본 정보 데이터를 관리합니다.</p>
      <div className={styles.cardList}>
        {ADMIN_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={styles.card}
            onClick={() => navigate(section.to)}
            aria-label={section.title}
          >
            <span className={styles.cardIcon}>{section.icon}</span>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>{section.title}</span>
              <span className={styles.cardDesc}>{section.desc}</span>
            </div>
            <span className={styles.cardArrow}>›</span>
          </button>
        ))}
      </div>
    </main>
  );
}
