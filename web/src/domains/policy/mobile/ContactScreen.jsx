import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./ContactScreen.module.scss";

// TODO: 운영자 확인 필요 — 아래 값이 확정되면 이 상수만 교체하면 된다.
const TODO_OPERATOR_NAME = "확인 필요";
const TODO_GENERAL_EMAIL = "확인 필요";
const TODO_PARTNERSHIP_EMAIL = "확인 필요";
const TODO_COPYRIGHT_EMAIL = "확인 필요";
const TODO_RESPONSE_TIME = "확인 필요";

const Todo = ({ children }) => (
  <span className={styles.todoNote}>[TODO: {children}]</span>
);

const ContactScreen = () => {
  useDomainTopBar("문의하기");

  return (
    <div className={styles.screen}>
      <div className={styles.intro}>
        <p className={styles.p}>
          컴프야펀 이용 중 궁금한 점이나 불편사항이 있으시면 아래 안내에
          따라 문의해 주세요. 접수된 문의는 순차적으로 확인 후 답변드립니다.
        </p>
      </div>

      <SectionBlock title="일반 문의">
        <div className={styles.body}>
          <p className={styles.p}>
            서비스 이용 방법, 오류 제보, 기타 문의는 아래 이메일로 보내주세요.
          </p>
          <p className={styles.p}>
            이메일: <Todo>일반 문의 이메일 확인 필요 — 현재 값: {TODO_GENERAL_EMAIL}</Todo>
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="제휴 및 광고 문의">
        <div className={styles.body}>
          <p className={styles.p}>
            제휴, 광고 게재, 콘텐츠 협업 관련 문의는 아래 이메일로 보내주세요.
          </p>
          <p className={styles.p}>
            이메일: <Todo>제휴 문의 이메일 확인 필요 — 현재 값: {TODO_PARTNERSHIP_EMAIL}</Todo>
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="저작권 침해 신고 및 삭제 요청">
        <div className={styles.body}>
          <p className={styles.p}>
            사이트에 게시된 콘텐츠 중 본인의 저작권을 침해했다고 판단되는
            내용이 있다면, 아래 이메일로 침해 내용과 근거 자료를 함께
            보내주세요. 확인 후 신속히 조치하겠습니다.
          </p>
          <p className={styles.p}>
            이메일: <Todo>저작권 신고 이메일 확인 필요 — 현재 값: {TODO_COPYRIGHT_EMAIL}</Todo>
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="운영자 정보">
        <div className={styles.body}>
          <p className={styles.p}>
            운영자: <Todo>운영자명 확인 필요 — 현재 값: {TODO_OPERATOR_NAME}</Todo>
          </p>
          <p className={styles.p}>
            {/* TODO: 운영자 확인 필요 — 사업자 등록 여부에 따라 상호/사업자등록번호/소재지 표기 필요할 수 있음 */}
            <Todo>사업자 정보(사업자등록번호 등) 표기 필요 여부 확인 필요</Todo>
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="응답 소요 시간">
        <div className={styles.body}>
          <p className={styles.p}>
            문의 접수 후 <Todo>답변 소요 기간 확인 필요 — 현재 값: {TODO_RESPONSE_TIME}</Todo> 이내에
            답변드리는 것을 목표로 합니다. 문의량에 따라 답변이 지연될 수
            있는 점 양해 부탁드립니다.
          </p>
        </div>
      </SectionBlock>
    </div>
  );
};

export default ContactScreen;
