// domains/guides/mobile/GuidesScreen.jsx
// /guides 목록 — 정적 데이터라 로딩/에러가 존재하지 않지만, 콘텐츠가 아직 하나도 없는
// 경우(작업 중 실수로 GUIDES 가 비는 경우)를 대비해 empty 분기만 방어적으로 둔다.
import { Link } from "react-router-dom";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { GUIDES } from "@/domains/guides/content/index.js";
import styles from "./GuidesScreen.module.scss";

const GuidesScreen = () => {
  useDomainTopBar("가이드");

  return (
    <div className={styles.screen}>
      <div className={styles.intro}>
        <p className={styles.p}>
          컴프야펀이 직접 정리한 공략·활용 가이드입니다. 게임사 공지를 옮긴 글이 아니라, 사이트 안 데이터를
          바탕으로 저희가 분석하고 다시 쓴 글만 모아둡니다.
        </p>
      </div>

      {GUIDES.length === 0 ? (
        <StateBox status="empty" message="등록된 가이드가 없습니다." />
      ) : (
        <ul className={styles.list}>
          {GUIDES.map((guide) => (
            <li key={guide.slug} className={styles.item}>
              <Link to={`/guides/${guide.slug}`} className={styles.link}>
                <span className={styles.title}>{guide.title}</span>
                <span className={styles.desc}>{guide.seo?.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuidesScreen;
