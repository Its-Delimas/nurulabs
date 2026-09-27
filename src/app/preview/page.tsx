import type { Metadata } from "next";
import AppShell from "@/components/dashboard/AppShell";
import PreviewPanel from "@/components/preview/PreviewPanel";

export const metadata: Metadata = { title: "Preview mode — Nurulabs", robots: { index: false } };

export default function PreviewPage() {
  return (
    <AppShell>
      <PreviewPanel />
    </AppShell>
  );
}
