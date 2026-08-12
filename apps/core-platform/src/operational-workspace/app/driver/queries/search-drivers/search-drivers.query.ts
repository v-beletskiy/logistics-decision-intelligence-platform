import type {
  DriverSearchFilters,
  DriverSearchInput,
} from "./driver-search";

export class SearchDriversQuery {
  constructor(
    readonly filters: DriverSearchFilters,
    readonly search: DriverSearchInput,
  ) {}
}
