import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions";

export const ASSIGNMENT_ERROR_CODES = defineErrorCodes(
  "operational-workspace.assignment",
  {
    assignmentShipmentWeightIsInvalid: "assignment-shipment-weight-is-invalid",
    assignmentShipmentDimensionsAreInvalid:
      "assignment-shipment-dimensions-are-invalid",
    unavailableVehicleCannotBeAssigned:
      "unavailable-vehicle-cannot-be-assigned",
    vehicleCannotParticipateInMultipleActiveAssignmentsSimultaneously:
      "vehicle-cannot-participate-in-multiple-active-assignments-simultaneously",
    suspendedDriverCannotBeAssigned: "suspended-driver-cannot-be-assigned",
    driverCannotParticipateInMultipleActiveAssignmentsSimultaneously:
      "driver-cannot-participate-in-multiple-active-assignments-simultaneously",
    routeCannotHaveMoreThanOneActiveAssignmentSimultaneously:
      "route-cannot-have-more-than-one-active-assignment-simultaneously",
    completedOrCancelledRouteCannotBeAssigned:
      "completed-or-cancelled-route-cannot-be-assigned",
    assignmentMustContainAtLeastOneShipment:
      "assignment-must-contain-at-least-one-shipment",
    totalShipmentWeightExceedsTheAssignedVehicleCapacity:
      "total-shipment-weight-exceeds-the-assigned-vehicle-capacity",
    totalShipmentVolumeExceedsTheAssignedVehicleCapacity:
      "total-shipment-volume-exceeds-the-assigned-vehicle-capacity",
    shipmentDoesNotFitWithinTheAssignedVehicleCapacity:
      "shipment-does-not-fit-within-the-assigned-vehicle-capacity",
    onlyACreatedAssignmentCanBeStarted:
      "only-a-created-assignment-can-be-started",
    onlyAnInProgressAssignmentCanBeCompleted:
      "only-an-in-progress-assignment-can-be-completed",
    completedAssignmentCannotBeCancelled:
      "completed-assignment-cannot-be-cancelled",
    assignmentIsAlreadyCancelled: "assignment-is-already-cancelled",
    cancelledAssignmentCannotBeModified:
      "cancelled-assignment-cannot-be-modified",
    completedAssignmentCannotBeModified:
      "completed-assignment-cannot-be-modified",
    startedAssignmentCannotBeReassigned:
      "started-assignment-cannot-be-reassigned",
    assignmentShipmentsMustBeSpecifiedAsAList:
      "assignment-shipments-must-be-specified-as-a-list",
    assignmentShipmentsMustBeValidAssignmentShipmentEntities:
      "assignment-shipments-must-be-valid-assignment-shipment-entities",
    shipmentLimitExceeded: "shipment-limit-exceeded",
    assignmentCannotBindTheSameShipmentMoreThanOnce:
      "assignment-cannot-bind-the-same-shipment-more-than-once",
    assignmentStatusIsInvalid: "assignment-status-is-invalid",
  },
);
