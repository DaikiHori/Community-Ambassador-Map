import { User } from '../../../domain/users/user';
import { UserRepository } from '../../../domain/users/userRepository';

export type FindUserByEmailCommand = {
  readonly email: string;
};

export class FindUserByEmailUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async executeAsync(command: FindUserByEmailCommand): Promise<User | null> {
    return await this.userRepository.findByEmail(command.email);
  }
}
