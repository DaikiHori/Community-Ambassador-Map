# Community Ambassador Map TypeScript Refactor

既存の `index.js` 一枚構成を、TypeScript + レイヤード構成に分割したサンプル一式です。

## 起動方法

```bash
npm install
cp .env.example .env
npm run dev
```

本番相当で起動する場合:

```bash
npm run build
npm start
```

## 既存資産の置き場所

- 既存の `public/index.html` は `public/index.html` に配置してください。
- 既存の `public/login.html` は `public/login.html` に配置してください。
- 既存の `prisma/dev.db` は `prisma/dev.db` に配置してください。

## 設計方針

- `src/index.ts` は起動だけ。
- `src/server.ts` は listen だけ。
- `src/app.ts` は DI と Express 配線だけ。
- SQL は `infrastructure/repositories` に閉じ込める。
- Passport / Express / LibSQL の都合を UseCase に漏らさない。
- APIレスポンスは既存フロント互換を優先し、`lat` / `lng` などは現状維持。

## 主なエンドポイント

- `POST /auth/google`
- `GET /auth/google/callback`
- `POST /auth/google/callback`
- `GET /logout`
- `GET /`
- `GET /login-page`
- `GET /api/locations`
- `GET /api/locations/:id`
- `GET /api/map-config`
