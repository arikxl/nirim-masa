"use client";

import React, { useRef, useState } from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useSignIn,
  useUser,
} from "@clerk/nextjs";
import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  Database,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ConvexUserSyncPanel } from "@/components/ConvexUserSyncPanel";

function GoogleLogo() {
  return (
    <svg
      className="w-5 h-5 shrink-0 block"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

function LiveClerkAuthCard({ isConvexReady }: { isConvexReady: boolean }) {
  const { signIn, fetchStatus } = useSignIn();
  const { user } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isBusy = isRedirecting || fetchStatus === "fetching";

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    setAuthError(null);
    setIsRedirecting(true);
    try {
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectCallbackUrl: "/sso-callback",
      });
      if (error) {
        setIsRedirecting(false);
        setAuthError(
          error.longMessage ||
            error.message ||
            "אירעה שגיאה בהתחברות עם Google. ניתן להשתמש בחלונית ההתחברות המלאה."
        );
      }
    } catch (err: unknown) {
      setIsRedirecting(false);
      const message =
        err instanceof Error
          ? err.message
          : "אירעה שגיאה בהתחברות עם Google. ניתן להשתמש בחלונית ההתחברות המלאה.";
      setAuthError(message);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card-inner rounded-3xl bg-white/95 backdrop-blur-md border border-brand-800/15 shadow-xl shadow-brand-950/5">
        <Show when="signed-out">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                כניסה למסע נירים
              </h2>
              <p className="text-sm text-slate-600">
                התחברו במהירות ובאבטחה באמצעות חשבון Google שלכם דרך Clerk
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={!signIn || isBusy}
                className="google-auth-btn"
              >
                {isBusy ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-700" />
                ) : (
                  <GoogleLogo />
                )}
                <span>
                  {isBusy
                    ? "מעביר להתחברות עם Google..."
                    : "המשך באמצעות Google"}
                </span>
              </button>

              {authError && (
                <p
                  role="alert"
                  className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center"
                >
                  {authError}
                </p>
              )}

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs text-slate-400 shrink-0">
                  או אפשרויות כניסה נוספות
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <SignInButton mode="modal">
                <button type="button" className="primary-auth-btn">
                  <span>פתיחת חלון כניסה מלא (Clerk)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </SignInButton>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>עדיין אין לכם חשבון?</span>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-4 cursor-pointer"
                >
                  הרשמה מהירה
                </button>
              </SignUpButton>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>מאובטח באמצעות אימות Clerk ו-Google OAuth 2.0</span>
            </div>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex flex-col items-center text-center gap-5 py-2">
            <div className="flex items-center gap-3 p-2 pe-4 rounded-full bg-brand-50 border border-brand-200">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
              <div className="text-start">
                <p className="text-xs text-brand-700 font-medium">
                  מחובר/ת כעת
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {user?.fullName ||
                    user?.primaryEmailAddress?.emailAddress ||
                    "משתמש מסע נירים"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center justify-center gap-1.5 text-brand-700 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>התחברת בהצלחה!</span>
              </div>
              <p className="text-sm text-slate-600">
                ברוכים הבאים למערכת מסע נירים. החשבון שלך מאומת ומוכן להמשך.
              </p>
            </div>

            {isConvexReady ? (
              <ConvexUserSyncPanel />
            ) : (
              <div className="w-full rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 text-start">
                <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">
                    חיבור Convex מוכן להפעלה
                  </span>
                  <span className="text-amber-800/90 leading-relaxed">
                    הריצו בטרמינל{" "}
                    <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                      npx convex dev
                    </code>{" "}
                    כדי ליצור את מסד הנתונים ולשמור אוטומטית את המשתמש והדרגה
                    שלו (תלמיד / מורה / אדמין / משקיף).
                  </span>
                </div>
              </div>
            )}

            <a href="#features" className="primary-auth-btn no-underline">
              <span>כניסה לאזור האישי</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </Show>
      </div>
    </div>
  );
}

function SetupPreviewAuthCard() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openSetupModal = () => {
    dialogRef.current?.showModal();
  };

  const closeSetupModal = () => {
    dialogRef.current?.close();
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card-inner rounded-3xl bg-white/95 backdrop-blur-md border border-brand-800/15 shadow-xl shadow-brand-950/5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              כניסה למסע נירים
            </h2>
            <p className="text-sm text-slate-600">
              התחברו במהירות ובאבטחה באמצעות חשבון Google שלכם דרך Clerk
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={openSetupModal}
              className="google-auth-btn"
            >
              <GoogleLogo />
              <span>המשך באמצעות Google</span>
            </button>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 shrink-0">
                או אפשרויות כניסה נוספות
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            <button
              type="button"
              onClick={openSetupModal}
              className="primary-auth-btn"
            >
              <span>פתיחת חלון כניסה מלא (Clerk)</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                מצב תצוגה מקדימה (ממתין למפתח Clerk)
              </span>
              <span className="text-amber-800/90 leading-relaxed">
                הזינו את ה-Publishable Key שלכם בקובץ{" "}
                <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                  .env.local
                </code>{" "}
                כדי להפעיל את ההתחברות החיה עם Google.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>מאובטח באמצעות אימות Clerk ו-Google OAuth 2.0</span>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeSetupModal();
        }}
        className="rounded-3xl p-0 max-w-md w-[calc(100%-2rem)] bg-white text-slate-900 shadow-2xl border border-slate-200 backdrop:bg-slate-950/50 backdrop:backdrop-blur-xs"
      >
        <div className="p-6 flex flex-col gap-4 text-start" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                חיבור מפתח ה-Clerk שלכם
              </h3>
              <p className="text-xs text-slate-500">
                3 שלבים קצרים להפעלת כניסת Google
              </p>
            </div>
          </div>

          <ol className="text-sm text-slate-700 space-y-3 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <li>
              היכנסו ללוח הבקרה של{" "}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand-700 underline"
              >
                Clerk Dashboard
              </a>{" "}
              והפעילו את ספק הכניסה <strong>Google</strong> תחת{" "}
              <em>SSO Connections</em>.
            </li>
            <li>
              העתיקו את המפתחות מעמוד <strong>API Keys</strong> והדביקו אותם
              בקובץ <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">.env.local</code>:
              <pre
                dir="ltr"
                className="mt-2 p-2.5 rounded-xl bg-slate-900 text-slate-100 text-xs overflow-x-auto"
              >
                {`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
              </pre>
            </li>
            <li>
              הפעילו מחדש את שרת הפיתוח (<code className="font-mono text-xs">npm run dev</code>) והכפתור יחבר אתכם ישירות עם Google!
            </li>
          </ol>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={closeSetupModal}
              className="px-5 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 cursor-pointer"
            >
              הבנתי, תודה
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export function ClerkAuthSection({
  isConfigured,
  isConvexReady = false,
}: {
  isConfigured: boolean;
  isConvexReady?: boolean;
}) {
  if (!isConfigured) {
    return <SetupPreviewAuthCard />;
  }
  return <LiveClerkAuthCard isConvexReady={isConvexReady} />;
}
