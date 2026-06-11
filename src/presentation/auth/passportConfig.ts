import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ApplicationConfig } from '../../config/applicationConfig';
import { AuthenticateGoogleUserUseCase } from '../../application/usecases/auth/authenticateGoogleUserUseCase';
import { FindUserByEmailUseCase } from '../../application/usecases/auth/findUserByEmailUseCase';
import { User } from '../../domain/users/user';

type ConfigurePassportParameters = {
  readonly passport: PassportStatic;
  readonly applicationConfig: ApplicationConfig;
  readonly authenticateGoogleUserUseCase: AuthenticateGoogleUserUseCase;
  readonly findUserByEmailUseCase: FindUserByEmailUseCase;
};

export function configurePassport(parameters: ConfigurePassportParameters): void {
  parameters.passport.serializeUser((user, done) => {
    const authenticatedUser = user as User;
    done(null, authenticatedUser.email);
  });

  parameters.passport.deserializeUser(async (email, done) => {
    try {
      const user = await parameters.findUserByEmailUseCase.executeAsync({
        email: String(email)
      });

      done(null, user ?? false);
    } catch (error) {
      done(error);
    }
  });

  parameters.passport.use(new GoogleStrategy({
    clientID: parameters.applicationConfig.googleClientId,
    clientSecret: parameters.applicationConfig.googleClientSecret,
    callbackURL: parameters.applicationConfig.googleCallbackUrl,
    scope: ['profile', 'email']
  }, async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(null, false, { message: 'Email was not provided by Google profile.' });
      }

      const result = await parameters.authenticateGoogleUserUseCase.executeAsync({ email });

      if (!result.succeeded) {
        return done(null, false, { message: 'Access Denied' });
      }

      return done(null, result.user);
    } catch (error) {
      return done(error as Error);
    }
  }));
}
