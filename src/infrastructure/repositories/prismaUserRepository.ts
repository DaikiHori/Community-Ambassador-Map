import { PrismaClient } from '@prisma/client';
import { UserRepository, User } from '../../domain/users/userRepository';

export class PrismaUserRepository implements UserRepository {
  public constructor(private readonly prismaClient: PrismaClient) {}

  public async findActiveByEmail(email: string): Promise<User | null> {
    const userRecord = await this.prismaClient.user.findFirst({
      where: {
        email,
        isActive: true,
      },
    });

    if (!userRecord) {
      return null;
    }

    return {
      id: userRecord.id,
      email: userRecord.email,
      isActive: userRecord.isActive,
    };
  }
}