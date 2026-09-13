// global/ui/guideContent/GuideContent.jsx
// 가이드 콘텐츠 공용 렌더러 — /guides/:slug 전체 화면과 각 도메인 화면의 GuideModal이
// 이 컴포넌트 하나를 그대로 재사용한다(글감은 domains/guides/content/*.js 한 곳에만 존재).
// 순수 렌더 컴포넌트 — axios 호출·dispatch 없음, props로 받은 guide 객체만 그린다.
import { Link } from "react-router-dom";
import styles from "./GuideContent.module.scss";

const GuideBlock = ({ block }) => {
  switch (block.type) {
    case "p":
      return <p className={styles.paragraph}>{block.text}</p>;

    case "ul":
      return (
        <ul className={styles.list}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className={styles.orderedList}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "note":
      return <p className={styles.note}>{block.text}</p>;

    case "link":
      return block.internal ? (
        <Link to={block.href} className={styles.link}>
          {block.text} →
        </Link>
      ) : (
        <a href={block.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {block.text}
          <span aria-hidden="true"> ↗</span>
        </a>
      );

    default:
      return null;
  }
};

// headingLevel: 독립 페이지는 h1, 모달 안에서는 h3 정도로 낮춰 문서 구조를 지킨다.
const GuideContent = ({ guide, headingLevel = "h1" }) => {
  if (!guide) return null;
  const TitleTag = headingLevel;

  return (
    <article className={styles.article}>
      <TitleTag className={styles.title}>{guide.title}</TitleTag>
      {guide.intro && <p className={styles.intro}>{guide.intro}</p>}

      {guide.sections.map((section, i) => (
        <section key={i} className={styles.section}>
          <h2 className={styles.heading}>{section.heading}</h2>
          {section.body.map((block, j) => (
            <GuideBlock key={j} block={block} />
          ))}
        </section>
      ))}
    </article>
  );
};

export default GuideContent;
