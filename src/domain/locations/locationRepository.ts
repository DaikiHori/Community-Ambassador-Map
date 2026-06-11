import { LeaderDetail } from './leaderDetail';
import { LocationGroup } from './locationGroup';

export interface LocationRepository {
  findActiveLocations(): Promise<readonly LocationGroup[]>;
  findLeadersByLocationGroupId(locationGroupId: string): Promise<readonly LeaderDetail[]>;
}
