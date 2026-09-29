import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEventDetail } from "@/domains/events/mobile/hooks/useEventDetail.js";
import EventBody from "@/domains/events/mobile/components/eventBody/EventBody.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { usePageSeo } from "@/infra/seo/usePageSeo.js";
import { pushEvent } from "@/infra/analytics/ga.js";
import { stripHtml } from "@/global/utils/html/htmlUtils.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { remainLabel } from "@/domains/events/mobile/eventDate.js";
import styles from "./EventDetailScreen.module.scss";

const EventDetailScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const { event, error, notFound, retry } = useEventDetail(id);

  const fullTitle = event?.title ? ROUTE_META.EVENT_DETAILS.title(event.title) : undefined;
  const description = event ? (stripHtml(event.contentHtml).slice(0, 120) || undefined) : undefined;

  usePageSeo({
    title: fullTitle,
    description,
    imageUrl: event?.imageUrl,
    canonicalPath: event ? ROUTE_PATHS.event_details(event.id) : undefined,
    ogType: event ? "article" : undefined,
  });

  // document.title 은 usePageSeo 가 맡는다. 여기선 GA page_view 만 보낸다(공지 상세와 동일).
  useEffect(() => {
    if (!fullTitle) return;
    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: fullTitle,
    });
  }, [fullTitle, location.pathname]);

  if (!event) {
    if (error) {
      return <div className={styles.screen}><StateBox status="error" message={error} onRetry={retry} /></div>;
    }
    if (notFound) {
      return (
        <div className={styles.screen}>
          <StateBox status="empty" message="종료되었거나 존재하지 않는 이벤트입니다." />
          <Link to={ROUTE_PATHS.events} className={styles.backLink}>이벤트 목록으로</Link>
        </div>
      );
    }
    // 첫 렌더(요청 dispatch 직전)도 로딩으로 취급한다.
    return <div className={styles.screen}><StateBox status="loading" /></div>;
  }

  const remain = remainLabel(event.expireAt);

  return (
    <div className={styles.screen}>
      {event.imageUrl && <img className={styles.banner} src={event.imageUrl} alt="" />}

      <div className={styles.metaHeader}>
        <h1 className={styles.title}>{event.title}</h1>
        <p className={styles.period}>
          {event.startAt?.slice(0, 16)} ~ {event.expireAt?.slice(0, 16)}
          {remain && <span className={styles.remain}>{remain}</span>}
        </p>
      </div>

      <div className={styles.content}>
        {event.contentHtml ? (
          <EventBody html={event.contentHtml} />
        ) : (
          <p className={styles.noBody}>이 이벤트의 본문은 원문에서 확인할 수 있습니다.</p>
        )}

        <p className={styles.source}>출처: 컴투스프로야구 공식 카페</p>
        {event.externalLink && (
          <a className={styles.origin} href={event.externalLink} target="_blank" rel="noopener noreferrer">
            {event.contentHtml ? "원문 보기" : "원문에서 확인"}
          </a>
        )}
      </div>

      <Link to={ROUTE_PATHS.events} className={styles.backLink}>이벤트 목록으로</Link>
    </div>
  );
};

export default EventDetailScreen;
