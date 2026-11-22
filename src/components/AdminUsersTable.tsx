"use client";

import React, { useState } from "react";
import { Show, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { UserRole } from "../../convex/schema";
import { ROLE_LABELS } from "@/lib/convex-config";
import { Shield, Users } from "lucide-react";

const ALL_ROLES: UserRole[] = ["student", "teacher", "admin", "observer"];

function AdminUsersTableContent() {
  const { user, isLoaded } = useUser();
  const updateUserRole = useMutation(api.users.updateUserRole);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    isLoaded && user?.id ? { clerkId: user.id } : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const users = useQuery(
    api.users.listUsersForAdmin,
    isLoaded && user?.id && isAdmin ? { requesterClerkId: user.id } : "skip"
  );

  // רק אדמינים רואים את הטבלה
  if (!isLoaded || !user || !isAdmin) {
    return null;
  }

  const handleRoleChange = async (targetClerkId: string, newRole: UserRole) => {
    setUpdatingId(targetClerkId);
    try {
      await updateUserRole({
        requesterClerkId: user.id,
        clerkId: targetClerkId,
        role: newRole,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section
      id="admin-users"
      aria-labelledby="admin-users-heading"
      className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-brand-950/[0.02] border-t border-brand-900/10"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5 text-start">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-800 bg-purple-100 border border-purple-200 px-3 py-1 rounded-full w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>אזור ניהול – גלוי לאדמינים בלבד</span>
            </div>
            <h2
              id="admin-users-heading"
              className="text-xl sm:text-2xl font-extrabold text-slate-900"
            >
              טבלת משתמשים שהתחברו למערכת
            </h2>
            <p className="text-sm text-slate-600">
              רשימת כל המשתמשים המסונכרנים ב-Convex ואפשרות לניהול הרשאות ודרגות
              בזמן אמת.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs text-sm font-semibold text-slate-700 self-start sm:self-center">
            <Users className="w-4 h-4 text-brand-700" />
            <span>סה״כ רשומים: {users ? users.length : "..."}</span>
          </div>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-labelledby="admin-users-table-caption"
          className="admin-table-wrapper"
        >
          <table className="admin-users-table">
            <caption
              id="admin-users-table-caption"
              className="sr-only"
            >
              טבלת כל המשתמשים שהתחברו למערכת מסע נירים ודרגות ההרשאה שלהם
            </caption>
            <thead>
              <tr>
                <th scope="col">משתמש</th>
                <th scope="col">אימייל</th>
                <th scope="col">דרגה נוכחית</th>
                <th scope="col">שינוי דרגה</th>
                <th scope="col">כניסה אחרונה</th>
              </tr>
            </thead>
            <tbody>
              {!users ? (
                <tr>
                  <th scope="row" className="text-slate-500">
                    טוען משתמשים מ-Convex...
                  </th>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <th scope="row" className="text-slate-500">
                    טרם נרשמו משתמשים
                  </th>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              ) : (
                users.map((u) => {
                  const roleMeta = ROLE_LABELS[u.role];
                  const isCurrentUser = u.clerkId === user.id;
                  const formattedDate = new Intl.DateTimeFormat("he-IL", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(u.updatedAt));

                  return (
                    <tr key={u._id}>
                      <th scope="row">
                        <div className="flex items-center gap-3">
                          {u.imageUrl ? (
                            <img
                              src={u.imageUrl}
                              alt=""
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 block"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {u.name.slice(0, 2)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {u.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                                  את/ה
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </th>

                      <td className="font-mono text-xs text-slate-600">
                        {u.email || "—"}
                      </td>

                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleMeta.badgeClass}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>

                      <td>
                        <select
                          aria-label={`שינוי דרגה עבור ${u.name}`}
                          value={u.role}
                          disabled={updatingId === u.clerkId}
                          onChange={(e) =>
                            handleRoleChange(
                              u.clerkId,
                              e.target.value as UserRole
                            )
                          }
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50 cursor-pointer"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function AdminUsersTable({
  isConfigured,
  isConvexReady,
}: {
  isConfigured: boolean;
  isConvexReady: boolean;
}) {
  if (!isConfigured || !isConvexReady) {
    return null;
  }

  return (
    <Show when="signed-in">
      <AdminUsersTableContent />
    </Show>
  );
}
