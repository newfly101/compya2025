import React from "react";
import styles from "./AdminPlayerDrawer.module.scss";
import MetaSection from "@/domains/playerCard/feature/admin/components/drawer/DrawerMetaSection.jsx";
import AttributeSection from "@/domains/playerCard/feature/admin/components/drawer/DrawerAttributeSection.jsx";

const AdminPlayerDrawer = ({
                             formState,
                             formActions,
                           }) => {
  const {form:cardForm,
    isClosing,
    mode,
    confirmCloseOpen
  } = formState;
  const {
    handleChange,
    handleSubmit,
    requestClose,
    confirmClose,
    cancelClose
  } = formActions;

  return (
    <div
      className={styles.adminPlayerDrawerWrapper}
    >
      <div
        className={styles.adminPlayerDrawerOverlay}
        onClick={requestClose}
      />

      <div
        className={`${styles.adminPlayerDrawerContainer} ${
          isClosing ? styles.slideOut : styles.slideIn
        }`}
        onClick={(e) => e.stopPropagation()}
        >
        <div className={styles.adminPlayerDrawerHeaderSection}>
          <h2>
            {mode === "CREATE" ? "선수 등록" : "선수 수정"}
          </h2>
          <button
            type="button"
            className={styles.adminPlayerDrawerCloseButton}
            onClick={requestClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.adminPlayerDrawerBodySection}>
          <MetaSection
            formState={formState}
            formActions={formActions}
          />
          <AttributeSection
            formState={formState}
            formActions={formActions}
            form={cardForm}
            onChange={handleChange}
          />
        </div>

        <div className={styles.adminPlayerDrawerFooterSection}>
          <button type="button" onClick={requestClose}>
            취소
          </button>
          <button type="button" onClick={handleSubmit}>
            저장
          </button>
        </div>
      </div>

      {confirmCloseOpen && (
        <div className={styles.drawerConfirmWrapper}>

          <div className={styles.drawerConfirmContainer}>
            <p>등록/수정을 종료하시겠습니까?</p>

            <div className={styles.drawerConfirmActions}>
              <button type="button" onClick={cancelClose}>
                취소
              </button>
              <button type="button" onClick={confirmClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayerDrawer;
