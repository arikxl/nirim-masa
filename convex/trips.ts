import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { coordinatesValidator } from "./schema";

async function requireAdmin(ctx: MutationCtx, requesterClerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", requesterClerkId))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("הרשאה נדחתה: רק אדמין יכול להוסיף, לערוך או למחוק טיולים.");
  }
  return user;
}

/**
 * יצירת טיול חדש בטבלת הטיולים - מורשה לאדמין בלבד.
 */
export const createTrip = mutation({
  args: {
    requesterClerkId: v.string(),
    name: v.string(),
    subtitle: v.optional(v.string()),
    distanceKm: v.number(),
    elevationGainM: v.optional(v.number()),
    maxElevationM: v.optional(v.number()),
    elevationLossM: v.optional(v.number()),
    minElevationM: v.optional(v.number()),
    startPoint: v.optional(coordinatesValidator),
    endPoint: v.optional(coordinatesValidator),
    routeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.requesterClerkId);

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("נא להזין שם טיול");
    }
    if (args.distanceKm < 0) {
      throw new Error("המרחק בק״מ חייב להיות מספר חיובי");
    }

    return await ctx.db.insert("trips", {
      name: trimmedName,
      subtitle: args.subtitle?.trim() || undefined,
      distanceKm: args.distanceKm,
      elevationGainM: args.elevationGainM,
      maxElevationM: args.maxElevationM,
      elevationLossM: args.elevationLossM,
      minElevationM: args.minElevationM,
      startPoint: args.startPoint,
      endPoint: args.endPoint,
      routeUrl: args.routeUrl?.trim() || undefined,
    });
  },
});

/**
 * עריכת טיול קיים בטבלת הטיולים - מורשה לאדמין בלבד.
 */
export const updateTrip = mutation({
  args: {
    requesterClerkId: v.string(),
    tripId: v.id("trips"),
    name: v.string(),
    subtitle: v.optional(v.string()),
    distanceKm: v.number(),
    elevationGainM: v.optional(v.number()),
    maxElevationM: v.optional(v.number()),
    elevationLossM: v.optional(v.number()),
    minElevationM: v.optional(v.number()),
    startPoint: v.optional(coordinatesValidator),
    endPoint: v.optional(coordinatesValidator),
    routeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.requesterClerkId);

    const existing = await ctx.db.get(args.tripId);
    if (!existing) {
      throw new Error("הטיול המבוקש לא נמצא");
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("נא להזין שם טיול");
    }
    if (args.distanceKm < 0) {
      throw new Error("המרחק בק״מ חייב להיות מספר חיובי");
    }

    await ctx.db.patch(args.tripId, {
      name: trimmedName,
      subtitle: args.subtitle?.trim() || undefined,
      distanceKm: args.distanceKm,
      elevationGainM: args.elevationGainM,
      maxElevationM: args.maxElevationM,
      elevationLossM: args.elevationLossM,
      minElevationM: args.minElevationM,
      startPoint: args.startPoint,
      endPoint: args.endPoint,
      routeUrl: args.routeUrl?.trim() || undefined,
    });

    return args.tripId;
  },
});

/**
 * הכנסת/עדכון הטיול "מסלול הרי יהודה" למסד הנתונים.
 */
export const seedJudeanHillsTrip = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("trips").take(100);
    const match = existing.find((t) => t.name === "מסלול הרי יהודה");

    const tripData = {
      name: "מסלול הרי יהודה",
      subtitle: "אזור נס הרים - בית שמש",
      distanceKm: 10.04,
      elevationGainM: 194,
      maxElevationM: 608,
      elevationLossM: 492,
      minElevationM: 277,
      startPoint: { lat: 31.711611, lng: 35.045574 },
      endPoint: { lat: 31.680314, lng: 34.974511 },
      routeUrl: "https://israelhiking.osm.org.il/share/fLG7bQSxaz",
    };

    if (match) {
      await ctx.db.patch(match._id, tripData);
      return match._id;
    }

    return await ctx.db.insert("trips", tripData);
  },
});

/**
 * שליפת רשימת כל הטיולים במערכת (עבור אדמין, מורה או משקיף).
 */
export const listTrips = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trips").order("desc").take(100);
  },
});

/**
 * מחיקת טיול מטבלת הטיולים והסרתו מרשימות הטיולים של התלמידים - מורשה לאדמין בלבד.
 */
export const deleteTrip = mutation({
  args: {
    requesterClerkId: v.string(),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.requesterClerkId);

    const students = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .take(200);

    for (const student of students) {
      if (student.tripIds && student.tripIds.includes(args.tripId)) {
        await ctx.db.patch(student._id, {
          tripIds: student.tripIds.filter((id) => id !== args.tripId),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.delete(args.tripId);
    return null;
  },
});
