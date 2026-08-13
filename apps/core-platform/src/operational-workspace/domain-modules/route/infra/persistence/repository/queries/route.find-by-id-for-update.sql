/* @name FindRouteByIdForUpdate */
SELECT
  r.id,
  r.status,
  r.planned_stop_count,
  r.next_stop_sequence,
  r.active_stop_sequence,
  r.revision
FROM operational_workspace.routes r
WHERE r.tenant_id = :tenantId!
  AND r.id = :id!
FOR UPDATE;
