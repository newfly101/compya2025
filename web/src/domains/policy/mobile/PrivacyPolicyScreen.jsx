import { Link } from "react-router-dom";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./PrivacyPolicyScreen.module.scss";

const OPERATOR_NAME = "김재홍";
const OPERATOR_EMAIL = "newfly101@naver.com";
const EFFECTIVE_DATE = "2026년 1월 1일";
const RETENTION_PERIOD = "1개월";

// 개인정보처리방침 각 조 — 반복 구조라 데이터 배열로 관리한다.
const SECTIONS = [
  {
    title: "제1조 (수집하는 개인정보 항목)",
    body: (
      <>
        <p className={styles.p}>
          컴프야펀(이하 "사이트")은 네이버 아이디로 로그인 기능을 제공하며,
          로그인 과정에서 네이버로부터 아래 정보를 제공받아 저장합니다.
        </p>
        <ul className={styles.ul}>
          <li>네이버 회원 식별자 (계정 구분용)</li>
          <li>이메일 주소</li>
          <li>별명(닉네임)</li>
          <li>프로필 사진</li>
          <li>연령대</li>
        </ul>
        <p className={styles.p}>
          그 밖에 서비스 이용 과정에서 아래 정보가 자동으로 생성되어
          수집됩니다.
        </p>
        <ul className={styles.ul}>
          <li>마지막 로그인 일시</li>
          <li>가입일시 및 정보 수정일시</li>
          <li>접속 IP, 쿠키, 방문 일시, 서비스 이용 기록, 브라우저 및 기기 정보</li>
        </ul>
      </>
    ),
  },
  {
    title: "제2조 (개인정보의 수집 및 이용 목적)",
    body: (
      <ul className={styles.ul}>
        <li>회원 식별 및 로그인 상태 유지</li>
        <li>서비스 제공, 부정 이용 방지 및 비인가 사용 차단</li>
        <li>문의 응대 및 공지사항 전달</li>
        <li>서비스 이용 통계 분석 및 품질 개선</li>
      </ul>
    ),
  },
  {
    title: "제3조 (개인정보의 보유 및 이용 기간)",
    body: (
      <>
        <p className={styles.p}>
          사이트는 원칙적으로 개인정보의 수집 및 이용 목적이 달성된 후에는 해당
          정보를 지체 없이 파기합니다. 회원 탈퇴 시 개인정보는 탈퇴일로부터
          {" "}{RETENTION_PERIOD}간 보관한 후 파기하며, 관계 법령에 따라 보존할
          필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.
        </p>
        <p className={styles.p}>
          현재 사이트 내 회원 탈퇴 기능은 준비 중이며, 탈퇴를 원하는 경우
          아래{" "}
          <Link to={ROUTE_PATHS.contact} className={styles.link}>문의하기</Link>
          {" "}페이지의 이메일로 요청해 주시면 확인 후 처리합니다.
        </p>
      </>
    ),
  },
  {
    title: "제4조 (개인정보의 제3자 제공 및 처리 위탁)",
    body: (
      <>
        <p className={styles.p}>
          사이트는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않으며,
          아래의 경우에 한해 서비스 제공을 위해 정보가 연계·처리됩니다.
        </p>
        <ul className={styles.ul}>
          <li>
            네이버(NAVER) — 소셜 로그인 인증 처리를 위해 네이버 계정 정보가
            사용됩니다.
          </li>
          <li>
            Google Analytics 4 — 방문 통계 분석을 위해 이용자의 서비스 이용
            정보가 Google 에 전달됩니다.
          </li>
          <li>
            Google AdSense — 사이트에는 Google AdSense 광고가 게재되며, Google
            은 맞춤형 광고 제공을 위해 쿠키를 사용해 방문 기록을 수집할 수
            있습니다. 자세한 내용은{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.link}
            >
              Google 광고 정책
            </a>
            을 참고하세요.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "제5조 (쿠키의 사용)",
    body: (
      <>
        <p className={styles.p}>
          사이트는 이용자 맞춤 서비스 제공과 광고 게재를 위해 아래와 같은
          쿠키(Cookie)를 사용합니다.
        </p>
        <ul className={styles.ul}>
          <li>인증 쿠키 (ACCESS_TOKEN, HttpOnly) — 로그인 상태 유지</li>
          <li>분석 쿠키 (Google Analytics 4) — 방문 통계 분석</li>
          <li>광고 쿠키 (Google AdSense) — 맞춤형 광고 게재</li>
        </ul>
        <p className={styles.p}>
          쿠키는 웹사이트가 이용자의 브라우저에 저장하는 소량의 정보로,
          이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수
          있습니다. 다만 쿠키 저장을 거부할 경우 일부 서비스 이용에 제한이
          있을 수 있습니다.
        </p>
        <p className={styles.p}>
          Google 은 쿠키를 사용해 맞춤형 광고를 게재하며, 이용자는{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.link}
          >
            https://www.google.com/settings/ads
          </a>
          {" "}에서 맞춤 광고 게재를 직접 끌 수 있습니다.
        </p>
      </>
    ),
  },
  {
    title: "제6조 (이용자 및 법정대리인의 권리와 행사 방법)",
    body: (
      <p className={styles.p}>
        이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를
        요구할 수 있습니다. 현재 사이트 내 회원정보 수정 화면은 준비 중이며,
        권리 행사는 아래{" "}
        <Link to={ROUTE_PATHS.contact} className={styles.link}>문의하기</Link>
        {" "}페이지의 이메일로 요청해 주시면 사이트는 관계 법령이 정한 절차에
        따라 지체 없이 조치합니다.
      </p>
    ),
  },
  {
    title: "제7조 (개인정보의 안전성 확보 조치)",
    body: (
      <ul className={styles.ul}>
        <li>개인정보 접근 권한의 최소화 및 관리</li>
        <li>로그인 인증 정보는 HttpOnly 쿠키(ACCESS_TOKEN)로 저장하여 자바스크립트를 통한 탈취를 방지</li>
        <li>개인정보 처리 시스템 접속 기록의 보관</li>
      </ul>
    ),
  },
  {
    title: "제8조 (개인정보 보호책임자)",
    body: (
      <>
        <p className={styles.p}>
          사이트는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의
          불만처리 및 피해구제 등을 위해 아래와 같이 개인정보 보호책임자를
          지정하고 있습니다.
        </p>
        <ul className={styles.ul}>
          <li>성명: {OPERATOR_NAME}</li>
          <li>이메일: {OPERATOR_EMAIL}</li>
        </ul>
      </>
    ),
  },
  {
    title: "제9조 (고지의 의무)",
    body: (
      <p className={styles.p}>
        현 개인정보처리방침의 내용이 추가, 삭제 및 수정이 있을 경우에는
        개정 최소 7일 전부터 사이트 공지사항을 통해 고지합니다.
      </p>
    ),
  },
];

const PrivacyPolicyScreen = () => {
  useDomainTopBar("개인정보처리방침");

  return (
    <div className={styles.screen}>
      <div className={styles.intro}>
        <p className={styles.p}>
          컴프야펀(이하 "사이트")은 이용자의 개인정보를 중요시하며,
          「개인정보 보호법」 등 관련 법령을 준수하고 있습니다. 사이트는
          개인정보처리방침을 통해 이용자가 제공하는 개인정보가 어떠한
          목적과 방식으로 이용되고 있으며, 개인정보 보호를 위해 어떠한
          조치가 취해지고 있는지 알려드립니다.
        </p>
        <p className={styles.p}>본 방침은 {EFFECTIVE_DATE}부터 시행됩니다.</p>
      </div>

      {SECTIONS.map((section) => (
        <SectionBlock key={section.title} title={section.title}>
          <div className={styles.sectionBody}>{section.body}</div>
        </SectionBlock>
      ))}
    </div>
  );
};

export default PrivacyPolicyScreen;
