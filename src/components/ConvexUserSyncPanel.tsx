"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import type { UserRole } from "../../convex/schema";
import { ROLE_LABELS } from "@/lib/convex-config";
import { Check, Database, Loader2, UserCog } from "lucide-react";

export function ConvexUserSyncPanel() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    let cancelled = false;
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const name =
      user.fullName ||
      user.firstName ||
      email.split("@")[0] ||
      "משתמש מסע נירים";

    setIsSyncing(true);
    setSyncError(null);

    syncUser({
      clerkId: user.id,
      email,
      name,
      imageUrl: user.imageUrl,
    })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSyncError(
            err instanceof Error
              ? err.message
              : "שגיאה בסנכרון המשתמש מול Convex"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSyncing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    user,
    user?.id,
    user?.fullName,
    user?.firstName,
    user?.primaryEmailAddress?.emailAddress,
    user?.imageUrl,
    syncUser,
  ]);

  if (!isLoaded || !user) return null;

  const currentRole: UserRole = convexUser?.role ?? "student";
  const roleInfo = ROLE_LABELS[currentRole];

  return (
    <div className="w-full rounded-2xl bg-slate-50 border border-slate-200/90 p-4 flex flex-col gap-3 text-start">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Database className="w-4 h-4 text-brand-700 shrink-0" />
          <span>פרופיל משתמש ב-Convex</span>
        </div>

        {isSyncing || convexUser === undefined ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
            <span>מסנכרן...</span>
          </span>
        ) : convexUser ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-brand-700 font-medium bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
            <Check className="w-3 h-3" />
            <span>מסונכרן במסד הנתונים</span>
          </span>
        ) : null}
      </div>

      {syncError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5">
          {syncError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500">דרגת משתמש נוכחית:</span>
          <span className="text-xs text-slate-600 mt-0.5">
            {roleInfo.description}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.badgeClass}`}
        >
          <UserCog className="w-3.5 h-3.5" />
          <span>{roleInfo.label}</span>
        </span>
      </div>
    </div>
  );
}
