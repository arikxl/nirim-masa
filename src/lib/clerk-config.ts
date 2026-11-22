export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return false;
  if (key === "pk_test_YOUR_PUBLISHABLE_KEY_HERE") return false;
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}
