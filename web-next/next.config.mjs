import path from "node:path";
import { fileURLToPath } from "node:url";

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), "src");

// CSP 는 Report-Only — 차단하지 않고 콘솔 보고만. 위반이 없음을 확인한 뒤 차단 모드로 승격한다.
const API_ORIGIN = new URL(process.env.NEXT_PUBLIC_API_URL ?? "https://api.compyafun.com/api").origin;
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.adtrafficquality.google https://www.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:", // 이벤트·공지 이미지는 외부 도메인(카페 등) 임의
  "font-src 'self' data:",
  `connect-src 'self' ${API_ORIGIN} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googlesyndication.com https://*.adtrafficquality.google`,
  "frame-src https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.google.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // 기존 web 의 vite additionalData 와 동일 — 모든 *.module.scss 에 토큰·믹스인 자동 주입
  sassOptions: {
    loadPaths: [src],
    additionalData: `@use "styles/index.scss" as *;`,
  },
};

export default nextConfig;
