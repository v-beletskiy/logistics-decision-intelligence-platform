/* @name ExistsActiveAssignmentForRoute */
SELECT EXISTS (
  SELECT 1
  FROM operational_workspace.assignments
  WHERE tenant_id = :tenantId!
    AND route_id = :routeId!
    AND status IN ('CREATED', 'IN_PROGRESS')
) AS "exists!";
