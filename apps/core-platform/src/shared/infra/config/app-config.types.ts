export const PROCESS_ROLES = ["api", "worker"] as const;

export const API_PROCESS_ROLE = "api" as const;

export type ProcessRole = (typeof PROCESS_ROLES)[number];
