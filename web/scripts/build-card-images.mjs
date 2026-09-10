// 선수 카드 실루엣 이미지 변환.
//
// 원본은 1024×1536 PNG 이고 파일명이 한글이다(타자_노말.png 등).
// 화면에서 쓰는 카드는 한 장이 약 76px 이라 그 해상도가 필요 없다.
// 영문 이름으로 바꾸고 화면 크기의 3배(228×342)로 줄여 webp 로 만든다.
//
//   node scripts/build-card-images.mjs [원본폴더] [--dry]
//
// 새 카드 그림이 생기면 아무 폴더에나 두고 그 경로를 넘기면 된다.
// 경로를 안 주면 public/cards/ 에서 한글 이름 PNG 를 찾는다.
//
// 만들어진 webp 만 public/cards/ 에 남긴다 — 원본 PNG 는 배포에 쓰이지 않으므로
// 저장소에 두지 않는다(원본은 작업자 PC 에 보관).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARDS = path.join(webRoot, "public", "cards");
// 원본 폴더 — 인자로 받고, 없으면 public/cards 자체를 뒤진다(한글 이름 PNG 를 찾는다).
const SRC = process.argv.find((a) => !a.startsWith("--") && a !== process.argv[0] && a !== process.argv[1])
  ? path.resolve(process.argv.find((a) => !a.startsWith("--") && a !== process.argv[0] && a !== process.argv[1]))
  : CARDS;

// 파일명 한글 → 영문. '투수_노말_re' 처럼 뒤에 붙은 꼬리표는 무시한다.
// DB(data_player_card.player_role)가 HITTER/PITCHER 라 그쪽 표기를 따른다.
const ROLE = { 타자: "hitter", 투수: "pitcher" };
const GRADE = {
  노말: "normal", 레어: "rare", 스페셜: "special", 히어로: "hero",
  플래티넘: "platinum", 시그니처: "signature", 레전드: "legend",
};

// 카드는 430px 폭에 5열이라 한 장이 약 76px. 3배까지 쳐서 228×342.
const WIDTH = 228;
const HEIGHT = 342;
const QUALITY = 82;

const dry = process.argv.includes("--dry");

function englishName(file) {
  const base = path.basename(file, path.extname(file));
  const [role, grade] = base.split("_");
  const r = ROLE[role];
  const g = GRADE[grade];
  return r && g ? `${r}_${g}` : null;
}

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

async function main() {
  const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith(".png"));
  const korean = files.filter((f) => englishName(f));

  if (korean.length === 0) {
    console.log("한글 이름 PNG 가 없다 — 이미 정리된 것으로 본다.");
  }

  let before = 0;
  let after = 0;

  for (const file of korean.sort()) {
    const name = englishName(file);
    const from = path.join(SRC, file);
    const webp = path.join(CARDS, `${name}.webp`);
    const size = fs.statSync(from).size;
    before += size;

    if (dry) {
      console.log(`  ${file} → ${name}.webp  (원본 ${kb(size)})`);
      continue;
    }

    await sharp(from)
      .resize(WIDTH, HEIGHT, { fit: "cover" })
      .webp({ quality: QUALITY })
      .toFile(webp);

    // 원본이 public/ 안에 있었다면 지운다 — 배포본에 30MB 가 딸려가면 안 된다.
    if (path.dirname(from) === CARDS) fs.unlinkSync(from);
    const out = fs.statSync(webp).size;
    after += out;
    console.log(`  ${name.padEnd(18)} ${kb(size).padStart(8)} → ${kb(out).padStart(7)}  webp`);
  }

  // 핸드오프에 딸려온 240×360 PNG 는 위 webp 로 대체된다.
  if (!dry) {
    for (const f of fs.readdirSync(CARDS)) {
      if (!f.endsWith(".png")) continue;
      const twin = path.join(CARDS, `${path.basename(f, ".png")}.webp`);
      if (fs.existsSync(twin)) {
        fs.unlinkSync(path.join(CARDS, f));
        console.log(`  (제거) ${f} — 같은 이름 webp 로 대체됨`);
      }
    }
  }

  if (!dry && before > 0) {
    console.log(`\n  합계 ${kb(before)} → ${kb(after)}  (${(100 - (after / before) * 100).toFixed(1)}% 감소)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
