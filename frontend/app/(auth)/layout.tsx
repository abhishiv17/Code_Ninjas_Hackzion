import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OmniSolve — Sign In",
  description: "AI-powered Smart Highway Command Center — Login",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
