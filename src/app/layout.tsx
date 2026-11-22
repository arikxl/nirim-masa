import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { heIL } from "@clerk/localizations";
import { isClerkConfigured } from "@/lib/clerk-config";
import { isConvexConfigured } from "@/lib/convex-config";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מסע נירים | פורטל המשתתפים והצוות",
  description:
    "ברוכים הבאים לאתר מסע נירים",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkReady = isClerkConfigured();
  const convexReady = isConvexConfigured();
  const convexUrl = convexReady
    ? process.env.NEXT_PUBLIC_CONVEX_URL
    : undefined;

  const content = (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans antialiased selection:bg-brand-200 selection:text-brand-950">
        <ConvexClientProvider convexUrl={convexUrl} isClerkReady={clerkReady}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );

  if (!clerkReady) {
    return content;
  }

  return <ClerkProvider localization={heIL}>{content}</ClerkProvider>;
}
