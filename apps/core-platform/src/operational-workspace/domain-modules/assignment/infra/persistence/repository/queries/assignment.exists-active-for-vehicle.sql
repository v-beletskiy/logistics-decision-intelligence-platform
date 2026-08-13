/* @name ExistsActiveAssignmentForVehicle */
SELECT EXISTS (
  SELECT 1
  FROM operational_workspace.assignments
  WHERE tenant_id = :tenantId!
    AND vehicle_id = :vehicleId!
    AND status IN ('CREATED', 'IN_PROGRESS')
) AS "exists!";
