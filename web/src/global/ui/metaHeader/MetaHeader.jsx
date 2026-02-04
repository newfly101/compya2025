import React from "react";
import { usePageMeta } from "@/meta/hooks/usePageMeta.js";
import ContentPageHeader from "@/global/ui/contentPageHeader/ContentPageHeader";

const MetaHeader = ({
                      title,
                      meta,
                      backLabel,
                      onBack,
                    }) => {
  const pageMeta = usePageMeta();

  const resolvedTitle = pageMeta
    ? `📖 ${pageMeta.title}`
    : title;

  const resolvedMeta = pageMeta
    ? [pageMeta.lastUpdated, `v${pageMeta.version}`]
    : meta;

  return (
    <ContentPageHeader
      title={resolvedTitle}
      meta={resolvedMeta}
      backLabel={backLabel}
      onBack={onBack}
    />
  );
};

export default MetaHeader;
