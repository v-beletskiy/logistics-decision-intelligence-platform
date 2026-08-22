import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration";
import {
  Assignment,
  AssignmentStatus,
  type AssignmentProps,
} from "../../../../domain/assignment.aggregate";
import { AssignmentId } from "../../../../domain/assignment-id";
import {
  AssignmentShipment,
  type AssignmentShipmentProps,
} from "../../../../domain/assignment-shipment.entity";
import { AssignmentShipmentId } from "../../../../domain/assignment-shipment-id";
import { DriverId } from "../../../../../driver/domain/driver-id";
import { RouteId } from "../../../../../route/domain/route-id";
import { ShipmentId } from "../../../../../shipment/domain/shipment-id";
import { VehicleId } from "../../../../../vehicle/domain/vehicle-id";
import {
  DimensionUnit,
  Dimensions,
  Weight,
  WeightUnit,
} from "../../../../../../../../shared/domain/value-objects/measurement";
import type { IInsertAssignmentParams } from "../queries/assignment.insert.queries";
import type { IReconcileAssignmentShipmentsParams } from "../queries/assignment.reconcile-shipments.queries";

interface AssignmentShipmentPersistenceData {
  readonly id: string;
  readonly shipmentId: string;
  readonly weight: number;
  readonly weightUnit: string;
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly dimensionUnit: string;
}

export interface AssignmentPersistenceRow {
  readonly id: string;
  readonly route_id: string;
  readonly vehicle_id: string;
  readonly driver_id: string;
  readonly status: string;
  readonly assigned_at: Date;
  readonly started_at: Date | null;
  readonly completed_at: Date | null;
  readonly cancelled_at: Date | null;
  readonly shipments: unknown;
}

/** Maps the complete, bounded Assignment aggregate to and from persistence. */
export class AssignmentMapper {
  static toDomain(row: AssignmentPersistenceRow): Assignment {
    return hydratePersistenceData("assignment", () => {
      const shipments = (
        row.shipments as readonly AssignmentShipmentPersistenceData[]
      ).map((shipment) =>
        AssignmentShipment.reconstitute(
          AssignmentShipmentId.from(shipment.id),
          {
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
          } satisfies AssignmentShipmentProps,
        ),
      );
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
    });
  }

  static toPersistence(
    tenantId: string,
    assignment: Assignment,
  ): {
    readonly root: IInsertAssignmentParams;
    readonly shipments: IReconcileAssignmentShipmentsParams;
  } {
    const shipments = assignment.shipments;
    return {
      root: {
        tenantId,
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
      shipments: {
        tenantId,
        assignmentId: assignment.id.value,
        ids: shipments.map((shipment) => shipment.id.value),
        shipmentIds: shipments.map((shipment) => shipment.shipmentId.value),
        weights: shipments.map((shipment) => shipment.weight.value),
        weightUnits: shipments.map((shipment) => shipment.weight.unit),
        lengths: shipments.map((shipment) => shipment.dimensions.length),
        widths: shipments.map((shipment) => shipment.dimensions.width),
        heights: shipments.map((shipment) => shipment.dimensions.height),
        dimensionUnits: shipments.map((shipment) => shipment.dimensions.unit),
      },
    };
  }
}
