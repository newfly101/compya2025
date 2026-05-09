import React from "react";

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 1000,
};
const wrapper = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1001,
};
const container = {
  background: "#fff",
  borderRadius: 8,
  width: 480,
  maxWidth: "92vw",
  padding: 24,
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
};
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 };
const closeBtn = { background: "none", border: "none", fontSize: 24, cursor: "pointer", lineHeight: 1 };
const fieldRow = { display: "flex", flexDirection: "column", marginBottom: 12 };
const label = { fontSize: 13, fontWeight: 600, marginBottom: 4 };
const inputBase = { padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 4, fontSize: 14 };
const checkRow = { display: "flex", alignItems: "center", gap: 8, margin: "12px 0" };
const actions = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 };
const cancelBtn = { padding: "8px 16px", background: "#eee", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" };
const submitBtn = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };

const CouponModal = ({ title, submitLabel, form, onChange, onSubmit, onCancel }) => {
  return (
    <>
      <div style={overlay} onClick={onCancel} />
      <div style={wrapper}>
        <div style={container} onClick={(e) => e.stopPropagation()}>
          <div style={header}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
            <button type="button" style={closeBtn} onClick={onCancel}>×</button>
          </div>

          <form onSubmit={onSubmit}>
            <div style={fieldRow}>
              <span style={label}>쿠폰 코드</span>
              <input
                style={inputBase}
                name="couponCode"
                value={form.couponCode}
                onChange={onChange}
                required
              />
            </div>

            <div style={fieldRow}>
              <span style={label}>제목</span>
              <input
                style={inputBase}
                name="title"
                value={form.title}
                onChange={onChange}
                required
              />
            </div>

            <div style={fieldRow}>
              <span style={label}>상세 (줄바꿈으로 구분)</span>
              <textarea
                style={{ ...inputBase, minHeight: 80, resize: "vertical" }}
                name="detail"
                value={form.detail}
                onChange={onChange}
              />
            </div>

            <div style={fieldRow}>
              <span style={label}>만료 일시</span>
              <input
                style={inputBase}
                name="expireAt"
                type="datetime-local"
                value={form.expireAt}
                onChange={onChange}
                required
              />
            </div>

            <label style={checkRow}>
              <input
                type="checkbox"
                name="visible"
                checked={!!form.visible}
                onChange={onChange}
              />
              <span>노출</span>
            </label>

            <div style={actions}>
              <button type="button" style={cancelBtn} onClick={onCancel}>취소</button>
              <button type="submit" style={submitBtn}>{submitLabel}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CouponModal;
