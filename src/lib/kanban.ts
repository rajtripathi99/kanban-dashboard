export type Priority = "urgent" | "high" | "medium" | "low";

export type ColumnColor =
  | "slate"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple";

export type ColumnKind = "todo" | "in-progress" | "done" | "custom";

export type Member = {
  id: string;
  name: string;
  fullName: string;
  initials: string;
};

export type Column = {
  id: string;
  name: string;
  color: ColumnColor;
  kind: ColumnKind;
  hidden: boolean;
  projectId: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: Priority;
  assigneeIds: string[];
  followerIds: string[];
  createdAt: string;
  dueDate: string | null;
  /** Design-preserved seed label. Cleared as soon as the due date is edited. */
  dueLabel?: string | null;
  projectId: string;
};

export type Activity = {
  id: string;
  text: string;
  at: string;
};

export type BoardData = {
  title: string;
  favorite: boolean;
  teamName: string;
  members: Member[];
  columns: Column[];
  tasks: Task[];
  activity: Activity[];
};

export type Project = {
  id: string;
  name: string;
};

export const CURRENT_USER_ID = "sarah";

export const CURRENT_USER = {
  id: "sarah",
  name: "Sarah C.",
  fullName: "Sarah Connor",
  role: "Lead Product Eng",
  initials: "SC",
};

export const PROJECTS: Project[] = [
  { id: "core-api", name: "untld Core API" },
  { id: "mobile", name: "Mobile App v2" },
  { id: "tokens", name: "Design Tokens" },
];

export const PRIORITY_META: Record<
  Priority,
  {
    label: string;
    rank: number;
    /** Icon stroke color in the Paper design. */
    icon: string;
    /** Label color in the Paper design. */
    text: string;
    /** Chip border color. */
    border: string;
    weight: number;
  }
> = {
  urgent: {
    label: "Urgent",
    rank: 0,
    icon: "#FF5722",
    text: "#FF5722",
    border: "#FF572233",
    weight: 500,
  },
  high: {
    label: "High",
    rank: 1,
    icon: "#64748B",
    text: "#475569",
    border: "#00000014",
    weight: 400,
  },
  medium: {
    label: "Medium",
    rank: 2,
    icon: "#64748B",
    text: "#475569",
    border: "#00000014",
    weight: 400,
  },
  low: {
    label: "Low",
    rank: 3,
    icon: "#94A3B8",
    text: "#64748B",
    border: "#00000014",
    weight: 400,
  },
};

export const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

export const COLUMN_COLOR_META: Record<
  ColumnColor,
  { hex: string; tint: string; border: string; label: string }
> = {
  slate: {
    hex: "#64748B",
    tint: "#E2E8F0",
    border: "transparent",
    label: "Slate",
  },
  blue: {
    hex: "#3B82F6",
    tint: "#EFF6FF",
    border: "#BFDBFE",
    label: "Blue",
  },
  green: {
    hex: "#10B981",
    tint: "#ECFDF5",
    border: "#A7F3D0",
    label: "Green",
  },
  amber: {
    hex: "#F59E0B",
    tint: "#FFFBEB",
    border: "#FDE68A",
    label: "Amber",
  },
  red: {
    hex: "#EF4444",
    tint: "#FEF2F2",
    border: "#FECACA",
    label: "Red",
  },
  purple: {
    hex: "#8B5CF6",
    tint: "#EDE9FE",
    border: "#DDD6FE",
    label: "Purple",
  },
};

export const COLUMN_COLOR_OPTIONS: ColumnColor[] = [
  "slate",
  "blue",
  "green",
  "amber",
  "red",
  "purple",
];

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}

/** New work inherits the active project first, then its column's project. */
export function resolveProjectId(
  activeProject?: string | null,
  columnProjectId?: string | null,
) {
  return activeProject ?? columnProjectId ?? "core-api";
}

