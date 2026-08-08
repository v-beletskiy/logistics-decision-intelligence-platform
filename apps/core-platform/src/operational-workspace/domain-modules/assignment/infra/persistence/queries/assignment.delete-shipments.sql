/* @name DeleteAssignmentShipments
   @param ids -> (...) */
DELETE FROM operational_workspace.assignment_shipments
WHERE id IN :ids;
