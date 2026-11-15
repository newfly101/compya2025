// next build 뒤 실행 — standalone 서버가 쓰는 public·static 을 옆에 복사한다.
import fs from "node:fs";

fs.cpSync("public", ".next/standalone/public", { recursive: true });
fs.cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
