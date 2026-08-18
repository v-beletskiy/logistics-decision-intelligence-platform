import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { CurrentExecutionContext } from "../../../../shared/access-control/authentication/current-execution-context.decorator";
import type { ExecutionContext } from "../../../../shared/app/execution/execution-context";
import { AddDriverCertificationCommand } from "../../../app/driver/commands/add-driver-certification/add-driver-certification.command";
import { AddDriverCertificationHandler } from "../../../app/driver/commands/add-driver-certification/add-driver-certification.handler";
import { ChangeDriverAvailabilityCommand } from "../../../app/driver/commands/change-driver-availability/change-driver-availability.command";
import { ChangeDriverAvailabilityHandler } from "../../../app/driver/commands/change-driver-availability/change-driver-availability.handler";
import { RegisterDriverCommand } from "../../../app/driver/commands/register-driver/register-driver.command";
import { RegisterDriverHandler } from "../../../app/driver/commands/register-driver/register-driver.handler";
import { ReinstateDriverCommand } from "../../../app/driver/commands/reinstate-driver/reinstate-driver.command";
import { ReinstateDriverHandler } from "../../../app/driver/commands/reinstate-driver/reinstate-driver.handler";
import { RemoveDriverCertificationCommand } from "../../../app/driver/commands/remove-driver-certification/remove-driver-certification.command";
import { RemoveDriverCertificationHandler } from "../../../app/driver/commands/remove-driver-certification/remove-driver-certification.handler";
import { SuspendDriverCommand } from "../../../app/driver/commands/suspend-driver/suspend-driver.command";
import { SuspendDriverHandler } from "../../../app/driver/commands/suspend-driver/suspend-driver.handler";
import { UpdateDriverCertificationCommand } from "../../../app/driver/commands/update-driver-certification/update-driver-certification.command";
import { UpdateDriverCertificationHandler } from "../../../app/driver/commands/update-driver-certification/update-driver-certification.handler";
import { UpdateDriverDetailsCommand } from "../../../app/driver/commands/update-driver-details/update-driver-details.command";
import { UpdateDriverDetailsHandler } from "../../../app/driver/commands/update-driver-details/update-driver-details.handler";
import { SearchDriversHandler } from "../../../app/driver/queries/search-drivers/search-drivers.handler";
import { SearchDriversQuery } from "../../../app/driver/queries/search-drivers/search-drivers.query";
import type {
  ChangeDriverAvailabilityRequest,
  CreatedDriverCertificationResponse,
  CreatedDriverResponse,
  DriverCertificationRequest,
  DriverCertificationRouteParams,
  DriverRouteParams,
  RegisterDriverRequest,
  SearchDriversRequest,
  SearchDriversResponse,
  UpdateDriverRequest,
} from "./driver.http-contracts";
import { DriverHttpMapper } from "./driver.http-mapper";
import {
  changeDriverAvailabilityRequestPipe,
  driverCertificationRequestPipe,
  driverCertificationRouteParamsPipe,
  driverRouteParamsPipe,
  registerDriverRequestPipe,
  searchDriversRequestPipe,
  updateDriverRequestPipe,
} from "./schemas";

@Controller({ path: "drivers", version: "1" })
export class DriverController {
  constructor(
    private readonly registerDriverHandler: RegisterDriverHandler,
    private readonly updateDriverDetailsHandler: UpdateDriverDetailsHandler,
    private readonly changeDriverAvailabilityHandler: ChangeDriverAvailabilityHandler,
    private readonly suspendDriverHandler: SuspendDriverHandler,
    private readonly reinstateDriverHandler: ReinstateDriverHandler,
    private readonly addDriverCertificationHandler: AddDriverCertificationHandler,
    private readonly updateDriverCertificationHandler: UpdateDriverCertificationHandler,
    private readonly removeDriverCertificationHandler: RemoveDriverCertificationHandler,
    private readonly searchDriversHandler: SearchDriversHandler,
  ) {}

