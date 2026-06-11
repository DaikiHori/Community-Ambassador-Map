import { createApp } from './app';
import { createApplicationConfig } from './config/applicationConfig';

export function startServer(): void {
  const applicationConfig = createApplicationConfig();
  const app = createApp(applicationConfig);

  app.listen(applicationConfig.port, () => {
    console.log('=========================================');
    console.log(`Server: http://localhost:${applicationConfig.port}`);
    console.log(`DB Path: ${applicationConfig.databasePath}`);
    console.log('=========================================');
  });
}
