import { Injectable } from "@nestjs/common";
import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import type { ExecutionRequest } from "../../../../../shared/app/execution/execution-context";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DomainEventBus } from "../../../../../shared/app/messaging/domain-event-bus";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Assignment } from "../../../../domain-modules/assignment/domain/assignment.aggregate";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { AssignmentShipment } from "../../../../domain-modules/assignment/domain/assignment-shipment.entity";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { RouteStopRepository } from "../../../../domain-modules/route/domain/route-stop.repository";
import { ShipmentId } from "../../../../domain-modules/shipment/domain/shipment-id";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { AssignmentPlanningPolicy } from "../../../../domain-modules/assignment/domain/policies/assignment-planning.policy";
import { CreateAssignmentCommand } from "./create-assignment.command";

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
    transactionManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(transactionManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: ExecutionRequest<CreateAssignmentCommand>,
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
      const shipmentIds = [
        ...new Set(routeStops.map((stop) => stop.aggregate.shipmentId)),
      ].map((shipmentId) => ShipmentId.from(shipmentId));
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
