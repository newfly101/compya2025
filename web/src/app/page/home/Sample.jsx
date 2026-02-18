import React, { useState } from "react";
import { API } from "@/app/store/APIConfig.js";

const Sample = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("파일 선택");

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await API.post("/upload/images",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("result url : ",res.data);
      setUrl(res.data);
    } catch (e) {
      alert("업로드 실패");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>이미지 업로드 테스트</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "업로드 중..." : "업로드"}
      </button>

      {url && (
        <div style={{ marginTop: 20 }}>
          <p>업로드 URL</p>
          <a href={url} target="_blank">{url}</a>
          <br /><br />
          <img src={url} alt="preview" style={{ maxWidth: 300 }} />
        </div>
      )}
    </div>
  );
};

export default Sample;
