import { SITE_URL } from "@/lib/env.js";

export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
