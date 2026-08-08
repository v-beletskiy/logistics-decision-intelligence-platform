/* @name DeleteShipment */
DELETE FROM operational_workspace.shipments
WHERE id = :id!;
