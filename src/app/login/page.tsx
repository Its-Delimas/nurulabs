import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell from "@/components/dashboard/AppShell";
import LoginPanel from "@/components/auth/LoginPanel";

export const metadata: Metadata = { title: "Sign in — Nurulabs", robots: { index: false } };

export default function LoginPage() {
  return (
    <AppShell>
      <Suspense>
        <LoginPanel />
      </Suspense>
    </AppShell>
  );
}
