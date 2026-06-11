import { LeaderDetail } from '../../../domain/locations/leaderDetail';
import { LocationRepository } from '../../../domain/locations/locationRepository';

export type GetLocationLeadersCommand = {
  readonly locationGroupId: string;
};

export type GetLocationLeadersResult = {
  readonly leaders: readonly LeaderDetail[];
};

export class GetLocationLeadersUseCase {
  public constructor(private readonly locationRepository: LocationRepository) {}

  public async executeAsync(command: GetLocationLeadersCommand): Promise<GetLocationLeadersResult> {
    const leaders = await this.locationRepository.findLeadersByLocationGroupId(
      command.locationGroupId
    );

    return {
      leaders
    };
  }
}
