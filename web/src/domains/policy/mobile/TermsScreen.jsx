import { Link } from "react-router-dom";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./TermsScreen.module.scss";

const EFFECTIVE_DATE = "2026년 1월 1일";

// 이용약관 각 조 — 반복 구조라 데이터 배열로 관리한다.
const SECTIONS = [
  {
    title: "제1조 (목적)",
    body: (
      <p className={styles.p}>
        이 약관은 컴프야펀(이하 "사이트")이 제공하는 서비스의 이용과 관련하여
        사이트와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
        규정함을 목적으로 합니다.
      </p>
    ),
  },
  {
    title: "제2조 (정의)",
    body: (
      <ul className={styles.ul}>
        <li>"사이트"란 컴프야펀이 서비스를 제공하기 위해 운영하는 웹사이트를 말합니다.</li>
        <li>"이용자"란 사이트에 접속하여 이 약관에 따라 사이트가 제공하는 서비스를 이용하는 자를 말합니다.</li>
        <li>"콘텐츠"란 사이트가 제공하는 쿠폰, 이벤트, 공지, 확률 공시, 선수 정보 등 모든 정보를 말합니다.</li>
      </ul>
    ),
  },
  {
    title: "제3조 (약관의 게시와 개정)",
    body: (
      <p className={styles.p}>
        사이트는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 초기 화면에
        게시합니다. 사이트는 관련 법령을 위반하지 않는 범위에서 이 약관을
        개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 명시하여 최소
        7일 전부터 공지사항을 통해 고지합니다.
      </p>
    ),
  },
  {
    title: "제4조 (서비스의 내용)",
    body: (
      <>
        <p className={styles.p}>
          사이트는 모바일 게임 "컴투스 프로야구" 시리즈를 즐기는 이용자를
          위해 쿠폰 모아보기, 이벤트 정보, 공지사항 모음, 확률형 아이템
          확률 공시, 선수 백과사전 등의 정보를 제공합니다.
        </p>
        <p className={styles.p}>
          <strong>
            사이트는 게임 개발사·퍼블리셔가 운영하는 공식 사이트가 아니며,
            게임 개발사·퍼블리셔와 어떠한 제휴·협력 관계도 없는 비공식
            팬 정보 사이트입니다.
          </strong>
        </p>
      </>
    ),
  },
  {
    title: "제5조 (서비스 이용)",
    body: (
      <p className={styles.p}>
        사이트의 정보 열람은 별도 회원가입 없이 이용할 수 있으며, 로그인이
        필요한 일부 기능은 네이버 아이디를 통한 소셜 로그인으로 제공됩니다.
      </p>
    ),
  },
  {
    title: "제6조 (이용자의 의무)",
    body: (
      <ul className={styles.ul}>
        <li>사이트의 정상적인 운영을 방해하는 행위 금지</li>
        <li>타인의 저작권 등 지식재산권을 침해하는 행위 금지</li>
        <li>사이트에 게시된 정보를 무단으로 복제, 배포, 상업적으로 이용하는 행위 금지</li>
        <li>관계 법령 및 이 약관에서 금지하는 행위 금지</li>
      </ul>
    ),
  },
  {
    title: "제7조 (서비스 제공의 중단)",
    body: (
      <p className={styles.p}>
        사이트는 시스템 점검, 서버 장애, 운영상·기술상의 필요에 따라
        서비스의 전부 또는 일부 제공을 일시적으로 중단할 수 있습니다.
      </p>
    ),
  },
  {
    title: "제8조 (면책조항)",
    body: (
      <>
        <p className={styles.p}>
          사이트가 제공하는 쿠폰, 이벤트, 확률 공시 등 정보는 게임 공식
          채널 및 공개된 자료를 참고하여 정리한 것으로, 사이트는 해당
          정보의 정확성, 최신성을 보장하지 않습니다. 정확한 정보는 반드시
          게임 공식 채널을 통해 확인하시기 바랍니다.
        </p>
        <p className={styles.p}>
          사이트는 이용자가 사이트에 게시된 정보를 신뢰하여 취한 조치로
          인해 발생한 손해에 대해 책임을 지지 않습니다.
        </p>
      </>
    ),
  },
  {
    title: "제9조 (저작권 및 콘텐츠의 귀속)",
    body: (
      <p className={styles.p}>
        사이트가 직접 작성한 콘텐츠에 대한 저작권은 사이트 운영자에게
        있습니다. 사이트에 인용된 게임 화면, 상표, 공식 자료 등에 대한
        권리는 각 원저작자 및 상표권자에게 있으며, 사이트는 정보 제공
        목적의 범위 내에서 이를 인용합니다.
      </p>
    ),
  },
  {
    title: "제10조 (분쟁 해결)",
    body: (
      <p className={styles.p}>
        이 약관과 관련하여 사이트와 이용자 간에 분쟁이 발생한 경우,
        대한민국 법령을 준거법으로 하며 관할 법원은 민사소송법에 따릅니다.
        약관과 관련한 문의는{" "}
        <Link to={ROUTE_PATHS.contact} className={styles.link}>문의하기</Link>
        {" "}페이지를 이용해 주세요.
      </p>
    ),
  },
];

const TermsScreen = () => {
  useDomainTopBar("이용약관");

  return (
    <div className={styles.screen}>
      <div className={styles.intro}>
        <p className={styles.p}>본 약관은 {EFFECTIVE_DATE}부터 시행됩니다.</p>
      </div>

      {SECTIONS.map((section) => (
        <SectionBlock key={section.title} title={section.title}>
          <div className={styles.sectionBody}>{section.body}</div>
        </SectionBlock>
      ))}
    </div>
  );
};

export default TermsScreen;
