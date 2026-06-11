import { LocationGroup } from '../../../domain/locations/locationGroup';
import { LocationRepository } from '../../../domain/locations/locationRepository';

export type GetActiveLocationsResult = {
  readonly locations: readonly LocationGroup[];
};

export class GetActiveLocationsUseCase {
  public constructor(private readonly locationRepository: LocationRepository) {}

  public async executeAsync(): Promise<GetActiveLocationsResult> {
    const locations = await this.locationRepository.findActiveLocations();

    return {
      locations
    };
  }
}