  @Post()
  async register(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Body(registerDriverRequestPipe) request: RegisterDriverRequest,
  ): Promise<CreatedDriverResponse> {
    const driverId = await this.registerDriverHandler.exec({
      context: executionContext,
      input: new RegisterDriverCommand(
        DriverHttpMapper.toRegisterDriverInput(request),
      ),
    });
    return DriverHttpMapper.toCreatedDriverResponse(driverId);
  }

  @Get()
  async search(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Query(searchDriversRequestPipe) request: SearchDriversRequest,
  ): Promise<SearchDriversResponse> {
    const result = await this.searchDriversHandler.exec({
      context: executionContext,
      input: new SearchDriversQuery(
        DriverHttpMapper.toSearchDriversQueryInput(request),
      ),
    });
    return DriverHttpMapper.toSearchDriversResponse(result);
  }

  @Put(":driverId")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDetails(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverRouteParamsPipe) params: DriverRouteParams,
    @Body(updateDriverRequestPipe) request: UpdateDriverRequest,
  ): Promise<void> {
    return this.updateDriverDetailsHandler.exec({
      context: executionContext,
      input: new UpdateDriverDetailsCommand(
        params.driverId,
        DriverHttpMapper.toDriverDetailsInput(request),
      ),
    });
  }

  @Put(":driverId/availability")
  @HttpCode(HttpStatus.NO_CONTENT)
  changeAvailability(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverRouteParamsPipe) params: DriverRouteParams,
    @Body(changeDriverAvailabilityRequestPipe)
    request: ChangeDriverAvailabilityRequest,
  ): Promise<void> {
    return this.changeDriverAvailabilityHandler.exec({
      context: executionContext,
      input: new ChangeDriverAvailabilityCommand(
        params.driverId,
        request.available,
      ),
    });
  }

  @Put(":driverId/suspension")
  @HttpCode(HttpStatus.NO_CONTENT)
  suspend(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverRouteParamsPipe) params: DriverRouteParams,
  ): Promise<void> {
    return this.suspendDriverHandler.exec({
      context: executionContext,
      input: new SuspendDriverCommand(params.driverId),
    });
  }

  @Put(":driverId/reinstatement")
  @HttpCode(HttpStatus.NO_CONTENT)
  reinstate(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverRouteParamsPipe) params: DriverRouteParams,
  ): Promise<void> {
    return this.reinstateDriverHandler.exec({
      context: executionContext,
      input: new ReinstateDriverCommand(params.driverId),
    });
  }

  @Post(":driverId/certifications")
  async addDriverCertification(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverRouteParamsPipe) params: DriverRouteParams,
    @Body(driverCertificationRequestPipe)
    request: DriverCertificationRequest,
  ): Promise<CreatedDriverCertificationResponse> {
    const certificationId = await this.addDriverCertificationHandler.exec({
      context: executionContext,
      input: new AddDriverCertificationCommand(
        params.driverId,
        DriverHttpMapper.toDriverCertificationInput(request),
      ),
    });
    return DriverHttpMapper.toCreatedDriverCertificationResponse(
      certificationId,
    );
  }

  @Put(":driverId/certifications/:certificationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDriverCertification(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverCertificationRouteParamsPipe)
    params: DriverCertificationRouteParams,
    @Body(driverCertificationRequestPipe)
    request: DriverCertificationRequest,
  ): Promise<void> {
    return this.updateDriverCertificationHandler.exec({
      context: executionContext,
      input: new UpdateDriverCertificationCommand(
        params.driverId,
        params.certificationId,
        DriverHttpMapper.toDriverCertificationInput(request),
      ),
    });
  }

  @Delete(":driverId/certifications/:certificationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDriverCertification(
    @CurrentExecutionContext() executionContext: ExecutionContext,
    @Param(driverCertificationRouteParamsPipe)
    params: DriverCertificationRouteParams,
  ): Promise<void> {
    return this.removeDriverCertificationHandler.exec({
      context: executionContext,
      input: new RemoveDriverCertificationCommand(
        params.driverId,
        params.certificationId,
      ),
    });
  }
}
