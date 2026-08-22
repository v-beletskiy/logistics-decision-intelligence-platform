import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions";

export const ROUTE_ERROR_CODES = defineErrorCodes(
  "operational-workspace.route",
  {
    routeStatusIsInvalid: "route-status-is-invalid",
    routeRequiresARunningAssignmentBeforeItCanStart:
      "route-requires-a-running-assignment-before-it-can-start",
    onlyAPlannedRouteCanBeStarted: "only-a-planned-route-can-be-started",
    anotherRouteStopIsAlreadyActive: "another-route-stop-is-already-active",
    routeStopIsNotActive: "route-stop-is-not-active",
    onlyAnInProgressRouteCanBeCompleted:
      "only-an-in-progress-route-can-be-completed",
    activeRouteStopMustBeCompletedBeforeTheRoute:
      "active-route-stop-must-be-completed-before-the-route",
    allRouteStopsMustBeCompletedBeforeTheRouteCanBeCompleted:
      "all-route-stops-must-be-completed-before-the-route-can-be-completed",
    completedRouteCannotBeCancelled: "completed-route-cannot-be-cancelled",
    cancelledRouteCannotBeCancelledAgain:
      "cancelled-route-cannot-be-cancelled-again",
    routeStopExecutionRequiresAnInProgressRoute:
      "route-stop-execution-requires-an-in-progress-route",
    routeStopsMustBeExecutedInSequence:
      "route-stops-must-be-executed-in-sequence",
    routeNextStopSequenceIsInvalid: "route-next-stop-sequence-is-invalid",
    routeActiveStopSequenceIsInvalid: "route-active-stop-sequence-is-invalid",
    completedRouteHasInvalidProgression:
      "completed-route-has-invalid-progression",
    routeMustContainAtLeastOnePickupAndOneDeliveryStop:
      "route-must-contain-at-least-one-pickup-and-one-delivery-stop",
    duplicateShipmentStopOperation: "duplicate-shipment-stop-operation",
    shipmentStopPairIsIncomplete: "shipment-stop-pair-is-incomplete",
    shipmentPickupMustPrecedeDelivery: "shipment-pickup-must-precede-delivery",
    validRouteStopOperationTypeMustBeSpecified:
      "valid-route-stop-operation-type-must-be-specified",
    routeStopStatusIsInvalid: "route-stop-status-is-invalid",
    arrivalCanOnlyBeRecordedForAPlannedRouteStop:
      "arrival-can-only-be-recorded-for-a-planned-route-stop",
    departureCanOnlyBeRecordedForAnInProgressRouteStop:
      "departure-can-only-be-recorded-for-an-in-progress-route-stop",
    routeStopDepartureCannotPrecedeArrival:
      "route-stop-departure-cannot-precede-arrival",
    completedRouteStopCannotBeCancelled:
      "completed-route-stop-cannot-be-cancelled",
    cancelledRouteStopCannotBeCancelledAgain:
      "cancelled-route-stop-cannot-be-cancelled-again",
    routeStopPlannedDepartureCannotPrecedeArrival:
      "route-stop-planned-departure-cannot-precede-arrival",
    routeStopActualDepartureCannotPrecedeArrival:
      "route-stop-actual-departure-cannot-precede-arrival",
    plannedRouteStopCannotHaveExecutionTimes:
      "planned-route-stop-cannot-have-execution-times",
    inProgressRouteStopRequiresAnArrivalTime:
      "in-progress-route-stop-requires-an-arrival-time",
    completedRouteStopRequiresArrivalAndDepartureTimes:
      "completed-route-stop-requires-arrival-and-departure-times",
  },
);
