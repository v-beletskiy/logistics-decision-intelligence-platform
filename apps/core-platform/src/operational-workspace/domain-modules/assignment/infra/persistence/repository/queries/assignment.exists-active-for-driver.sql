/* @name ExistsActiveAssignmentForDriver */
SELECT EXISTS (
  SELECT 1
  FROM operational_workspace.assignments
  WHERE tenant_id = :tenantId!
    AND driver_id = :driverId!
    AND status IN ('CREATED', 'IN_PROGRESS')
) AS "exists!";
