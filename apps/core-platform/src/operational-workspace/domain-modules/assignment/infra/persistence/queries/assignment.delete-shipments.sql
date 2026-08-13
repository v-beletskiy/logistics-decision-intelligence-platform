/* @name DeleteAssignmentShipments
   @param ids -> (...) */
DELETE FROM operational_workspace.assignment_shipments
WHERE tenant_id = :tenantId!
  AND assignment_id = :ownerId!
  AND id IN :ids;
