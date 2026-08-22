/* @name UpdateRouteStop */
UPDATE operational_workspace.route_stops
SET status = :status!,
    actual_arrival_at = :actualArrivalAt,
    actual_departure_at = :actualDepartureAt,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
