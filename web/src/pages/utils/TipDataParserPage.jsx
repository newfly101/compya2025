import { useRef, useState } from "react";

const BASE_URL = "https://cafe.naver.com/com2usbaseball2015/";
const UPDATED_AT = "2025-12-29";

export default function TipDataParserPage() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState("");
  const nextIdRef = useRef(1);

  const parseData = (raw, startId) => {
    const lines = raw
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

    const posts = [];

    for (let i = 0; i < lines.length; i += 4) {
      if (i + 3 >= lines.length) break;

      const postId = lines[i];
      const rawTitle = lines[i + 1];
      const author = lines[i + 2];
      const rawDate = lines[i + 3];

      if (!/^\d+$/.test(postId)) continue;

      const title = rawTitle
        .replace(/댓글수\[\d+]/g, "")
        .trim();

      const writtenAt = rawDate
        .replace(/\./g, "-")
        .slice(0, 10);

      posts.push({
        rawId: Number(postId),
        title,
        author,
        writtenAt,
        updatedAt: UPDATED_AT,
        tags: [],
        url: `${BASE_URL}${postId}`
      });
    }

    // 작성일 기준 정렬 + id 누적 부여
    return posts
      .sort((a, b) => a.writtenAt.localeCompare(b.writtenAt))
      .map((post, idx) => ({
        id: startId + idx,
        title: post.title,
        author: post.author,
        writtenAt: post.writtenAt,
        updatedAt: post.updatedAt,
        tags: [],
        url: post.url
      }));
  };






  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <h1>카페 게시글 → JSON 변환기</h1>

      <textarea
        rows={20}
        placeholder="여기에 카페 게시글 목록 원문을 그대로 붙여넣으세요"
        value={raw}
        onChange={e => setRaw(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <button
        onClick={() => {
          const json = parseData(raw, nextIdRef.current);

          // 다음 시작 id 갱신
          nextIdRef.current += json.length;

          setResult(prev =>
            prev
              ? prev.replace(/\]\s*$/, ",\n" + JSON.stringify(json, null, 2).slice(1))
              : JSON.stringify(json, null, 2)
          );
        }}
      >
        JSON 변환
      </button>


      <textarea
        rows={20}
        readOnly
        value={result}
        style={{ width: "100%", marginTop: 16 }}
      />
    </main>
  );
}
