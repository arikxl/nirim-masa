import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRoleValidator = v.union(
  v.literal("student"),  // תלמיד
  v.literal("teacher"),  // מורה
  v.literal("admin"),    // אדמין
  v.literal("observer")  // משקיף
);

export type UserRole = "student" | "teacher" | "admin" | "observer";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: userRoleValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
