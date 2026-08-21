import { Injectable } from "@nestjs/common";

import { HttpClient } from "../../../../shared/infra/http/http-client";
import type { VroomRequest, VroomSolution } from "./vroom-request";

@Injectable()
export class VroomClient {
  constructor(private readonly httpClient: HttpClient) {}

  async optimize(
    baseUrl: string,
    request: VroomRequest,
  ): Promise<VroomSolution> {
    return this.httpClient.post<VroomSolution>(`${baseUrl}/`, request);
  }
}