import React from "react";
import styles from "./legal.module.scss";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";

const PrivacyPolicy = () => {
  const { moveHome } = useContentPageHeader();

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"개인정보처리방침"}
                                 meta={["시행일자 2026-01-01"]}
                                 backLabel={"메인으로"}
                                 onBack={moveHome}
      />}
      children={<>
        <section className={styles.summary}>
          <h2>수집 항목</h2>
          <ul>
            <li>
              서비스 이용 과정에서 자동 수집되는 정보
              <br />
              (IP 주소(익명 처리), 브라우저 정보, 접속 기기 정보, 방문 일시,
              페이지 방문 기록, 클릭 이벤트 정보)
            </li>
            <li>
              쿠키 및 유사 기술을 통한 이용 통계 정보 (Google Analytics)
            </li>
          </ul>

          <h2>이용 목적</h2>
          <ul>
            <li>서비스 이용 통계 분석</li>
            <li>페이지 방문 및 콘텐츠 이용 현황 파악</li>
            <li>쿠폰 클릭 등 사용자 행동 분석</li>
            <li>서비스 품질 개선</li>
          </ul>

          <h2>보관·제3자 제공</h2>
          <ul>
            <li>수집된 정보는 통계 분석 목적 범위 내에서만 이용됩니다.</li>
            <li>
              Google Analytics(Google LLC)에 웹사이트 이용 통계 분석을 위탁합니다.
            </li>
            <li>법령에 따른 경우를 제외하고 제3자에게 판매·공유하지 않습니다.</li>
          </ul>

          <h2>쿠키 사용</h2>
          <ul>
            <li>본 사이트는 서비스 개선 및 이용 통계 분석을 위해 쿠키를 사용합니다.</li>
            <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>

          <h2>이용자 권리</h2>
          <ul>
            <li>이용자는 언제든지 쿠키 저장을 거부할 수 있습니다.</li>
            <li>
              Google Analytics 수집 거부 도구를 통해 통계 수집을 차단할 수 있습니다.
              <br />
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://tools.google.com/dlpage/gaoptout
              </a>
            </li>
          </ul>

          <h2>국외 이전</h2>
          <p>
            Google Analytics 사용으로 인해 일부 정보가 해외 서버(미국 등)로 이전될
            수 있습니다.
          </p>

          <h2>동의 안내</h2>
          <p>
            이용자는 본 사이트를 이용함으로써 본 개인정보처리방침에 동의한 것으로
            간주됩니다.
          </p>
        </section>

        {/* 푸터 */}
        <footer className={styles.footer}>
          <p>
            컴프야펀(compyafun.com)은 서비스 제공을 위해 필요한 최소한의 정보만을 수집합니다.
          </p>
          <p>
            본 개인정보처리방침은 관련 법령 또는 서비스 변경에 따라
            수정될 수 있으며, 변경 시 사이트를 통해 안내합니다.
          </p>
        </footer>
      </>}
    />);
};

export default PrivacyPolicy;
