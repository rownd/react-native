# React Native Example Backend

Backend for the plain React Native and Expo examples. It runs `supertokens-node` with the Rownd plugin and serves app config to the production Hub at `https://rownd-hub.supertokens.com` by default.

## Run

Create env config:

```bash
cp example-server/.env.example example-server/.env
```

Update `example-server/.env` with your Rownd app credentials and SuperTokens Core:

```text
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
ROWND_APP_KEY=<Rownd app key used by the plugin>
ROWND_APP_SECRET=<Rownd app secret used by the plugin>
APP_KEY=test_app_key
EXAMPLE_HUB_BASE_URL=https://rownd-hub.supertokens.com
```

Run from the React Native SDK repo root:

```bash
npm run example:server
```

The backend listens on `http://localhost:3137` by default.

## Mobile URLs

- iOS Simulator can reach the backend at `http://127.0.0.1:3137`.
- Android Emulator can reach the backend at `http://10.0.2.2:3137`.
- Physical devices need an externally reachable URL, for example an ngrok or LAN URL. Set `API_DOMAIN` in `.env` and pass the same URL to the app config.

## Routes

- `GET /health`
- `GET /example-bootstrap`
- `GET /sessioninfo`
- `GET /test/protected`

Email, phone, and anonymous sign-in are enabled by default. Google and Apple are added to app config only when their credentials are present in `.env`.
