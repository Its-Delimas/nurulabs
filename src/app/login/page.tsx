import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginPanel from "@/components/auth/LoginPanel";

export const metadata: Metadata = { title: "Sign in — Nurulabs", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginPanel />
      </Suspense>
    </AuthLayout>
  );
}
