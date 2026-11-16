"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// 브라우저에서만 children 을 그린다(서버 렌더·하이드레이션 첫 패스는 fallback) — window/localStorage 를
// 렌더 중에 읽는 화면을 감싼다. next/dynamic({ ssr: false }) 와 같은 효과를 서버 컴포넌트 page 에서도 쓸 수 있다.
const ClientOnly = ({ children, fallback = null }) =>
  useSyncExternalStore(subscribe, () => true, () => false) ? children : fallback;

export default ClientOnly;
