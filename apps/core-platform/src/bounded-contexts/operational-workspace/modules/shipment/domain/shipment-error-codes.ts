import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions.js";

export const SHIPMENT_ERROR_CODES = defineErrorCodes("shipment", {
  invalidEndpoint: "invalid-endpoint",
  invalidWeight: "invalid-weight",
  invalidDimensions: "invalid-dimensions",
  invalidStatus: "invalid-status",
  pickupAlreadyCompleted: "pickup-already-completed",
  deliveryAlreadyCompleted: "delivery-already-completed",
  deliveryRequiresPickup: "delivery-requires-pickup",
  alreadyCancelled: "already-cancelled",
  completedCancellation: "cancellation-of-completed",
  modificationNotAllowed: "modification-not-allowed",
  executionNotAllowed: "execution-not-allowed",
});
