/* @name InsertRoute */
INSERT INTO operational_workspace.routes (
  tenant_id,
  id,
  status,
  planned_stop_count,
  next_stop_sequence,
  active_stop_sequence
)
VALUES (
  :tenantId!,
  :id!,
  :status!,
  :plannedStopCount!,
  :nextPermittedStopSequence!,
  :activeStopSequence
);
