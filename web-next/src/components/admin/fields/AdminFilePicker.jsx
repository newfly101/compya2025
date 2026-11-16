import styles from "./AdminFilePicker.module.scss";

// 파일 선택 박스(점선 테두리) + 파일명 표시 + "파일 선택" 버튼.
// 업로드 자체(비동기 요청)는 호출부 책임 — 이 컴포넌트는 선택 UI만 제공한다.
// fileName: 선택된 파일명 또는 URL 마지막 세그먼트 등 표시용 문자열.
const AdminFilePicker = ({ fileName, onFileSelect, accept = "image/*", disabled = false, placeholder = "선택된 파일 없음" }) => {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 허용
    if (file) onFileSelect?.(file);
  };

  return (
    <div className={styles.box}>
      <span className={styles.fileName}>{fileName || placeholder}</span>
      <label className={styles.button}>
        {disabled ? "업로드 중..." : "파일 선택"}
        <input
          type="file"
          className={styles.input}
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

export default AdminFilePicker;
