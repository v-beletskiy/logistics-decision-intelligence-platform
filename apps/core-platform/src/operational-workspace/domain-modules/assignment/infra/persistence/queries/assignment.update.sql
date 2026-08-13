/* @name UpdateAssignment */
UPDATE operational_workspace.assignments
SET route_id = :routeId!,
    vehicle_id = :vehicleId!,
    driver_id = :driverId!,
    status = :status!,
    assigned_at = :assignedAt!,
    started_at = :startedAt,
    completed_at = :completedAt,
    cancelled_at = :cancelledAt,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!;
