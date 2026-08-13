/* @name UpdateRoute */
UPDATE operational_workspace.routes
SET status = :status!,
    planned_stop_count = :plannedStopCount!,
    next_stop_sequence = :nextPermittedStopSequence!,
    active_stop_sequence = :activeStopSequence,
    revision = revision + 1,
    updated_at = now()
WHERE tenant_id = :tenantId!
  AND id = :id!
  AND revision = :expectedRevision!
RETURNING revision;
