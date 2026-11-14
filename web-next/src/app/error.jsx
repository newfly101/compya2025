"use client";
import PageShell from "@/layout/PageShell.jsx";
import ErrorScreen from "@/domains/error/mobile/ErrorScreen.jsx";

export default function Error({ error }) {
  return (
    <PageShell>
      <ErrorScreen error={error} />
    </PageShell>
  );
}
