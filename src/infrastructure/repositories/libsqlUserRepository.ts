import { Client, Row } from '@libsql/client';
import { User } from '../../domain/users/user';
import { UserRepository } from '../../domain/users/userRepository';

export class LibsqlUserRepository implements UserRepository {
  public constructor(private readonly client: Client) {}

  public async findByEmail(email: string): Promise<User | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM User WHERE email = ?',
      args: [email]
    });

    return this.toUserOrNull(result.rows[0]);
  }

  public async findActiveByEmail(email: string): Promise<User | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM User WHERE email = ? AND isActive = 1',
      args: [email]
    });

    return this.toUserOrNull(result.rows[0]);
  }

  public async updateLastLoginAt(email: string): Promise<void> {
    await this.client.execute({
      sql: 'UPDATE User SET lastLoginAt = CURRENT_TIMESTAMP WHERE email = ?',
      args: [email]
    });
  }

  private toUserOrNull(row: Row | undefined): User | null {
    if (!row) {
      return null;
    }

    return row as unknown as User;
  }
}
