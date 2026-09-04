import { Link } from "react-router-dom";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./AboutScreen.module.scss";

const OPERATOR_NAME = "김재홍";
const OPEN_CHAT_URL = "https://open.kakao.com/o/sw9YuV8h";

const FEATURES = [
  {
    label: "이벤트 정보",
    desc: "진행 중인 이벤트와 종료된 이벤트를 모아서 확인",
    to: ROUTE_PATHS.events,
  },
  {
    label: "쿠폰 모아보기",
    desc: "최신 쿠폰 코드를 한곳에 모아 확인",
    to: ROUTE_PATHS.coupons,
  },
  {
    label: "공지사항 모음",
    desc: "공식 공지와 사이트 공지를 함께 열람",
    to: ROUTE_PATHS.notices,
  },
  {
    label: "레전드 재료",
    desc: "레전드 카드를 만드는 데 필요한 재료 카드를 레전드별로 정리한 표. 능력치·평점, 투수는 구종 등급까지 확인하고 이름 검색과 구단·등급 필터를 지원",
    to: ROUTE_PATHS.legend_stats,
  },
  {
    label: "히스토리 재료",
    desc: "히스토리 모드 로스터 중 레전드 재료로 쓰이는 카드가 어느 라운드에 나오는지 찾아주는 화면",
    to: ROUTE_PATHS.history_legend,
  },
  {
    label: "선수 백과사전",
    desc: "구단·연도별 선수 정보 조회",
    to: ROUTE_PATHS.players,
  },
  {
    label: "확률 공시",
    desc: "확률형 아이템 확률 정보를 검색 가능한 형태로 정리",
    to: ROUTE_PATHS.odds,
  },
  {
    label: "커뮤니티",
    desc: "이용자들이 남긴 글을 볼 수 있는 게시판, 현재는 읽기 전용으로 운영 중",
    to: ROUTE_PATHS.community,
  },
];

const AboutScreen = () => {
  useDomainTopBar("사이트 소개");

  return (
    <div className={styles.screen}>
      <div className={styles.intro}>
        <p className={styles.p}>
          컴프야펀은 모바일 게임 "컴투스 프로야구" 시리즈를 즐기는 이용자를
          위해 만들어진 <strong>비공식 팬 정보 사이트</strong>입니다.
        </p>
        <p className={styles.p}>
          쿠폰, 이벤트, 공지사항처럼 여기저기 흩어져 있는 게임 정보를 한곳에
          모아 두는 것을 목표로 합니다. 그중 레전드 재료와 히스토리 재료는
          공식 자료가 아니라 직접 정리한 데이터로, 레전드 카드를 만드는 데
          필요한 재료 카드를 찾는 데 도움을 드리려고 만들었습니다.
        </p>
        <p className={styles.p}>
          컴프야펀은 게임 개발사·퍼블리셔가 운영하는 공식 사이트가 아니며,
          게임 개발사·퍼블리셔와 어떠한 제휴·협력 관계도 없습니다. 게임 내
          상표, 이미지, 캐릭터 등에 대한 권리는 각 원저작자에게 있습니다.
        </p>
      </div>

      <SectionBlock title="제공 기능">
        <ul className={styles.featureList}>
          {FEATURES.map((f) => (
            <li key={f.label} className={styles.featureItem}>
              <Link to={f.to} className={styles.featureLink}>
                <span className={styles.featureLabel}>{f.label}</span>
                <span className={styles.featureDesc}>{f.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionBlock>

      <SectionBlock title="정보의 출처">
        <div className={styles.body}>
          <p className={styles.p}>
            사이트에 게시되는 쿠폰, 이벤트, 공지, 확률 공시 정보는 게임 공식
            채널과 공개된 자료를 참고하여 정리한 것입니다. 사이트는 정보의
            신속한 전달을 위해 노력하지만, 정확한 정보는 반드시 게임 공식
            채널을 통해 다시 확인하시기 바랍니다.
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="광고 및 쿠키 안내">
        <div className={styles.body}>
          <p className={styles.p}>
            사이트 운영을 위해 Google AdSense 광고가 게재되며, 맞춤형 광고
            제공을 위해 쿠키가 사용될 수 있습니다. 자세한 내용은{" "}
            <Link to={ROUTE_PATHS.privacy} className={styles.link}>개인정보처리방침</Link>
            을 참고해 주세요.
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="운영자 및 문의">
        <div className={styles.body}>
          <p className={styles.p}>운영자: {OPERATOR_NAME} (개인 운영)</p>
          <p className={styles.p}>
            사이트 이용 중 궁금한 점이나 제안이 있다면 아래{" "}
            <a
              href={OPEN_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              카카오톡 오픈채팅방
            </a>
            {" "}또는{" "}
            <Link to={ROUTE_PATHS.contact} className={styles.link}>문의하기</Link>
            {" "}페이지를 이용해 주세요.
          </p>
        </div>
      </SectionBlock>
    </div>
  );
};

export default AboutScreen;
