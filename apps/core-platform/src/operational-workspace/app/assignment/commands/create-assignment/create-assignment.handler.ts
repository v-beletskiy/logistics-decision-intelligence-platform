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
import { ShipmentId } from "../../../../domain-modules/shipment/domain/shipment-id";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { AssignmentPlanningPolicy } from "../../../../shared-domain/policies/assignment-planning.policy";
import { CreateAssignmentCommand } from "./create-assignment.command";

@Injectable()
export class CreateAssignmentHandler extends CommandHandler {
  constructor(
    private readonly routes: RouteRepository,
    private readonly vehicles: VehicleRepository,
    private readonly drivers: DriverRepository,
    private readonly shipments: ShipmentRepository,
    private readonly assignments: AssignmentRepository,
    private readonly assignmentPlanning: AssignmentPlanningPolicy,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(
    request: ExecutionRequest<CreateAssignmentCommand>,
  ): Promise<string> {
    const { context, input: command } = request;
    const route = await this.routes.findById(RouteId.from(command.routeId));
    if (!route) throw new AggregateNotFoundException("Route");

    const vehicle = await this.vehicles.findById(
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    const loadedDriver = await this.drivers.findById(
      context.tenantId,
      DriverId.from(command.driverId),
    );
    if (!loadedDriver) throw new AggregateNotFoundException("Driver");
    const driver = loadedDriver.aggregate;

    const shipmentIds = [
      ...new Set(route.stops.map((stop) => stop.shipmentId)),
    ].map((shipmentId) => ShipmentId.from(shipmentId));
    const routeShipments = await this.shipments.findByIds(shipmentIds);
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
      this.assignments.existsActiveForVehicle(vehicle.id),
      this.assignments.existsActiveForDriver(driver.id),
      this.assignments.existsActiveForRoute(route.id),
    ]);

    this.assignmentPlanning.assertCanCreateAssignment(
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

    await this.execTrxWithDomainEvents(async () => {
      await this.assignments.save(assignment);
    }, assignment);

    return assignment.id.value;
  }
}
