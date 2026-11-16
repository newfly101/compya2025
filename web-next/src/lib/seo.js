// 페이지 metadata: export const metadata = buildMetadata({ title: "쿠폰 모아보기", description, path: "/coupons" });
// 동적 페이지는 generateMetadata 에서 buildMetadata({ title, description, path, images: [url], type: "article" }) — og·twitter 는 Next 가 깊은 병합을 안 하므로 반드시 이 헬퍼로.
// title 은 짧게("쿠폰") 쓴다 — 탭 제목은 layout template("컴프야펀 | %s"), og:title 은 같은 문자열로 맞춘다. 홈처럼 접두 없이 쓰려면 absolute: true.
import { SITE_URL } from "@/lib/env.js";

export const SITE_NAME = "컴프야펀";
const SUFFIX = `${SITE_NAME} | `;
export const DEFAULT_OG_IMAGE = {
  url: "/compyafun2026.jpg",
  secureUrl: `${SITE_URL}/compyafun2026.jpg`,
  type: "image/jpeg",
  width: 1080,
  height: 300,
  alt: "컴프야펀 - 컴투스 프로야구 정보 허브",
};

export function buildMetadata({ title, description, path, images, type = "website", absolute = false }) {
  const full = absolute ? title : `${SUFFIX}${title}`;
  const ogImages = images?.length ? images : [DEFAULT_OG_IMAGE];
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: SITE_NAME, locale: "ko_KR", url: path, title: full, description, images: ogImages },
    twitter: { card: "summary_large_image", title: full, description, images: ogImages.map((i) => i.url ?? i) },
  };
}
