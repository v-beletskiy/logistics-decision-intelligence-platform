export const PROCESS_ROLES = ["api", "outbox-publisher"] as const;

export const API_PROCESS_ROLE = "api" as const;

export type ProcessRole = (typeof PROCESS_ROLES)[number];
