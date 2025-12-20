import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ActivityLog, {
  ACTIVITY_TYPES,
  type ActivityType,
} from "@/models/ActivityLog";
import { connectToDatabase } from "@/lib/mongoose";

export { ACTIVITY_TYPES };

interface LogActivityParams {
  userId?: string | Types.ObjectId;
  action: ActivityType;
  details?: string;
  metadata?: Record<string, unknown>;
  request?: NextRequest;
}

/**
 * Helper function to extract client IP from request
 */
const getClientIp = (request?: NextRequest): string | undefined => {
  if (!request) return undefined;

  // Check various headers for IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return undefined;
};

/**
 * Helper function to extract user agent from request
 */
const getUserAgent = (request?: NextRequest): string | undefined => {
  if (!request) return undefined;
  return request.headers.get("user-agent") || undefined;
};

/**
 * Log an activity to the database
 * @param params - Activity parameters
 * @returns The created activity log document
 */
export const logActivity = async (params: LogActivityParams) => {
  const { userId, action, details, metadata, request } = params;

  try {
    await connectToDatabase();

    const activityLog = await ActivityLog.create({
      userId: userId
        ? typeof userId === "string"
          ? new Types.ObjectId(userId)
          : userId
        : undefined,
      action,
      details,
      metadata,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return activityLog;
  } catch (error) {
    // Log error but don't throw - activity logging should not break main flow
    console.error("Failed to log activity:", error);
    return null;
  }
};

/**
 * Get activity logs with pagination
 */
export const getActivityLogs = async (options?: {
  page?: number;
  limit?: number;
  action?: ActivityType;
  userId?: string;
  dateFrom?: Date;
}) => {
  const { page = 1, limit = 50, action, userId, dateFrom } = options || {};

  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (action) query.action = action;
  if (userId) query.userId = new Types.ObjectId(userId);
  if (dateFrom) query.createdAt = { $gte: dateFrom };

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "firstName lastName email")
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get activity stats summary
 */
export const getActivityStats = async (options?: { range?: "today" | "week" | "month" | "year" }) => {
  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Optional range filter for stats
  let rangeFrom: Date | undefined;
  const range = options?.range;
  if (range) {
    const start = new Date(today);
    if (range === "today") {
      rangeFrom = start;
    } else if (range === "week") {
      const day = start.getDay();
      const diff = (day + 6) % 7; // Monday start
      start.setDate(start.getDate() - diff);
      rangeFrom = start;
    } else if (range === "month") {
      start.setDate(1);
      rangeFrom = start;
    } else if (range === "year") {
      start.setMonth(0, 1);
      rangeFrom = start;
    }
  }

  const [totalActivities, todayActivities, activityBreakdown, rangeActivities] =
    await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.countDocuments({ createdAt: { $gte: today } }),
      ActivityLog.aggregate([
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),
      rangeFrom
        ? ActivityLog.countDocuments({ createdAt: { $gte: rangeFrom } })
        : Promise.resolve(0),
    ]);

  return {
    totalActivities,
    todayActivities,
    rangeActivities,
    activityBreakdown: activityBreakdown.map((item) => ({
      action: item._id,
      count: item.count,
    })),
  };
};
