import { Injectable } from "@nestjs/common";
import { Authorized } from "../../../../../../../shared/modules/access-control/app/authorization/authorized.decorator.js";
import { Permission } from "../../../../../../../shared/modules/access-control/app/permissions/permission.enum.js";
import type { UseCaseRequest } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context.js";
import { AggregateNotFoundException } from "../../../../../../../shared/app/app.exceptions.js";
import { CommandHandler } from "../../../../../../../shared/app/handlers/command-handler.js";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus.js";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager.js";
import { Assignment } from "../../../domain/assignment.aggregate.js";
import { AssignmentRepository } from "../../../domain/assignment.repository.js";
import { AssignmentShipment } from "../../../domain/assignment-shipment.entity.js";
import { DriverId } from "../../../../driver/domain/driver-id.js";
import { DriverRepository } from "../../../../driver/domain/driver.repository.js";
import { RouteId } from "../../../../route/domain/route-id.js";
import { RouteRepository } from "../../../../route/domain/route.repository.js";
import { RouteStopRepository } from "../../../../route/domain/route-stop.repository.js";
import { ShipmentId } from "../../../../shipment/domain/shipment-id.js";
import { ShipmentRepository } from "../../../../shipment/domain/shipment.repository.js";
import { VehicleId } from "../../../../vehicle/domain/vehicle-id.js";
import { VehicleRepository } from "../../../../vehicle/domain/vehicle.repository.js";
import { AssignmentPlanningPolicy } from "../../../../../domain/assignment-planning.policy.js";
import { CreateAssignmentCommand } from "./create-assignment.command.js";

@Injectable()
export class CreateAssignmentHandler extends CommandHandler {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly routeStopRepository: RouteStopRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly driverRepository: DriverRepository,
    private readonly shipmentRepository: ShipmentRepository,
    private readonly assignmentRepository: AssignmentRepository,
    private readonly assignmentPlanningPolicy: AssignmentPlanningPolicy,
    trxManager: TrxManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: UseCaseRequest<CreateAssignmentCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    return this.execUseCaseTrx(async () => {
      const loadedRoute = await this.routeRepository.findById(
        context.tenantId,
        RouteId.from(command.routeId),
      );
      if (!loadedRoute) throw new AggregateNotFoundException("Route");
      const route = loadedRoute.aggregate;

      const loadedVehicle = await this.vehicleRepository.findById(
        context.tenantId,
        VehicleId.from(command.vehicleId),
      );
      if (!loadedVehicle) throw new AggregateNotFoundException("Vehicle");
      const vehicle = loadedVehicle.aggregate;

      const loadedDriver = await this.driverRepository.findById(
        context.tenantId,
        DriverId.from(command.driverId),
      );
      if (!loadedDriver) throw new AggregateNotFoundException("Driver");
      const driver = loadedDriver.aggregate;

      const routeStops = await this.routeStopRepository.findAllByRouteId(
        context.tenantId,
        route.id,
      );
      const seenShipmentIds = new Set<string>();
      const shipmentIds: ShipmentId[] = [];
      for (const stop of routeStops) {
        const shipmentId = stop.aggregate.shipmentId;
        if (!seenShipmentIds.has(shipmentId.value)) {
          seenShipmentIds.add(shipmentId.value);
          shipmentIds.push(shipmentId);
        }
      }
      const routeShipments = await this.shipmentRepository.findByIds(
        context.tenantId,
        shipmentIds,
      );
      if (routeShipments.length !== shipmentIds.length) {
        throw new AggregateNotFoundException(
          "One or more route shipments do not exist.",
        );
      }

      const [
        vehicleHasActiveAssignment,
        driverHasActiveAssignment,
        routeHasActiveAssignment,
      ] = await Promise.all([
        this.assignmentRepository.existsActiveForVehicle(
          context.tenantId,
          vehicle.id,
        ),
        this.assignmentRepository.existsActiveForDriver(
          context.tenantId,
          driver.id,
        ),
        this.assignmentRepository.existsActiveForRoute(
          context.tenantId,
          route.id,
        ),
      ]);

      this.assignmentPlanningPolicy.assertCanCreateAssignment(
        route,
        vehicle,
        driver,
        routeShipments,
        {
          vehicleHasActiveAssignment,
          driverHasActiveAssignment,
          routeHasActiveAssignment,
        },
      );

      const assignment = Assignment.create({
        routeId: route.id,
        vehicleId: vehicle.id,
        driverId: driver.id,
        shipments: routeShipments.map((shipment) =>
          AssignmentShipment.create({
            shipmentId: shipment.id,
            weight: shipment.weight,
            dimensions: shipment.dimensions,
          }),
        ),
      });
      await this.assignmentRepository.add(context.tenantId, assignment);

      return { result: assignment.id.value, eventsFrom: [assignment] };
    });
  }
}
