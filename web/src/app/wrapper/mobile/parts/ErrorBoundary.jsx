// src/app/wrapper/mobile/parts/ErrorBoundary.jsx
// 라우트 콘텐츠 렌더 중 예외를 잡는 전역 바운더리.
// React 19는 클래스 컴포넌트로만 만들 수 있다(훅으로 대체 불가).
// MobileLayout 의 Outlet(본문) 영역만 감싼다 — 상단바/서랍/Footer 는 이 바깥에 있어
// 예외가 나도 화면이 완전 백지가 되지 않고 새로고침 버튼까지 도달할 수 있다.
import React from "react";
import styles from "./ErrorBoundary.module.scss";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // 운영에서 원인 추적 가능하도록 콘솔에 남긴다
    console.error("[ErrorBoundary] 렌더 중 예외 발생", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap} role="alert">
          <p className={styles.title}>문제가 생겼습니다</p>
          <p className={styles.desc}>
            페이지를 표시하는 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.
          </p>
          <button type="button" className={styles.reloadBtn} onClick={this.handleReload}>
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
