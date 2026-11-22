export function isConvexConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return false;
  if (url === "https://YOUR_CONVEX_DEPLOYMENT.convex.cloud") return false;
  return url.startsWith("https://") || url.startsWith("http://");
}

export const ROLE_LABELS: Record<
  "student" | "teacher" | "admin" | "observer",
  { label: string; description: string; badgeClass: string }
> = {
  student: {
    label: "תלמיד",
    description: "משתתף במסע נירים",
    badgeClass: "bg-brand-100 text-brand-800 border-brand-200",
  },
  teacher: {
    label: "מורה",
    description: "מלווה ואיש צוות חינוכי",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  admin: {
    label: "אדמין",
    description: "מנהל מערכת מסע נירים",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  observer: {
    label: "משקיף",
    description: "הרשאת צפייה ומעקב",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
};
