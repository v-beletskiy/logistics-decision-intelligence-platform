export const SUPPORTED_PROCESS_ROLES = ["api", "worker"] as const;

export const API_PROCESS_ROLE = "api" as const;
export const WORKER_PROCESS_ROLE = "worker" as const;

export type ProcessRole = (typeof SUPPORTED_PROCESS_ROLES)[number];
