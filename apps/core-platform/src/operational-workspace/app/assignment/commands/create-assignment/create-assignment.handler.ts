import { Inject, Injectable } from "@nestjs/common";

import { Authorized } from "../../../../../shared/access-control/authorization/authorized.decorator";
import { Permission } from "../../../../../shared/access-control/permissions/permission.enum";
import { AggregateNotFoundException } from "../../../../../shared/app/exceptions/aggregate-not-found.exception";
import { CommandHandler } from "../../../../../shared/app/handlers/command-handler";
import { DistributedApplicationEventBus } from "../../../../../shared/infra/messaging/application-event-bus";
import { DomainEventBus } from "../../../../../shared/infra/messaging/domain-event-bus";
import { IntegrationEventMetadataFactory } from "../../../../../shared/infra/messaging/integration-event.factory";
import { TransactionManager } from "../../../../../shared/infra/persistence/transaction-manager";
import { Assignment } from "../../../../domain-modules/assignment/domain/assignment.aggregate";
import { AssignmentRepository } from "../../../../domain-modules/assignment/domain/assignment.repository";
import { AssignmentShipment } from "../../../../domain-modules/assignment/domain/assignment-shipment.entity";
import { DriverId } from "../../../../domain-modules/driver/domain/driver-id";
import { DriverRepository } from "../../../../domain-modules/driver/domain/driver.repository";
import { RouteId } from "../../../../domain-modules/route/domain/route-id";
import { RouteRepository } from "../../../../domain-modules/route/domain/route.repository";
import { ShipmentRepository } from "../../../../domain-modules/shipment/domain/shipment.repository";
import { VehicleId } from "../../../../domain-modules/vehicle/domain/vehicle-id";
import { VehicleRepository } from "../../../../domain-modules/vehicle/domain/vehicle.repository";
import { AssignmentPlanningPolicy } from "../../../../shared-domain/services/assignment-planning.policy";
import { CreateAssignmentCommand } from "./create-assignment.command";

@Injectable()
export class CreateAssignmentHandler extends CommandHandler {
  constructor(
    @Inject(RouteRepository) private readonly routes: RouteRepository,
    @Inject(VehicleRepository) private readonly vehicles: VehicleRepository,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(ShipmentRepository) private readonly shipments: ShipmentRepository,
    @Inject(AssignmentRepository)
    private readonly assignments: AssignmentRepository,
    private readonly assignmentPlanning: AssignmentPlanningPolicy,
    private readonly outbox: DistributedApplicationEventBus,
    private readonly integrationEventFactory: IntegrationEventMetadataFactory,
    trxManager: TransactionManager,
    domainEventBus: DomainEventBus,
  ) {
    super(trxManager, domainEventBus);
  }

  @Authorized(Permission.AssignmentManage)
  async exec(command: CreateAssignmentCommand): Promise<string> {
    const route = await this.routes.findById(RouteId.from(command.routeId));
    if (!route) throw new AggregateNotFoundException("Route");

    const vehicle = await this.vehicles.findById(
      VehicleId.from(command.vehicleId),
    );
    if (!vehicle) throw new AggregateNotFoundException("Vehicle");

    const driver = await this.drivers.findById(DriverId.from(command.driverId));
    if (!driver) throw new AggregateNotFoundException("Driver");

    const shipmentIds = [
      ...new Set(route.stops.map((stop) => stop.shipmentId)),
    ];
    const routeShipments = await this.shipments.findByIds(shipmentIds);
    if (routeShipments.length !== shipmentIds.length) {
      throw new AggregateNotFoundException(
        "One or more route shipments do not exist.",
      );
    }

    const [
      activeAssignmentByVehicle,
      activeAssignmentByDriver,
      activeAssignmentByRoute,
    ] = await Promise.all([
      this.assignments.findActiveByVehicleId(vehicle.id.value),
      this.assignments.findActiveByDriverId(driver.id.value),
      this.assignments.findActiveByRouteId(route.id.value),
    ]);

    this.assignmentPlanning.planAssignment(
      route,
      vehicle,
      driver,
      routeShipments,
      {
        activeAssignmentByVehicle,
        activeAssignmentByDriver,
        activeAssignmentByRoute,
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
      await this.outbox.publish(
        this.integrationEventFactory.create({
          eventType: "operational-workspace.route.assignment-changed",
          eventVersion: 1,
          tenantId: command.tenantId,
          initiatedByUserId: command.initiatedByUserId,
          payload: {
            routeId: route.id.value,
            assignmentId: assignment.id.value,
          },
        }),
      );
    }, assignment);

    return assignment.id.value;
  }
}
