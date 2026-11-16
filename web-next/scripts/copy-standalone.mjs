// next build 뒤 실행 — standalone 서버가 쓰는 public·static 을 옆에 복사한다.
import fs from "node:fs";

fs.cpSync("public", ".next/standalone/public", { recursive: true });
fs.cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
// standalone server.js 는 자기 폴더의 .env 만 읽는다 — 로컬 실행용. 운영은 systemd EnvironmentFile 이 넣는다.
if (fs.existsSync(".env.production.local")) fs.cpSync(".env.production.local", ".next/standalone/.env.production.local");
