import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { userRoleValidator } from "./schema";
import type { Doc } from "./_generated/dataModel";

/**
 * שומר או מעדכן משתמש שהתחבר דרך Clerk בטבלת users של Convex.
 * למשתמש חדש מוגדרת כברירת מחדל הדרגה "student" (תלמיד).
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const tokenIdentifier = identity?.tokenIdentifier ?? `clerk|${args.clerkId}`;
    const now = Date.now();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        tokenIdentifier,
        updatedAt: now,
      });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      tokenIdentifier,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "student", // ברירת מחדל למשתמש חדש: תלמיד
      studentIds: [],
      tripIds: [],
      createdAt: now,
      updatedAt: now,
    });

    return newUserId;
  },
});

/**
 * שליפת פרטי המשתמש הנוכחי לפי ה-clerkId שלו.
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId!))
      .unique();
  },
});

/**
 * שליפת כל המשתמשים במערכת - מונגש אך ורק למשתמשים בעלי דרגת אדמין (admin).
 */
export const listUsersForAdmin = query({
  args: {
    requesterClerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.requesterClerkId) return null;

    const requester = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.requesterClerkId!))
      .unique();

    if (!requester || requester.role !== "admin") {
      return null;
    }

    return await ctx.db.query("users").order("desc").take(100);
  },
});

/**
 * שליפת כל המשתמשים שדרגתם "student" (תלמיד), עבור שיוך למורים או לטיולים.
 */
export const listAllStudents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .take(100);
  },
});

/**
 * שליפת כל המשתמשים שדרגתם "teacher" (מורה).
 */
export const listAllTeachers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "teacher"))
      .take(100);
  },
});

/**
 * שליפת רשימת התלמידים המלאה של מורה מסוים (כולל רשימת הטיולים של כל תלמיד).
 */
export const getTeacherStudents = query({
  args: {
    teacherId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.teacherId) return [];

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.studentIds || teacher.studentIds.length === 0) {
      return [];
    }

    const result: Array<{
      student: Doc<"users">;
      trips: Doc<"trips">[];
      totalKm: number;
    }> = [];

    for (const studentId of teacher.studentIds) {
      const student = await ctx.db.get(studentId);
      if (student) {
        const trips: Doc<"trips">[] = [];
        let totalKm = 0;
        for (const tripId of student.tripIds ?? []) {
          const trip = await ctx.db.get(tripId);
          if (trip) {
            trips.push(trip);
            totalKm += trip.distanceKm;
          }
        }
        result.push({ student, trips, totalKm });
      }
    }

    return result;
  },
});

/**
 * שליפת רשימת הטיולים המלאה של תלמיד מסוים.
 */
export const getStudentTrips = query({
  args: {
    studentId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.studentId) return [];

    const student = await ctx.db.get(args.studentId);
    if (!student || !student.tripIds || student.tripIds.length === 0) {
      return [];
    }

    const trips: Doc<"trips">[] = [];
    for (const tripId of student.tripIds) {
      const trip = await ctx.db.get(tripId);
      if (trip) {
        trips.push(trip);
      }
    }

    return trips;
  },
});

/**
 * הוספה או הסרה של תלמיד מרשימת התלמידים של מורה (studentIds).
 * מורשה למורים (עבור הרשימה שלהם) ולאדמינים.
 */
export const toggleTeacherStudent = mutation({
  args: {
    requesterClerkId: v.string(),
    teacherId: v.id("users"),
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requester = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.requesterClerkId))
      .unique();

    if (
      !requester ||
      (requester.role !== "admin" &&
        (requester.role !== "teacher" || requester._id !== args.teacherId))
    ) {
      throw new Error("הרשאה נדחתה: רק מורה או אדמין יכולים לנהל רשימת תלמידים.");
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) {
      throw new Error("מורה לא נמצא");
    }

    const currentStudents = teacher.studentIds ?? [];
    const exists = currentStudents.includes(args.studentId);
    const updatedStudents = exists
      ? currentStudents.filter((id) => id !== args.studentId)
      : [...currentStudents, args.studentId];

    await ctx.db.patch(teacher._id, {
      studentIds: updatedStudents,
      updatedAt: Date.now(),
    });

    return updatedStudents;
  },
});

/**
 * הוספה או הסרה של טיול מרשימת הטיולים של תלמיד (tripIds).
 * מורשה למורה של אותו תלמיד או לאדמין בלבד (תלמידים אינם יכולים לשייך לעצמם טיולים).
 */
export const toggleStudentTrip = mutation({
  args: {
    requesterClerkId: v.string(),
    studentId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const requester = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.requesterClerkId))
      .unique();

    const isAdmin = requester?.role === "admin";
    const isTeacherOfStudent =
      requester?.role === "teacher" &&
      (requester.studentIds ?? []).includes(args.studentId);

    if (!requester || (!isAdmin && !isTeacherOfStudent)) {
      throw new Error(
        "הרשאה נדחתה: רק המורה של התלמיד או אדמין יכולים לשייך טיולים לתלמיד."
      );
    }

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("תלמיד לא נמצא");
    }

    const currentTrips = student.tripIds ?? [];
    const exists = currentTrips.includes(args.tripId);
    const updatedTrips = exists
      ? currentTrips.filter((id) => id !== args.tripId)
      : [...currentTrips, args.tripId];

    await ctx.db.patch(student._id, {
      tripIds: updatedTrips,
      updatedAt: Date.now(),
    });

    return updatedTrips;
  },
});

/**
 * עדכון דרגת משתמש (תלמיד / מורה / אדמין / משקיף) - מורשה לאדמין בלבד!
 */
export const updateUserRole = mutation({
  args: {
    requesterClerkId: v.string(),
    clerkId: v.string(),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const requester = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.requesterClerkId))
      .unique();

    if (!requester || requester.role !== "admin") {
      throw new Error("הרשאה נדחתה: רק אדמין יכול לשנות תפקיד של משתמש.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("משתמש לא נמצא במערכת");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
