/* @name DeleteDepot */
DELETE FROM operational_workspace.depots
WHERE id = :id!;
