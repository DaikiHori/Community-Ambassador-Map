export type User = {
  readonly id?: string | number;
  readonly email: string;
  readonly isActive?: number | boolean;
  readonly lastLoginAt?: string | null;
};
