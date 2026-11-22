"use client";

import React, { useState } from "react";
import { Show, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Compass,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  Mountain,
  Navigation,
  Pencil,
  Plus,
  Route,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

function parseCoordinates(
  value: string
): { lat: number; lng: number } | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return undefined;
  }
  return { lat: parts[0], lng: parts[1] };
}

function TripDetailCard({
  trip,
  isAdmin,
  onEdit,
  onDelete,
}: {
  trip: Doc<"trips">;
  isAdmin: boolean;
  onEdit?: (trip: Doc<"trips">) => void;
  onDelete?: (tripId: Id<"trips">) => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-extrabold text-slate-900">
              {trip.name}
            </h3>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-brand-100 text-brand-800 border border-brand-200">
              {trip.distanceKm} ק״מ
            </span>
          </div>
          {trip.subtitle && (
            <p className="text-sm font-medium text-slate-600">
              {trip.subtitle}
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(trip)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-800 border border-slate-200 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>עריכה</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(trip._id)}
                aria-label={`מחיקת הטיול ${trip.name}`}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* מדדי גובה וטיפוס */}
      {(trip.elevationGainM !== undefined ||
        trip.elevationLossM !== undefined ||
        trip.maxElevationM !== undefined ||
        trip.minElevationM !== undefined) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {trip.elevationGainM !== undefined && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-700" />
                <span>טיפוס מצטבר</span>
              </span>
              <span className="text-sm font-bold text-slate-900">
                {trip.elevationGainM} מטר
              </span>
            </div>
          )}

          {trip.elevationLossM !== undefined && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />
                <span>ירידה מצטברת</span>
              </span>
              <span className="text-sm font-bold text-slate-900">
                {trip.elevationLossM} מטר
              </span>
            </div>
          )}

          {trip.maxElevationM !== undefined && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-brand-700" />
                <span>גובה מקסימלי</span>
              </span>
              <span className="text-sm font-bold text-slate-900">
                {trip.maxElevationM} מטר
              </span>
            </div>
          )}

          {trip.minElevationM !== undefined && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-slate-500" />
                <span>גובה מינימלי</span>
              </span>
              <span className="text-sm font-bold text-slate-900">
                {trip.minElevationM} מטר
              </span>
            </div>
          )}
        </div>
      )}

      {/* נקודת התחלה, נקודת סיום וקישור למסלול */}
      {(trip.startPoint || trip.endPoint || trip.routeUrl) && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            {trip.startPoint && (
              <span className="inline-flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-700" />
                <strong className="text-slate-800">נקודת התחלה:</strong>
                <code
                  dir="ltr"
                  className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]"
                >
                  {trip.startPoint.lat}, {trip.startPoint.lng}
                </code>
              </span>
            )}

            {trip.endPoint && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <strong className="text-slate-800">נקודת סיום:</strong>
                <code
                  dir="ltr"
                  className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]"
                >
                  {trip.endPoint.lat}, {trip.endPoint.lng}
                </code>
              </span>
            )}
          </div>

          {trip.routeUrl && (
            <a
              href={trip.routeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200 font-bold no-underline transition-colors"
            >
              <span>פתיחת מסלול במפה (Israel Hiking)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function TripsAndRostersContent() {
  const { user, isLoaded } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    isLoaded && user?.id ? { clerkId: user.id } : "skip"
  );

  const isStudent = currentUser?.role === "student";
  const isTeacher = currentUser?.role === "teacher";
  const isAdmin = currentUser?.role === "admin";

  // תלמיד שולף אך ורק את הטיולים ששויכו אליו
  const myStudentTrips = useQuery(
    api.users.getStudentTrips,
    currentUser?._id && isStudent ? { studentId: currentUser._id } : "skip"
  );

  // מאגר כל הטיולים נטען רק עבור אדמין, מורה או משקיף
  const allTrips = useQuery(
    api.trips.listTrips,
    currentUser && !isStudent ? {} : "skip"
  );

  // רשימת התלמידים נטענת רק עבור מורה או אדמין
  const allStudents = useQuery(
    api.users.listAllStudents,
    currentUser && (isTeacher || isAdmin) ? {} : "skip"
  );

  const myTeacherStudents = useQuery(
    api.users.getTeacherStudents,
    currentUser?._id && (isTeacher || isAdmin)
      ? { teacherId: currentUser._id }
      : "skip"
  );

  const createTrip = useMutation(api.trips.createTrip);
  const updateTrip = useMutation(api.trips.updateTrip);
  const deleteTrip = useMutation(api.trips.deleteTrip);
  const toggleTeacherStudent = useMutation(api.users.toggleTeacherStudent);
  const toggleStudentTrip = useMutation(api.users.toggleStudentTrip);

  const [editingTripId, setEditingTripId] = useState<Id<"trips"> | null>(null);
  const [tripName, setTripName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [elevationGainM, setElevationGainM] = useState("");
  const [elevationLossM, setElevationLossM] = useState("");
  const [maxElevationM, setMaxElevationM] = useState("");
  const [minElevationM, setMinElevationM] = useState("");
  const [startCoords, setStartCoords] = useState("");
  const [endCoords, setEndCoords] = useState("");
  const [routeUrl, setRouteUrl] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingTrip, setIsSubmittingTrip] = useState(false);

  if (!isLoaded || !user || !currentUser) {
    return null;
  }

  const resetForm = () => {
    setEditingTripId(null);
    setTripName("");
    setSubtitle("");
    setDistanceKm("");
    setElevationGainM("");
    setElevationLossM("");
    setMaxElevationM("");
    setMinElevationM("");
    setStartCoords("");
    setEndCoords("");
    setRouteUrl("");
    setFormError(null);
  };

  const handleStartEdit = (trip: Doc<"trips">) => {
    setEditingTripId(trip._id);
    setTripName(trip.name);
    setSubtitle(trip.subtitle ?? "");
    setDistanceKm(String(trip.distanceKm));
    setElevationGainM(
      trip.elevationGainM !== undefined ? String(trip.elevationGainM) : ""
    );
    setElevationLossM(
      trip.elevationLossM !== undefined ? String(trip.elevationLossM) : ""
    );
    setMaxElevationM(
      trip.maxElevationM !== undefined ? String(trip.maxElevationM) : ""
    );
    setMinElevationM(
      trip.minElevationM !== undefined ? String(trip.minElevationM) : ""
    );
    setStartCoords(
      trip.startPoint ? `${trip.startPoint.lat}, ${trip.startPoint.lng}` : ""
    );
    setEndCoords(
      trip.endPoint ? `${trip.endPoint.lat}, ${trip.endPoint.lng}` : ""
    );
    setRouteUrl(trip.routeUrl ?? "");
    setFormError(null);
  };

  const handleSaveTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = tripName.trim();
    const kmNumber = Number(distanceKm);

    if (!trimmed) {
      setFormError("נא להזין שם טיול.");
      return;
    }
    if (!distanceKm || Number.isNaN(kmNumber) || kmNumber <= 0) {
      setFormError("נא להזין מרחק כולל חיובי בק״מ.");
      return;
    }

    const startPoint = parseCoordinates(startCoords);
    if (startCoords.trim() && !startPoint) {
      setFormError(
        "נקודת התחלה צריכה להיות בפורמט: קו רוחב, קו אורך (למשל 31.711611, 35.045574)"
      );
      return;
    }

    const endPoint = parseCoordinates(endCoords);
    if (endCoords.trim() && !endPoint) {
      setFormError(
        "נקודת סיום צריכה להיות בפורמט: קו רוחב, קו אורך (למשל 31.680314, 34.974511)"
      );
      return;
    }

    setIsSubmittingTrip(true);
    try {
      const payload = {
        requesterClerkId: user.id,
        name: trimmed,
        subtitle: subtitle.trim() || undefined,
        distanceKm: kmNumber,
        elevationGainM: elevationGainM ? Number(elevationGainM) : undefined,
        elevationLossM: elevationLossM ? Number(elevationLossM) : undefined,
        maxElevationM: maxElevationM ? Number(maxElevationM) : undefined,
        minElevationM: minElevationM ? Number(minElevationM) : undefined,
        startPoint,
        endPoint,
        routeUrl: routeUrl.trim() || undefined,
      };

      if (editingTripId) {
        await updateTrip({
          ...payload,
          tripId: editingTripId,
        });
      } else {
        await createTrip(payload);
      }

      resetForm();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "אירעה שגיאה בשמירת הטיול."
      );
    } finally {
      setIsSubmittingTrip(false);
    }
  };

  const handleDeleteTrip = async (tripId: Id<"trips">) => {
    await deleteTrip({
      requesterClerkId: user.id,
      tripId,
    });
    if (editingTripId === tripId) {
      resetForm();
    }
  };

  const handleToggleStudentForTeacher = async (studentId: Id<"users">) => {
    await toggleTeacherStudent({
      requesterClerkId: user.id,
      teacherId: currentUser._id,
      studentId,
    });
  };

  const handleToggleTripForStudent = async (
    studentId: Id<"users">,
    tripId: Id<"trips">
  ) => {
    await toggleStudentTrip({
      requesterClerkId: user.id,
      studentId,
      tripId,
    });
  };

  // ============================================================================
  // תצוגת תלמיד: רואה אך ורק את הטיולים ששויכו אליו (ללא יכולת עריכה/שיוך עצמי)
  // ============================================================================
  if (isStudent) {
    const totalMyKm = Number(
      (myStudentTrips ?? [])
        .reduce((sum, t) => sum + t.distanceKm, 0)
        .toFixed(2)
    );

    return (
      <section
        id="student-assigned-trips"
        className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white/80"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="rounded-3xl bg-brand-50/50 border border-brand-200/70 p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-700 text-white flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    הטיולים ששויכו אליי ({currentUser.name})
                  </h2>
                  <p className="text-xs text-slate-600">
                    רשימת המסלולים והטיולים ששויכו אליך על ידי המורה שלך במסע
                    נירים
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-brand-200 text-sm font-bold text-brand-800 self-start sm:self-center">
                <span>
                  סה״כ טיולים: {myStudentTrips ? myStudentTrips.length : 0}
                </span>
                <span className="text-slate-300">|</span>
                <span>סה״כ מרחק: {totalMyKm} ק״מ</span>
              </div>
            </div>

            {!myStudentTrips ? (
              <div className="rounded-2xl bg-white/80 border border-brand-200 p-6 text-center text-sm text-slate-500">
                טוען את הטיולים שלך...
              </div>
            ) : myStudentTrips.length === 0 ? (
              <div className="rounded-2xl bg-white/80 border border-dashed border-brand-300 p-6 text-center text-sm text-slate-600">
                עדיין לא שויכו אליך טיולים. כאשר המורה שלך ישייך אליך טיול, הוא
                יופיע כאן עם כל פרטי המסלול והמפה.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myStudentTrips.map((trip) => (
                  <TripDetailCard key={trip._id} trip={trip} isAdmin={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // תצוגת מורה / אדמין / משקיף
  // ============================================================================
  return (
    <section
      id="trips-and-rosters"
      className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white/80"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* חלק 1: ניהול התלמידים ושיוך טיולים לתלמידים (עבור מורים ואדמינים) */}
        {(isTeacher || isAdmin) && (
          <div className="rounded-3xl bg-blue-50/50 border border-blue-200/80 p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    רשימת התלמידים שלי ושיוך טיולים ({currentUser.name})
                  </h2>
                  <p className="text-xs text-slate-600">
                    בחרו את התלמידים שלכם ושייכו לכל תלמיד טיולים מתוך מאגר
                    הטיולים הקיים
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-800 self-start sm:self-center">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {myTeacherStudents ? myTeacherStudents.length : 0} תלמידים
                  ברשימה שלי
                </span>
              </span>
            </div>

            {/* בחירת תלמידים לשיוך לרשימת המורה */}
            <div className="rounded-2xl bg-white border border-blue-100 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>
                  בחירת תלמידים לרשימת התלמידים שלך (מתוך כל המשתמשים שדרגתם
                  ״תלמיד״):
                </span>
              </div>

              {!allStudents || allStudents.length === 0 ? (
                <p className="text-xs text-slate-500">
                  אין כרגע משתמשים שדרגתם מוגדרת כ״תלמיד״.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allStudents.map((student) => {
                    const isMyStudent = (
                      currentUser.studentIds ?? []
                    ).includes(student._id);
                    return (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() =>
                          handleToggleStudentForTeacher(student._id)
                        }
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isMyStudent
                            ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {isMyStudent && <Check className="w-3.5 h-3.5" />}
                        <span>{student.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* כרטיסיות התלמידים המשויכים למורה + שיוך כל טיול קיים לתלמיד */}
            {!myTeacherStudents || myTeacherStudents.length === 0 ? (
              <div className="rounded-2xl bg-white/80 border border-dashed border-blue-200 p-5 text-center text-sm text-slate-600">
                בחרו תלמיד אחד או יותר מהרשימה למעלה כדי לשייך לו טיולים.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTeacherStudents.map(({ student, trips, totalKm }) => (
                  <div
                    key={student._id}
                    className="rounded-2xl bg-white border border-blue-200/80 p-5 shadow-xs flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold text-xs flex items-center justify-center">
                          {student.name.slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {student.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                        {trips.length} טיולים ({Number(totalKm.toFixed(2))} ק״מ)
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">
                        שיוך טיולים קיימים עבור {student.name}:
                      </span>
                      {!allTrips || allTrips.length === 0 ? (
                        <span className="text-xs text-slate-400">
                          טרם נוצרו טיולים במערכת.
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {allTrips.map((trip) => {
                            const hasTrip = (student.tripIds ?? []).includes(
                              trip._id
                            );
                            return (
                              <button
                                key={trip._id}
                                type="button"
                                onClick={() =>
                                  handleToggleTripForStudent(
                                    student._id,
                                    trip._id
                                  )
                                }
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                  hasTrip
                                    ? "bg-brand-700 text-white border-brand-700"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-300"
                                }`}
                              >
                                {hasTrip && <Check className="w-3.5 h-3.5" />}
                                <span>
                                  {trip.name} ({trip.distanceKm} ק״מ)
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* חלק 2: מאגר הטיולים (לאדמין: טופס הוספה/עריכה + מחיקה; למורה/משקיף: צפייה בלבד) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* טופס הוספה ועריכה של טיול - מוצג לאדמין בלבד! */}
          {isAdmin && (
            <div className="lg:col-span-5 rounded-3xl bg-sand-50/90 border border-sand-200 p-6 shadow-xs">
              <form
                action="/trips"
                method="POST"
                onSubmit={handleSaveTrip}
                noValidate
              >
                <fieldset className="border-0 p-0 m-0 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <legend className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Route className="w-5 h-5 text-brand-700" />
                      <span>
                        {editingTripId
                          ? "עריכת טיול קיים (אדמין)"
                          : "הוספת טיול חדש (אדמין)"}
                      </span>
                    </legend>

                    {editingTripId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ביטול עריכה</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 -mt-2">
                    רק אדמין מורשה להוסיף, לערוך או למחוק טיולים בטבלת{" "}
                    <code>trips</code>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-name-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        שם טיול <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="trip-name-input"
                        name="tripName"
                        type="text"
                        required
                        value={tripName}
                        onChange={(e) => {
                          setTripName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="מסלול הרי יהודה"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-subtitle-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        שם משני (אזור)
                      </label>
                      <input
                        id="trip-subtitle-input"
                        name="subtitle"
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="אזור נס הרים - בית שמש"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-km-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        מרחק כולל (ק״מ) <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="trip-km-input"
                        name="distanceKm"
                        type="text"
                        inputMode="decimal"
                        required
                        value={distanceKm}
                        onChange={(e) => {
                          setDistanceKm(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="10.04"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-gain-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        טיפוס מצטבר (מ׳)
                      </label>
                      <input
                        id="trip-gain-input"
                        name="elevationGainM"
                        type="text"
                        inputMode="numeric"
                        value={elevationGainM}
                        onChange={(e) => setElevationGainM(e.target.value)}
                        placeholder="194"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label
                        htmlFor="trip-loss-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        ירידה מצטברת (מ׳)
                      </label>
                      <input
                        id="trip-loss-input"
                        name="elevationLossM"
                        type="text"
                        inputMode="numeric"
                        value={elevationLossM}
                        onChange={(e) => setElevationLossM(e.target.value)}
                        placeholder="492"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-max-elev-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        גובה מקסימלי (מ׳)
                      </label>
                      <input
                        id="trip-max-elev-input"
                        name="maxElevationM"
                        type="text"
                        inputMode="numeric"
                        value={maxElevationM}
                        onChange={(e) => setMaxElevationM(e.target.value)}
                        placeholder="608"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-min-elev-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        גובה מינימלי (מ׳)
                      </label>
                      <input
                        id="trip-min-elev-input"
                        name="minElevationM"
                        type="text"
                        inputMode="numeric"
                        value={minElevationM}
                        onChange={(e) => setMinElevationM(e.target.value)}
                        placeholder="277"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-start-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        נקודת התחלה (Lat, Lng)
                      </label>
                      <input
                        id="trip-start-input"
                        name="startCoords"
                        type="text"
                        dir="ltr"
                        value={startCoords}
                        onChange={(e) => setStartCoords(e.target.value)}
                        placeholder="31.711611, 35.045574"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="trip-end-input"
                        className="text-xs font-semibold text-slate-800"
                      >
                        נקודת סיום (Lat, Lng)
                      </label>
                      <input
                        id="trip-end-input"
                        name="endCoords"
                        type="text"
                        dir="ltr"
                        value={endCoords}
                        onChange={(e) => setEndCoords(e.target.value)}
                        placeholder="31.680314, 34.974511"
                        className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="trip-url-input"
                      className="text-xs font-semibold text-slate-800"
                    >
                      קישור למסלול (Israel Hiking / מפה)
                    </label>
                    <input
                      id="trip-url-input"
                      name="routeUrl"
                      type="url"
                      dir="ltr"
                      value={routeUrl}
                      onChange={(e) => setRouteUrl(e.target.value)}
                      placeholder="https://israelhiking.osm.org.il/share/..."
                      className="w-full min-h-[48px] px-3 py-2 text-base rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div aria-live="polite">
                    {formError && (
                      <p
                        role="alert"
                        className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-3"
                      >
                        {formError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTrip}
                    className="primary-auth-btn min-h-[48px]"
                  >
                    {isSubmittingTrip ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingTripId ? (
                      <Pencil className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>
                      {isSubmittingTrip
                        ? "שומר..."
                        : editingTripId
                          ? "שמירת שינויים בטיול"
                          : "הוספת טיול חדש"}
                    </span>
                  </button>
                </fieldset>
              </form>
            </div>
          )}

          {/* רשימת הטיולים הקיימים במערכת */}
          <div
            className={`${
              isAdmin ? "lg:col-span-7" : "lg:col-span-12"
            } flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-700" />
                  <span>מאגר הטיולים במערכת</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isAdmin
                    ? "לחצו על ״עריכה״ כדי לעדכן פרטי טיול או על סמל הפח למחיקה."
                    : "צפייה בכל הטיולים הקיימים במערכת (הוספה, עריכה ומחיקה פתוחות לאדמין בלבד)."}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                {allTrips ? `${allTrips.length} טיולים` : "טוען..."}
              </span>
            </div>

            {!allTrips ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                טוען טיולים...
              </div>
            ) : allTrips.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                עדיין לא נוספו טיולים למערכת.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allTrips.map((trip) => (
                  <TripDetailCard
                    key={trip._id}
                    trip={trip}
                    isAdmin={isAdmin}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteTrip}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TripsAndRostersSection({
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
      <TripsAndRostersContent />
    </Show>
  );
}
