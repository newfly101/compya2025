"use client";
import PageShell from "@/components/layout/PageShell.jsx";
import ErrorScreen from "@/features/error/ErrorScreen.jsx";

export default function Error({ error }) {
  return (
    <PageShell>
      <ErrorScreen error={error} />
    </PageShell>
  );
}
