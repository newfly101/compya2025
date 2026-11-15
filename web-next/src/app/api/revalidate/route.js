import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { API_INTERNAL_URL, SITE_URL } from "@/config/env.js";
import { REVALIDATE_TAGS } from "@/infra/http/revalidateTags.js";

// 쿠키를 읽는 비캐시 POST — 공유 캐시에 올라가지 않는다.
export const dynamic = "force-dynamic";

// 권한은 Spring 이 판정한다: 요청 쿠키를 그대로 실어 GET /users/me → data.userRole === "ADMIN" 일 때만 통과.
async function isAdmin(req) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return { status: 401 };
  try {
    const res = await fetch(`${API_INTERNAL_URL}/users/me`, { headers: { cookie }, cache: "no-store" });
    if (res.status === 401) return { status: 401 };
    if (!res.ok) return { status: 403 };
    return { status: (await res.json())?.data?.userRole === "ADMIN" ? 200 : 403 };
  } catch {
    return { status: 502 };
  }
}

// CSRF 차단: 브라우저 POST 는 항상 Origin 을 싣는다 → 운영 도메인이거나 요청이 들어온 호스트(로컬)와 같을 때만 허용.
function isSameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (origin === SITE_URL) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const { status } = await isAdmin(req);
  if (status !== 200) return NextResponse.json({ ok: false }, { status });

  const body = await req.json().catch(() => null);
  const tags = [...new Set((Array.isArray(body?.tags) ? body.tags : []).filter((t) => REVALIDATE_TAGS.includes(t)))];
  if (!tags.length) return NextResponse.json({ ok: false, message: "허용된 태그 없음" }, { status: 400 });

  tags.forEach((t) => revalidateTag(t, { expire: 0 }));
  return NextResponse.json({ ok: true, tags });
}
