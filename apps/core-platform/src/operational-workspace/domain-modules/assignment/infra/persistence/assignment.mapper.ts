import {
  Assignment,
  AssignmentStatus,
  type AssignmentProps,
} from "../../domain/assignment.aggregate";
import { AssignmentId } from "../../domain/assignment-id";
import {
  AssignmentShipment,
  type AssignmentShipmentProps,
} from "../../domain/assignment-shipment.entity";
import { AssignmentShipmentId } from "../../domain/assignment-shipment-id";
import { DriverId } from "../../../driver/domain/driver-id";
import { RouteId } from "../../../route/domain/route-id";
import { ShipmentId } from "../../../shipment/domain/shipment-id";
import { VehicleId } from "../../../vehicle/domain/vehicle-id";
import { AggregatePersistenceMapper } from "../../../../../shared/infra/persistence/orm/aggregate-mapper";
import {
  DimensionUnit,
  Dimensions,
  Weight,
  WeightUnit,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { AssignmentEntity } from "./entities/assignment.entity";
import type { AssignmentShipmentEntity } from "./entities/assignment-shipment.entity";
import type { IInsertAssignmentParams } from "./queries/assignment.insert.queries";
import type { IInsertAssignmentShipmentsParams } from "./queries/assignment.insert-shipments.queries";

/** Root row consumed by persistRoot, matching the assignment insert/update statements. */
export type AssignmentRootRow = IInsertAssignmentParams;

/** Row consumed by the bulk assignment-shipment insert statement. */
export type AssignmentShipmentInsertRow =
  IInsertAssignmentShipmentsParams["rows"][number];

/** Write rows derived from the aggregate's persistence plan. */
export interface AssignmentWriteModel {
  readonly isNew: boolean;
  readonly root: AssignmentRootRow;
  readonly shipmentInserts: readonly AssignmentShipmentInsertRow[];
  readonly removedShipmentIds: readonly string[];
}

/**
 * Explicit persistence-to-domain and domain-to-persistence mapping for Assignment.
 *
 * Reads trust the persisted shape; business rules are validated by the domain
 * constructors. Writes derive their rows from the aggregate's persistence plan.
 */
export class AssignmentMapper extends AggregatePersistenceMapper {
  static toDomain(row: AssignmentEntity): Assignment {
    const shipments = this.requireJsonArray<AssignmentShipmentEntity>(
      row.shipments,
      "assignment shipments",
    ).map((shipment): AssignmentShipment => {
      const props: AssignmentShipmentProps = {
        shipmentId: ShipmentId.from(shipment.shipmentId),
        weight: Weight.create({
          value: shipment.weight,
          unit: shipment.weightUnit as WeightUnit,
        }),
        dimensions: Dimensions.create({
          length: shipment.length,
          width: shipment.width,
          height: shipment.height,
          unit: shipment.dimensionUnit as DimensionUnit,
        }),
      };
      return AssignmentShipment.reconstitute(
        AssignmentShipmentId.from(shipment.id),
        props,
      );
    });

    const props: AssignmentProps = {
      routeId: RouteId.from(row.route_id),
      vehicleId: VehicleId.from(row.vehicle_id),
      driverId: DriverId.from(row.driver_id),
      shipments,
      status: row.status as AssignmentStatus,
      assignedAt: row.assigned_at,
      startedAt: row.started_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      cancelledAt: row.cancelled_at ?? undefined,
    };
    return Assignment.reconstitute(AssignmentId.from(row.id), props);
  }

  static toPersistence(assignment: Assignment): AssignmentWriteModel {
    const plan = assignment.getPersistencePlan();
    return {
      isNew: plan.isNew,
      root: {
        id: assignment.id.value,
        routeId: assignment.routeId.value,
        vehicleId: assignment.vehicleId.value,
        driverId: assignment.driverId.value,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        startedAt: assignment.startedAt ?? null,
        completedAt: assignment.completedAt ?? null,
        cancelledAt: assignment.cancelledAt ?? null,
      },
      shipmentInserts: plan.shipments.inserts.map((shipment) => ({
        id: shipment.id.value,
        assignmentId: assignment.id.value,
        shipmentId: shipment.shipmentId.value,
        weight: shipment.weight.value,
        weightUnit: shipment.weight.unit,
        length: shipment.dimensions.length,
        width: shipment.dimensions.width,
        height: shipment.dimensions.height,
        dimensionUnit: shipment.dimensions.unit,
      })),
      removedShipmentIds: [...plan.shipments.removedIds],
    };
  }
}
