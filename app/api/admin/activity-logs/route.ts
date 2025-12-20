import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getActivityLogs, getActivityStats } from "@/lib/activityLogger";
import { ACTIVITY_TYPES, ACTIVITY_LABELS, type ActivityType } from "@/models/ActivityLog";

export const GET = async (request: NextRequest) => {
  const adminUser = await authenticateRequest(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminUser.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
  const action = searchParams.get("action") as ActivityType | null;
  const range = searchParams.get("range") as "today" | "week" | "month" | "year" | null;
  let dateFrom: Date | undefined = undefined;
  if (range) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (range === "today") {
      dateFrom = start;
    } else if (range === "week") {
      const day = start.getDay();
      const diff = (day + 6) % 7; // Monday as start of week
      start.setDate(start.getDate() - diff);
      dateFrom = start;
    } else if (range === "month") {
      start.setDate(1);
      dateFrom = start;
    } else if (range === "year") {
      start.setMonth(0, 1);
      dateFrom = start;
    }
  }
  const userId = searchParams.get("userId") || undefined;

  try {
    const [logsData, stats] = await Promise.all([
      getActivityLogs({
        page,
        limit,
        action: action && Object.values(ACTIVITY_TYPES).includes(action) ? action : undefined,
        userId,
        dateFrom,
      }),
      getActivityStats({ range: range || undefined }),
    ]);

    return NextResponse.json({
      logs: logsData.logs.map((log) => ({
        id: log._id?.toString(),
        userId: log.userId?._id?.toString() || null,
        userEmail: (log.userId as unknown as { email?: string })?.email || null,
        userName: [
          (log.userId as unknown as { firstName?: string })?.firstName,
          (log.userId as unknown as { lastName?: string })?.lastName,
        ]
          .filter(Boolean)
          .join(" ") || null,
        action: log.action,
        actionLabel: ACTIVITY_LABELS[log.action as ActivityType] || log.action,
        details: log.details || null,
        metadata: log.metadata || null,
        ipAddress: log.ipAddress || null,
        userAgent: log.userAgent || null,
        createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : null,
      })),
      pagination: logsData.pagination,
      stats,
      activityTypes: Object.entries(ACTIVITY_TYPES).map(([key, value]) => ({
        key,
        value,
        label: ACTIVITY_LABELS[value],
      })),
    });
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
};
