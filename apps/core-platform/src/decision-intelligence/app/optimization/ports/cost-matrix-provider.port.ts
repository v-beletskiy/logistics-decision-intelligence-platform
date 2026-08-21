import type { GeoCoordinateProps } from "../../../../shared/domain/shared-kernel/value-objects/location/geo-coordinate";
import type { CostMatrix } from "../../../domain-modules/optimization/domain/cost-matrix";

/** Computes the road-network cost matrix for a set of points. */
export abstract class CostMatrixProvider {
  abstract compute(
    points: readonly GeoCoordinateProps[],
  ): Promise<CostMatrix>;
}