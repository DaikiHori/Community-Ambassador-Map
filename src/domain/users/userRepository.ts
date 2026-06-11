import { User } from './user';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findActiveByEmail(email: string): Promise<User | null>;
  updateLastLoginAt(email: string): Promise<void>;
}
