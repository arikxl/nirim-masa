"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import type { UserRole } from "../../convex/schema";
import { ROLE_LABELS } from "@/lib/convex-config";
import { Check, Database, Loader2, UserCog } from "lucide-react";

const ALL_ROLES: UserRole[] = ["student", "teacher", "admin", "observer"];

export function ConvexUserSyncPanel() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
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

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user || newRole === currentRole) return;
    setIsUpdatingRole(true);
    try {
      await updateUserRole({
        clerkId: user.id,
        role: newRole,
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

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

      {/* בורר דרגות לעדכון מהיר ב-Convex */}
      <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-2">
        <span className="text-[11px] font-medium text-slate-500">
          שינוי דרגה ב-Convex (תלמיד / מורה / אדמין / משקיף):
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_ROLES.map((roleKey) => {
            const active = currentRole === roleKey;
            return (
              <button
                key={roleKey}
                type="button"
                disabled={isUpdatingRole || !convexUser}
                onClick={() => handleRoleChange(roleKey)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? "bg-brand-700 text-white border-brand-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/40"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {ROLE_LABELS[roleKey].label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
