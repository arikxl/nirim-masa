"use client";

import React, { ReactNode, useMemo } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

function useSafeClerkAuth() {
  const auth = useAuth();
  return useMemo(
    () => ({
      ...auth,
      getToken: async (options?: { template?: string; skipCache?: boolean }) => {
        try {
          return await auth.getToken(options);
        } catch {
          try {
            return await auth.getToken({ skipCache: options?.skipCache });
          } catch {
            return null;
          }
        }
      },
    }),
    [auth]
  );
}

export function ConvexClientProvider({
  children,
  convexUrl,
  isClerkReady,
}: {
  children: ReactNode;
  convexUrl?: string;
  isClerkReady: boolean;
}) {
  const client = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!client) {
    return <>{children}</>;
  }

  if (!isClerkReady) {
    return <ConvexProvider client={client}>{children}</ConvexProvider>;
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useSafeClerkAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
