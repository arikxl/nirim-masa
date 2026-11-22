import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";
import { redirect } from "next/navigation";

export default function SSOCallbackPage() {
  if (!isClerkConfigured()) {
    redirect("/");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
