import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";
import { redirect } from "next/navigation";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    redirect("/");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-sand-50">
      <SignIn />
    </main>
  );
}
