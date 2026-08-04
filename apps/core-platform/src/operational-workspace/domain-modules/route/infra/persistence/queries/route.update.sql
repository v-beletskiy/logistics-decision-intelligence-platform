/* @name UpdateRoute */
UPDATE operational_workspace.routes
SET status = :status!,
    updated_at = now()
WHERE id = :id!;
