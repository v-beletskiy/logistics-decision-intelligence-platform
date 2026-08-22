/* @name InsertAssignment */
INSERT INTO operational_workspace.assignments
  (tenant_id, id, route_id, vehicle_id, driver_id, status,
   assigned_at, started_at, completed_at, cancelled_at)
VALUES
  (:tenantId!, :id!, :routeId!, :vehicleId!, :driverId!, :status!,
   :assignedAt!, :startedAt, :completedAt, :cancelledAt);