export function memberLabel(task: Task, members: Member[]) {
  const names = task.assigneeIds
    .map((id) => members.find((member) => member.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "Unassigned";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

export function memberCountLabel(count: number) {
  return `${count} ${count === 1 ? "member" : "members"}`;
}

function task(
  id: string,
  title: string,
  description: string,
  columnId: string,
  priority: Priority,
  assigneeIds: string[],
  followerIds: string[],
  createdAt: string,
  dueDate: string | null,
  projectId = "core-api",
  dueLabel?: string,
): Task {
  return {
    id,
    title,
    description,
    columnId,
    priority,
    assigneeIds,
    followerIds,
    createdAt,
    dueDate,
    dueLabel,
    projectId,
  };
}

export function seedData(): BoardData {
  return {
    title: "Sprint 24: Core Platform",
    favorite: false,
    teamName: "untld labs",
    members: [
      {
        id: "sarah",
        name: "Sarah C.",
        fullName: "Sarah Connor",
        initials: "SC",
      },
      { id: "mark", name: "Mark R.", fullName: "Mark Rivera", initials: "MR" },
      { id: "eli", name: "Eli T.", fullName: "Eli Thompson", initials: "ET" },
    ],
    columns: [
      {
        id: "todo",
        name: "To do",
        color: "slate",
        kind: "todo",
        hidden: false,
        projectId: "core-api",
      },
      {
        id: "in-progress",
        name: "In progress",
        color: "blue",
        kind: "in-progress",
        hidden: false,
        projectId: "core-api",
      },
      {
        id: "done",
        name: "Done",
        color: "green",
        kind: "done",
        hidden: false,
        projectId: "core-api",
      },
      {
        id: "backlog",
        name: "Backlog",
        color: "slate",
        kind: "custom",
        hidden: true,
        projectId: "core-api",
      },
      {
        id: "canceled",
        name: "Canceled",
        color: "red",
        kind: "custom",
        hidden: true,
        projectId: "core-api",
      },
      {
        id: "duplicated",
        name: "Duplicated",
        color: "amber",
        kind: "custom",
        hidden: true,
        projectId: "mobile",
      },
    ],
    tasks: [
      task(
        "t1",
        "Move session store to Redis cluster",
        "Move session data out of the in-memory store and into the shared Redis cluster. Add a dual-write window so deploys do not sign anyone out.",
        "todo",
        "high",
        ["sarah"],
        ["sarah", "mark"],
        "2026-10-12T09:20:00.000Z",
        "2026-10-25",
      ),
      task(
        "t2",
        "Set up staging rollback script",
        "Document and script the rollback path for staging deploys, including database migrations and feature flag state.",
        "todo",
        "medium",
        ["mark"],
        ["mark"],
        "2026-10-15T13:05:00.000Z",
        "2026-10-28",
      ),
      task(
        "t3",
        "Fix drag lag when reordering cards",
        "Pointer moves drop frames when a column contains more than twenty cards. Profile the layout animation and reduce work during drag.",
        "in-progress",
        "urgent",
        ["eli", "sarah", "mark"],
        ["eli", "sarah", "mark"],
        "2026-10-16T08:40:00.000Z",
        "2026-10-24",
        "core-api",
        "Tomorrow",
      ),
      task(
        "t4",
        "Optimize tenant connection pool queries",
        "Tune pgbouncer limits and per-tenant pool sizing. The noisiest tenants should stop starving shared capacity.",
        "in-progress",
        "medium",
        ["sarah"],
        ["sarah", "eli"],
        "2026-10-18T11:15:00.000Z",
        "2026-10-24",
      ),
      task(
        "t5",
        "Define token architecture in design system",
        "Split primitive, semantic and component tokens. Document naming rules and add a migration note for legacy aliases.",
        "done",
        "low",
        ["sarah"],
        ["sarah", "mark"],
        "2026-10-10T10:10:00.000Z",
        "2026-10-20",
      ),
      task(
        "t6",
        "Review OAuth consent flow and CSRF checks",
        "Audit state parameter handling, PKCE verification and CSRF protections across the consent screen and callback route.",
        "done",
        "medium",
        ["mark"],
        ["mark"],
        "2026-10-11T15:30:00.000Z",
        "2026-10-18",
      ),
      task(
        "t7",
        "Add audit log export",
        "Expose a filtered CSV export for workspace admins and keep large exports off the request path.",
        "backlog",
        "low",
        ["eli"],
        ["eli"],
        "2026-10-20T09:00:00.000Z",
        null,
      ),
      task(
        "t8",
        "Investigate WebSocket reconnect storms",
        "Reconnects fan out after a network blip. Add jitter and cap concurrent reconnects.",
        "backlog",
        "high",
        ["sarah"],
        ["sarah", "eli"],
        "2026-10-21T09:00:00.000Z",
        null,
      ),
      task(
        "t9",
        "Spike feature flag SDK",
        "Compare a tiny in-house client with LaunchDarkly for edge and client-side evaluation.",
        "backlog",
        "medium",
        [],
        ["mark"],
        "2026-10-22T09:00:00.000Z",
        null,
      ),
      task(
        "t10",
        "Deprecate legacy billing webhook",
        "Remove the v1 webhook after all tenants migrate to the signed v2 endpoint.",
        "canceled",
        "low",
        ["mark"],
        ["mark"],
        "2026-10-25T09:00:00.000Z",
        null,
        "core-api",
      ),
      task(
        "t11",
        "Rotate staging API keys",
        "Rotate shared staging credentials and update the partner sandbox documentation.",
        "duplicated",
        "urgent",
        ["eli"],
        ["eli"],
        "2026-10-26T09:00:00.000Z",
        null,
        "mobile",
      ),
      task(
        "t12",
        "Tune Postgres vacuum settings",
        "Reduce bloat on the events table without causing long autovacuum pauses.",
        "duplicated",
        "medium",
        ["mark"],
        ["mark"],
        "2026-10-27T09:00:00.000Z",
        null,
        "mobile",
      ),
    ],
    activity: [
      {
        id: "a1",
        text: "Eli moved “Fix drag lag when reordering cards” to In progress",
        at: "2026-10-27T08:20:00.000Z",
      },
      {
        id: "a2",
        text: "Sarah created “Move session store to Redis cluster”",
        at: "2026-10-26T14:05:00.000Z",
      },
      {
        id: "a3",
        text: "Mark set “Review OAuth consent flow and CSRF checks” to Medium priority",
        at: "2026-10-25T11:40:00.000Z",
      },
      {
        id: "a4",
        text: "Sarah completed “Define token architecture in design system”",
        at: "2026-10-24T16:10:00.000Z",
      },
    ],
  };
}
