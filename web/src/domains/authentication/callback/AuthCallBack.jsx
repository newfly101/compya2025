import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks";
import { trackLogin } from "@/infra/analytics/events/authEvents.js";
import { setUserProperties } from "@/infra/analytics/ga.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import styles from "./AuthCallBack.module.scss";

// BE 는 콜백 실패도 이 화면으로 리다이렉트하면서 오류 코드만 쿼리에 얹는다
// (AuthController.naverCallback → "?error=" + code.name()). 코드 이름을 그대로 보여줄 수는
// 없으므로 문구로 바꾼다 — 정지 계정만 따로 안내한다(다시 시도해도 계속 실패하는 유일한 경우).
const FAILURE_MESSAGE = {
  AUTH_USER_BLOCKED: "이용이 제한된 계정입니다. 고객센터로 문의해 주세요.",
  DEFAULT: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

const AuthCallback = () => {
  const dispatch = useDispatch();
  const [failure, setFailure] = useState(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    return code ? FAILURE_MESSAGE[code] ?? FAILURE_MESSAGE.DEFAULT : null;
  });

  useEffect(() => {
    // 실패 코드를 들고 왔으면 인증 쿠키가 아예 없다 — health check 는 401 하나를 더 만들 뿐이다.
    if (failure) return;

    dispatch(requestUserHealthCheck())
      .unwrap()
      .then((data) => {
        setUserProperties(data.userRole);
        trackLogin(data.userRole);
        // 리다이렉트는 성공했을 때만 한다 — finally 에 두면 실패도 게스트 상태로 조용히 넘어간다.
        // 같은 사이트 안 경로만 허용한다 ("//evil.com" 같은 열린 리다이렉트 차단)
        const saved = sessionStorage.getItem("redirectPath");
        const redirectPath = saved && saved.startsWith("/") && !saved.startsWith("//") ? saved : "/";
        sessionStorage.removeItem("redirectPath");
        window.location.replace(redirectPath);
      })
      // thunk 가 rejectWithValue(error.message) 라 payload 가 이미 한글 문구다(infra/http/client.js).
      // redirectPath 는 지우지 않는다 — 다시 로그인하면 원래 가려던 화면으로 이어진다.
      .catch((message) => {
        setFailure(typeof message === "string" && message ? message : FAILURE_MESSAGE.DEFAULT);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 완전 백지 화면 방지 — AdSense 반려 사유("콘텐츠 없는 화면에 광고") 대응.
  // 이 화면은 광고 슬롯을 배치하지 않으며(infra/ads 배치 금지 구역), noindex 처리됨(routeSeo.js).
  // 실패 안내는 공용 StateBox(role="alert") 를 쓴다. 재시도 동선은 글로벌 상단바의 로그인 버튼.
  return (
    <div className={styles.wrap}>
      {failure ? (
        <StateBox status="error" message={failure} />
      ) : (
        <>
          <div className={styles.spinner} role="status" aria-label="로그인 처리 중" />
          <p className={styles.text}>로그인 처리 중입니다…</p>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
