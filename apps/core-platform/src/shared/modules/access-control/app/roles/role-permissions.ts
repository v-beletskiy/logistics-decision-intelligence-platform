import { Permission } from "../permissions/permission.enum";
import { Role } from "../../domain/role";

const ALL_PERMISSIONS = Object.freeze(Object.values(Permission));

/** Server-owned static RBAC catalog. Unlisted permissions are denied by default. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  [Role.Administrator]: ALL_PERMISSIONS,
  [Role.Dispatcher]: [
    Permission.RecommendationAccept,
    Permission.RecommendationReject,
    Permission.RouteRead,
    Permission.RouteUpdate,
    Permission.VehicleManage,
    Permission.DriverRead,
    Permission.DriverManage,
    Permission.DepotManage,
    Permission.ShipmentManage,
    Permission.AssignmentManage,
  ],
  [Role.Planner]: [
    Permission.RouteRead,
    Permission.RouteUpdate,
    Permission.VehicleManage,
    Permission.DriverRead,
    Permission.DriverManage,
    Permission.DepotManage,
    Permission.ShipmentManage,
    Permission.AssignmentManage,
    Permission.OptimizationExecute,
  ],
};
