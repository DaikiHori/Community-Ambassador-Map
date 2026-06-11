# Migration Notes

## 既存 `index.js` からの対応表

| 既存処理 | 移動先 |
|---|---|
| dotenv / env | `src/config/applicationConfig.ts` |
| LibSQL client生成 | `src/infrastructure/database/libsqlClient.ts` |
| User SQL | `src/infrastructure/repositories/libsqlUserRepository.ts` |
| LocationGroup / LeaderDetail SQL | `src/infrastructure/repositories/libsqlLocationRepository.ts` |
| Google OAuth / Passport | `src/presentation/auth/passportConfig.ts` |
| `/auth/*` | `src/presentation/http/routes/authRoutes.ts` |
| `/`, `/login-page` | `src/presentation/http/routes/pageRoutes.ts` |
| `/api/locations*` | `src/presentation/http/routes/locationRoutes.ts` |
| `/api/map-config` | `src/presentation/http/routes/mapConfigRoutes.ts` |
| `app.listen` | `src/server.ts` |

## 注意

このzip内の `public/index.html` と `public/login.html` は仮ファイルです。
実運用では既存の public 配下ファイルで上書きしてください。

`prisma/dev.db` は含めていません。既存DBを `prisma/dev.db` に配置してください。
