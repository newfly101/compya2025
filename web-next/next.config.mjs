import path from "node:path";
import { fileURLToPath } from "node:url";

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), "src");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // 기존 web 의 vite additionalData 와 동일 — 모든 *.module.scss 에 토큰·믹스인 자동 주입
  sassOptions: {
    loadPaths: [src],
    additionalData: `@use "styles/index.scss" as *;`,
  },
};

export default nextConfig;
