import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRoleValidator = v.union(
  v.literal("student"),  // תלמיד
  v.literal("teacher"),  // מורה
  v.literal("admin"),    // אדמין
  v.literal("observer")  // משקיף
);

export type UserRole = "student" | "teacher" | "admin" | "observer";

export const coordinatesValidator = v.object({
  lat: v.number(),
  lng: v.number(),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: userRoleValidator,
    // רשימת התלמידים המשויכים למורה
    studentIds: v.optional(v.array(v.id("users"))),
    // רשימת הטיולים המשויכים לתלמיד
    tripIds: v.optional(v.array(v.id("trips"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // טבלת טיולים עם כלל נתוני המסלול
  trips: defineTable({
    name: v.string(),                                // שם טיול
    subtitle: v.optional(v.string()),                // שם משני
    distanceKm: v.number(),                          // מרחק כולל (ק"מ)
    elevationGainM: v.optional(v.number()),          // טיפוס מצטבר (מטר)
    maxElevationM: v.optional(v.number()),           // גובה מקסימלי (מטר)
    elevationLossM: v.optional(v.number()),          // ירידה מצטברת (מטר)
    minElevationM: v.optional(v.number()),           // גובה מינימלי (מטר)
    startPoint: v.optional(coordinatesValidator),    // נקודת התחלה (lat, lng)
    endPoint: v.optional(coordinatesValidator),      // נקודת סיום (lat, lng)
    routeUrl: v.optional(v.string()),                // קישור למסלול
  }),
});
