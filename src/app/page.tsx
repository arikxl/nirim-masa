import React from "react";
import { isClerkConfigured } from "@/lib/clerk-config";
import { isConvexConfigured } from "@/lib/convex-config";
import { Navbar } from "@/components/Navbar";
import { ClerkAuthSection } from "@/components/ClerkAuthSection";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { TripsAndRostersSection } from "@/components/TripsAndRostersSection";
import {
  Calendar,
  Compass,
  HeartHandshake,
  MapPin,
  Mountain,
  Users,
} from "lucide-react";

const highlights = [
  {
    icon: MapPin,
    title: "מסלולים ותחנות בשטח",
    description:
      "צפייה בתוכנית המסע, מפות אינטראקטיביות, נקודות ציון ולוחות זמנים מעודכנים לכל יום.",
    tag: "ניווט ושטח",
  },
  {
    icon: Users,
    title: "הקבוצה והצוות שלך",
    description:
      "חיבור ישיר לחברי הקבוצה, למדריכים ולאנשי הצוות המלווים את המסע לאורך כל הדרך.",
    tag: "קהילה",
  },
  {
    icon: Calendar,
    title: "הכנה, ציוד ועדכונים",
    description:
      "רשימות ציוד מותאמות, טפסים דיגיטליים, הדרכות בטיחות והודעות בזמן אמת.",
    tag: "לוגיסטיקה",
  },
];

export default function HomePage() {
  const configured = isClerkConfigured();
  const convexReady = isConvexConfigured();

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-sand-50 via-white to-brand-50/40">
      <Navbar isConfigured={configured} />

      <main className="flex-1 flex flex-col justify-between">
        {/* Hero & Welcome Auth Section */}
        <section
          id="about"
          className="relative overflow-clip py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
          {/* Decorative background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 start-1/4 w-96 h-96 rounded-full bg-brand-200/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 end-10 w-80 h-80 rounded-full bg-sand-300/40 blur-3xl"
          />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Content (Right side in RTL) */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-start">
              <div className="badge-list">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-100/80 text-brand-900 text-xs font-semibold border border-brand-200">
                  <Mountain className="w-3.5 h-3.5 text-brand-700" />
                  <span>פורטל מסע נירים החדש</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sand-200/70 text-slate-800 text-xs font-medium border border-sand-300">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
                  <span>מותאם לנייד, טאבלט ומחשב</span>
                </span>
              </div>

              <h1 className="hero-title font-extrabold text-slate-900">
                יוצאים לדרך משותפת ב
                <span className="text-brand-700 underline decoration-brand-300/70 decoration-wavy decoration-2 underline-offset-8">
                  מסע נירים
                </span>
              </h1>

              <p className="hero-subtitle text-slate-600 max-w-2xl">
                ברוכים הבאים לבית הדיגיטלי של מסע נירים. כאן תמצאו את כל המידע
                לקראת המסע ובמהלכו – מסלולים, הכנות, עדכוני צוות וחיבור לקהילה.
                התחברו באמצעות חשבון Google שלכם כדי להיכנס לאזור האישי.
              </p>

              {/* Visual Stats / Pillars */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-lg pt-2">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-700">
                    100%
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    רספונסיבי לשטח
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-700">
                    Google
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    כניסה מהירה ב-Clerk
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-700">
                    24/7
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    זמינות ועדכונים
                  </p>
                </div>
              </div>
            </div>

            {/* Authentication Card (Left side in RTL) */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
              <ClerkAuthSection
                isConfigured={configured}
                isConvexReady={convexReady}
              />
            </div>
          </div>
        </section>

        {/* Admin-only Users Table (visible only when signed-in user has role === "admin") */}
        <AdminUsersTable
          isConfigured={configured}
          isConvexReady={convexReady}
        />

        {/* Trips Table, Student Trips List & Teacher Students List */}
        <TripsAndRostersSection
          isConfigured={configured}
          isConvexReady={convexReady}
        />

        {/* Responsive Subgrid Features Section */}
        <section
          id="features"
          className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white/60 border-t border-slate-200/70"
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-2 text-start max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                כל מה שמחכה לכם לאחר ההתחברות
              </h2>
              <p className="text-sm text-slate-600">
                ממשק מותאם אישית לחניכים, מדריכים ובוגרי המסע מכל מכשיר.
              </p>
            </div>

            <div className="features-grid">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="feature-card">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sand-100 text-slate-700 border border-sand-200">
                        {item.tag}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-brand-700">
                      <Compass className="w-3.5 h-3.5" />
                      <span>זמין מיד לאחר כניסה</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="border-t border-slate-200/80 bg-sand-50 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-700">
            © {new Date().getFullYear()} מסע נירים – כל הזכויות שמורות.
          </p>
          <p>נבנה באמצעות Next.js, Tailwind CSS ואימות Clerk Google OAuth</p>
        </div>
      </footer>
    </div>
  );
}
