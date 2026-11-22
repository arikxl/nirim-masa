import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { userRoleValidator } from "./schema";

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
 * שליפת כל המשתמשים במערכת (עבור אדמין / ניהול).
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(100);
  },
});

/**
 * עדכון דרגת משתמש (תלמיד / מורה / אדמין / משקיף).
 */
export const updateUserRole = mutation({
  args: {
    clerkId: v.string(),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
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
