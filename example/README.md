# React Native Example

This example uses the shared backend in `../example-server`. The backend runs `supertokens-node` with `@supertokens-plugins/rownd-nodejs` and defaults the Hub URL to production: `https://rownd-hub.supertokens.com`.

## Backend

From the SDK repo root:

```bash
cp example-server/.env.example example-server/.env
```

Fill in `example-server/.env`:

```text
SUPERTOKENS_CONNECTION_URI=https://try.supertokens.com
ROWND_APP_KEY=<Rownd app key used by the plugin>
ROWND_APP_SECRET=<Rownd app secret used by the plugin>
APP_KEY=test_app_key
EXAMPLE_HUB_BASE_URL=https://rownd-hub.supertokens.com
```

Then run:

```bash
npm run example:server
```

The backend listens on `http://localhost:3137` by default.

## App Defaults

The app config points at the ngrok backend:

- API domain: `https://trout-uncouple-geriatric.ngrok-free.dev`
- Hub: `https://rownd-hub.supertokens.com`
- API base path: `/auth`
- app key: `test_app_key`

If you use a different tunnel or backend URL, update the app config in `src/App.tsx`.

## Run

Install dependencies from this example directory:

```bash
npm install --ignore-scripts
```

Start Metro:

```bash
npm start
```

Run Android:

```bash
npm run android
```

Run iOS:

```bash
cd ios
pod install
cd ..
npm run ios
```

The iOS example Podfile pins `RowndSupertokens` `0.1.1` from the `v0.1.1` GitHub tag while CocoaPods CDN propagation catches up. The pod exposes the Swift module as `Rownd`.

Magic-link callbacks use the `rowndsupertokens://` scheme configured in the native Android manifest and iOS `Info.plist`.
