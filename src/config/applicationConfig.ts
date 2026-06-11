import 'dotenv/config';
import path from 'path';

export type ApplicationConfig = {
  readonly port: number;
  readonly isProduction: boolean;
  readonly databasePath: string;
  readonly databaseUrl: string;
  readonly sessionSecret: string;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
  readonly googleCallbackUrl: string;
  readonly baseUrl: string;
  readonly mapInitialLatitude: number;
  readonly mapInitialLongitude: number;
  readonly mapInitialZoom: number;
};

export function createApplicationConfig(): ApplicationConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const databasePath = path.join(process.cwd(), 'prisma', 'dev.db');

  return {
    port: parseNumberOrDefault(process.env.PORT, 3000),
    isProduction,
    databasePath,
    databaseUrl: `file:${databasePath}`,
    sessionSecret: requireEnvironmentVariable('SESSION_SECRET'),
    googleClientId: requireEnvironmentVariable('GOOGLE_CLIENT_ID'),
    googleClientSecret: requireEnvironmentVariable('GOOGLE_CLIENT_SECRET'),
    googleCallbackUrl: '/auth/google/callback',
    baseUrl: requireEnvironmentVariable('BASE_URL'),
    mapInitialLatitude: parseNumberOrDefault(process.env.MAP_INIT_LAT, 35.6812),
    mapInitialLongitude: parseNumberOrDefault(process.env.MAP_INIT_LNG, 139.7671),
    mapInitialZoom: parseNumberOrDefault(process.env.MAP_INIT_ZOOM, 7)
  };
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function parseNumberOrDefault(value: string | undefined, defaultValue: number): number {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return defaultValue;
  }

  return parsedValue;
}
