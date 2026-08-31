import { Link } from "react-router-dom";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./PrivacyPolicyScreen.module.scss";

// TODO: 운영자 확인 필요 — 아래 값이 확정되면 이 상수만 교체하면 된다.
const TODO_OPERATOR_NAME = "확인 필요";
const TODO_OPERATOR_EMAIL = "확인 필요";
const TODO_EFFECTIVE_DATE = "확인 필요";
const TODO_RETENTION_PERIOD = "확인 필요";

const Todo = ({ children }) => (
  <span className={styles.todoNote}>[TODO: {children}]</span>
);

// 개인정보처리방침 각 조 — 반복 구조라 데이터 배열로 관리한다.
const SECTIONS = [
  {
    title: "제1조 (수집하는 개인정보 항목)",
    body: (
      <>
        <p className={styles.p}>
          컴프야펀(이하 "사이트")은 네이버 아이디로 로그인 기능을 제공하며,
          로그인 과정에서 네이버로부터 아래 정보를 제공받습니다.
        </p>
        <ul className={styles.ul}>
          <li>네이버 프로필 닉네임</li>
          <li>네이버 계정 이메일 주소</li>
          <li>네이버 프로필 이미지 (제공 동의 시)</li>
        </ul>
        <p className={styles.p}>
          {/* TODO: 운영자 확인 필요 — 네이버 개발자 콘솔에 실제 등록된 제공 항목(scope)과 일치하는지 재확인 */}
          <Todo>네이버 로그인 연동 시 실제 요청 항목(scope)을 개발자 콘솔 설정 기준으로 재확인 필요</Todo>
        </p>
        <p className={styles.p}>
          이 외에 서비스 이용 과정에서 접속 IP, 쿠키, 방문 일시, 서비스 이용 기록,
          브라우저 및 기기 정보가 자동으로 생성되어 수집될 수 있습니다.
        </p>
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
          정보를 지체 없이 파기합니다. 회원 탈퇴 시에도 즉시 파기함을 원칙으로
          하되, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한
          기간 동안 보관합니다.
        </p>
        <p className={styles.p}>
          <Todo>회원 탈퇴 후 실제 보관 기간 — 현재 값: {TODO_RETENTION_PERIOD}</Todo>
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
          사이트는 이용자 맞춤 서비스 제공과 광고 게재를 위해 쿠키(Cookie)를
          사용합니다. 쿠키는 웹사이트가 이용자의 브라우저에 저장하는 소량의
          정보로, 이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나
          삭제할 수 있습니다. 다만 쿠키 저장을 거부할 경우 일부 서비스 이용에
          제한이 있을 수 있습니다.
        </p>
        <p className={styles.p}>
          Google 이 게재하는 광고의 맞춤 설정은{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.link}
          >
            Google 광고 설정 페이지
          </a>
          에서 직접 변경하거나 해제할 수 있습니다.
        </p>
      </>
    ),
  },
  {
    title: "제6조 (이용자 및 법정대리인의 권리와 행사 방법)",
    body: (
      <p className={styles.p}>
        이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를
        요구할 수 있습니다. 권리 행사는 아래{" "}
        <Link to={ROUTE_PATHS.contact} className={styles.link}>문의하기</Link>
        {" "}페이지를 통해 요청할 수 있으며, 사이트는 관계 법령이 정한 절차에
        따라 지체 없이 조치합니다.
      </p>
    ),
  },
  {
    title: "제7조 (개인정보의 안전성 확보 조치)",
    body: (
      <ul className={styles.ul}>
        <li>개인정보 접근 권한의 최소화 및 관리</li>
        <li>개인정보 처리 시스템 접속 기록의 보관</li>
        <li>비밀번호 등 중요 정보의 암호화 (해당 시)</li>
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
          <li>성명 / 직책: <Todo>운영자명 확인 필요 — 현재 값: {TODO_OPERATOR_NAME}</Todo></li>
          <li>이메일: <Todo>이메일 주소 확인 필요 — 현재 값: {TODO_OPERATOR_EMAIL}</Todo></li>
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
        <p className={styles.p}>
          <Todo>시행일 확인 필요 — 현재 값: {TODO_EFFECTIVE_DATE}</Todo>
        </p>
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
