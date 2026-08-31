import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./ContactScreen.module.scss";

const OPERATOR_NAME = "김재홍";
const CONTACT_EMAIL = "newfly101@naver.com";
const OPEN_CHAT_URL = "https://open.kakao.com/o/sw9YuV8h";

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

      <SectionBlock title="카카오톡 오픈채팅 (일반 문의)">
        <div className={styles.body}>
          <p className={styles.p}>
            서비스 이용 방법, 오류 제보, 제휴·광고, 저작권 관련 문의 등
            일반적인 문의는 카카오톡 오픈채팅방으로 편하게 남겨주세요.
          </p>
          <a
            href={OPEN_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chatButton}
          >
            카카오톡 오픈채팅방 바로가기
          </a>
          <p className={styles.p}>
            평균 3일 이내 답변을 목표로 합니다. 문의량에 따라 답변이
            지연될 수 있는 점 양해 부탁드립니다.
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="개인정보 관련 요청 (이메일)">
        <div className={styles.body}>
          <p className={styles.p}>
            개인정보 열람·정정·삭제·처리정지 요구, 회원 탈퇴 등 개인정보와
            관련된 요청은 여러 사람이 함께 있는 오픈채팅방이 아닌 아래
            이메일로 접수해 주세요.
          </p>
          <p className={styles.p}>
            이메일: <a href={`mailto:${CONTACT_EMAIL}`} className={styles.link}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </SectionBlock>

      <SectionBlock title="운영자 정보">
        <div className={styles.body}>
          <p className={styles.p}>운영자: {OPERATOR_NAME}</p>
        </div>
      </SectionBlock>
    </div>
  );
};

export default ContactScreen;
