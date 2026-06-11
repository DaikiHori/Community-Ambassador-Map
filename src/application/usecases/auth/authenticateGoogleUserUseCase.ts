import { User } from '../../../domain/users/user';
import { UserRepository } from '../../../domain/users/userRepository';

export type AuthenticateGoogleUserCommand = {
  readonly email: string;
};

export type AuthenticateGoogleUserResult =
  | {
      readonly succeeded: true;
      readonly user: User;
    }
  | {
      readonly succeeded: false;
      readonly reason: 'AccessDenied';
    };

export class AuthenticateGoogleUserUseCase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async executeAsync(command: AuthenticateGoogleUserCommand): Promise<AuthenticateGoogleUserResult> {
    const user = await this.userRepository.findActiveByEmail(command.email);

    if (!user) {
      return {
        succeeded: false,
        reason: 'AccessDenied'
      };
    }

    await this.userRepository.updateLastLoginAt(command.email);

    return {
      succeeded: true,
      user
    };
  }
}
