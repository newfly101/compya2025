import React from "react";
import styles from "./PostModal.module.scss";
import { useSelector } from "react-redux";

const PostModal = ({
                     title,
                     submitLabel,
                     form,
                     onChange,
                     onSubmit,
                     onSubmitContinue=null,
                     onCancel,
                   }) => {
  const { boardLists } = useSelector(state => state.community);
  const { user, role } = useSelector(state => state.auth);

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onCancel}>✕</button>
        </div>

        {/* Form */}
        <div className={styles.form}>
          {/* Board */}
          <label>
            게시판
            {/*게시판 ID*/}
            {/*<input*/}
            {/*  name="boardId"*/}
            {/*  value={form.boardId}*/}
            {/*  onChange={onChange}*/}
            {/*  placeholder="게시판 ID"*/}
            {/*/>*/}
            <select
              name="boardId"
              value={form.boardId}
              onChange={onChange}
            >
              <option value="">게시판 선택</option>
              {boardLists?.map(board => (
                <option key={board.id} value={board.id}>
                  {board.code}
                </option>
              ))}
            </select>
          </label>

          {/* Author */}
          {role.role === "ADMIN" &&
          <div className={styles.row}>
            <label>
              작성자 유형
              <select
                name="authorType"
                value={form.authorType}
                onChange={onChange}
                disabled
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </label>

            <label>
              작성자명
              <input
                name="authorName"
                value={form.authorName}
                onChange={onChange}
                placeholder="작성자 이름"
                disabled
              />
            </label>
          </div>
          }

          {/* Title */}
          <label>
            제목
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="게시글 제목"
            />
          </label>

          {/* Content */}
          {form.linkType === "INTERNAL" && (
          <label>
            내용
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              placeholder="게시글 내용"
              rows={6}
            />
          </label>
          )}

          {/* Link */}
          <div className={styles.row}>
            <label>
              링크 타입
              <select
                name="linkType"
                value={form.linkType}
                onChange={onChange}
              >
                <option value="INTERNAL">INTERNAL</option>
                <option value="EXTERNAL">EXTERNAL</option>
              </select>
            </label>

            {form.linkType === "EXTERNAL" && (
              <label>
                외부 링크 URL
                <input
                  name="externalUrl"
                  value={form.externalUrl}
                  onChange={onChange}
                  placeholder="https://example.com"
                />
              </label>
            )}
          </div>

          {/* Flags */}
          <div className={styles.row}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="pinned"
                checked={form.pinned}
                onChange={onChange}
              />
              고정글
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="visible"
                checked={form.visible}
                onChange={onChange}
              />
              노출 여부
            </label>
          </div>

          {/* View count (readonly) */}
          {"viewCount" in form && (
            <label>
              조회수
              <input type="number" value={form.viewCount} readOnly />
            </label>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>
            취소
          </button>
          <button className={styles.primary} onClick={onSubmit}>
            {submitLabel}
          </button>
          {onSubmitContinue &&
          <button className={styles.primary} onClick={onSubmitContinue}>
            {submitLabel} 후 계속
          </button>
          }
        </div>
      </div>
    </div>
  );
};

export default PostModal;
