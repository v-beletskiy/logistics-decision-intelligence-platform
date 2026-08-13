/* @name InsertAssignmentShipments
    @param rows -> ((tenantId, id, assignmentId, shipmentId, weight, weightUnit, length, width, height, dimensionUnit)...) */
INSERT INTO operational_workspace.assignment_shipments
  (tenant_id, id, assignment_id, shipment_id, weight, weight_unit, length, width, height, dimension_unit)
VALUES :rows;
