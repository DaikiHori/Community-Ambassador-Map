import { createClient, Client } from '@libsql/client';
import { ApplicationConfig } from '../../config/applicationConfig';

export function createLibsqlClient(applicationConfig: ApplicationConfig): Client {
  return createClient({
    url: applicationConfig.databaseUrl
  });
}
