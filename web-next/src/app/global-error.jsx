"use client";

// 루트 layout 자체가 실패했을 때의 최후 화면 — layout 이 없으므로 <html><body> 와 인라인 스타일을 직접 쓴다.
export default function GlobalError({ reset }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "sans-serif", textAlign: "center", padding: "20vh 24px 0" }}>
        <div role="alert">
          <p style={{ fontSize: 20, fontWeight: 700 }}>문제가 생겼습니다</p>
          <p style={{ color: "#666" }}>
            페이지를 표시하는 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.
          </p>
          <button type="button" onClick={() => reset()} style={{ padding: "10px 20px", fontSize: 16 }}>
            새로고침
          </button>
        </div>
      </body>
    </html>
  );
}
