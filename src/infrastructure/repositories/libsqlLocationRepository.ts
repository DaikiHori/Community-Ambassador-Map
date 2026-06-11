import { Client } from '@libsql/client';
import { LeaderDetail } from '../../domain/locations/leaderDetail';
import { LocationGroup } from '../../domain/locations/locationGroup';
import { LocationRepository } from '../../domain/locations/locationRepository';

export class LibsqlLocationRepository implements LocationRepository {
  public constructor(private readonly client: Client) {}

  public async findActiveLocations(): Promise<readonly LocationGroup[]> {
    const result = await this.client.execute(
      'SELECT * FROM LocationGroup WHERE isActive = 1'
    );

    return result.rows as unknown as readonly LocationGroup[];
  }

  public async findLeadersByLocationGroupId(locationGroupId: string): Promise<readonly LeaderDetail[]> {
    const result = await this.client.execute({
      sql: `
        SELECT nickname, trainerName, imageUrl, comment
        FROM LeaderDetail
        WHERE locationGroupId = ?
      `,
      args: [locationGroupId]
    });

    return result.rows as unknown as readonly LeaderDetail[];
  }
}
