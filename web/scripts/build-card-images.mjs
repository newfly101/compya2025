// 선수 카드 실루엣 이미지 변환.
//
// 원본은 1024×1536 PNG 14장(약 30MB)이고 파일명이 한글이었다.
// 화면에서 쓰는 크기는 카드 한 장이 약 76px 이라 그대로 내보낼 이유가 없다.
// 영문 이름으로 바꾸고, 화면 크기의 3배(228×342)로 줄여 webp 로 만든다.
//
//   node scripts/build-card-images.mjs [--dry]
//
// 원본 PNG 는 지우지 않는다 — 다른 크기가 필요해지면 다시 뽑아야 한다.
// 다만 public/ 에 두면 배포본에 30MB 가 딸려가므로 assets/cards-src/ 로 옮긴다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARDS = path.join(webRoot, "public", "cards");
const SRC = path.join(webRoot, "assets", "cards-src");

// 파일명 한글 → 영문. '투수_노말_re' 처럼 뒤에 붙은 꼬리표는 무시한다.
const ROLE = { 타자: "batter", 투수: "pitcher" };
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
  const files = fs.readdirSync(CARDS).filter((f) => f.toLowerCase().endsWith(".png"));
  const korean = files.filter((f) => englishName(f));

  if (korean.length === 0) {
    console.log("한글 이름 PNG 가 없다 — 이미 정리된 것으로 본다.");
  }

  if (!dry) fs.mkdirSync(SRC, { recursive: true });

  let before = 0;
  let after = 0;

  for (const file of korean.sort()) {
    const name = englishName(file);
    const from = path.join(CARDS, file);
    const webp = path.join(CARDS, `${name}.webp`);
    const keep = path.join(SRC, `${name}.png`);
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

    fs.renameSync(from, keep);          // 원본은 배포 대상 밖으로
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
    console.log(`  원본 PNG 는 ${path.relative(webRoot, SRC)} 로 옮겼다 (배포 제외)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
