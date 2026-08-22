import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions";

export const DEPOT_ERROR_CODES = defineErrorCodes(
  "operational-workspace.depot",
  {
    depotIsAlreadyActive: "depot-is-already-active",
    depotIsAlreadyInactive: "depot-is-already-inactive",
    depotIsAlreadyClosed: "depot-is-already-closed",
    depotHasNoVehiclesToRelease: "depot-has-no-vehicles-to-release",
    depotHasNoDriversToRelease: "depot-has-no-drivers-to-release",
    onlyAnActiveDepotCanReceiveNewVehiclesOrDrivers:
      "only-an-active-depot-can-receive-new-vehicles-or-drivers",
    depotCannotReceiveNewVehiclesWhenItIsFull:
      "depot-cannot-receive-new-vehicles-when-it-is-full",
    depotCannotReceiveNewDriversWhenItIsFull:
      "depot-cannot-receive-new-drivers-when-it-is-full",
    closedDepotCannotBeChanged: "closed-depot-cannot-be-changed",
    depotMustHaveExactlyOneAddress: "depot-must-have-exactly-one-address",
    depotMustHaveExactlyOneLocation: "depot-must-have-exactly-one-location",
    capacityMustBeAWholeNumber: "capacity-must-be-a-whole-number",
    occupancyCountIsInvalid: "occupancy-count-is-invalid",
    depotStatusIsInvalid: "depot-status-is-invalid",
    vehicleCapacityExceeded: "vehicle-capacity-exceeded",
    driverCapacityExceeded: "driver-capacity-exceeded",
  },
);
