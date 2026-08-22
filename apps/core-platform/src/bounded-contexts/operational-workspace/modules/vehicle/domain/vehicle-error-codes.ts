import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions";

export const VEHICLE_ERROR_CODES = defineErrorCodes(
  "operational-workspace.vehicle",
  {
    validCompartmentTypeMustBeSpecified:
      "valid-compartment-type-must-be-specified",
    vehicleMustHaveAtLeastOneCompartment:
      "vehicle-must-have-at-least-one-compartment",
    vehicleMustBeReturnedFromMaintenanceBeforeItCanBeAvailable:
      "vehicle-must-be-returned-from-maintenance-before-it-can-be-available",
    vehicleInMaintenanceCannotBeMarkedUnavailable:
      "vehicle-in-maintenance-cannot-be-marked-unavailable",
    vehicleIsAlreadyInMaintenance: "vehicle-is-already-in-maintenance",
    onlyAVehicleInMaintenanceCanBeReturnedFromMaintenance:
      "only-a-vehicle-in-maintenance-can-be-returned-from-maintenance",
    vehicleIsAlreadyDecommissioned: "vehicle-is-already-decommissioned",
    decommissionedVehicleCannotBeChanged:
      "decommissioned-vehicle-cannot-be-changed",
    compartmentDoesNotBelongToThisVehicle:
      "compartment-does-not-belong-to-this-vehicle",
    vehicleCompartmentsMustBeSpecifiedAsAList:
      "vehicle-compartments-must-be-specified-as-a-list",
    vehicleCompartmentsMustBeValidCompartmentEntities:
      "vehicle-compartments-must-be-valid-compartment-entities",
    compartmentLimitExceeded: "compartment-limit-exceeded",
    vehicleCompartmentIdentifiersMustBeUnique:
      "vehicle-compartment-identifiers-must-be-unique",
    vehicleStatusIsInvalid: "vehicle-status-is-invalid",
    compartmentMustDefineWeightDimensionsAndVolumeCapacity:
      "compartment-must-define-weight-dimensions-and-volume-capacity",
  },
);
