import {
  type Deadline,
  type NewDeadline,
  type DeadlineType,
  type Priority,
  type DeadlineStatus,
  deadlineTypeEnum,
  priorityEnum,
  deadlineStatusEnum,
} from "@/server/db/schema/deadlines";

export type { Deadline, NewDeadline, DeadlineType, Priority, DeadlineStatus };
export { deadlineTypeEnum, priorityEnum, deadlineStatusEnum };
