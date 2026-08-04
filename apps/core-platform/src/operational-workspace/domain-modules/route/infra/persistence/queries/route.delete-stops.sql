/* @name DeleteRouteStops
   @param ids -> (...) */
DELETE FROM operational_workspace.route_stops
WHERE id IN :ids;
