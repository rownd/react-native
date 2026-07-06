# Expo Example

This example uses the shared backend in `../example-server`. Start it from the SDK repo root first:

```bash
cp example-server/.env.example example-server/.env
npm run example:server
```

The Expo app defaults to:

- API domain: `https://trout-uncouple-geriatric.ngrok-free.dev`
- Hub: `https://rownd-hub.supertokens.com`
- API base path: `/auth`
- app key: `test_app_key`

Run the Expo app from this directory:

```bash
npm install --ignore-scripts
npm run android
# or
npm run ios
```

The iOS example Podfile pins `RowndSupertokens` `0.1.1` from the `v0.1.1` GitHub tag while CocoaPods CDN propagation catches up. The pod exposes the Swift module as `Rownd`.

If you use a different tunnel or backend URL, update `App.tsx`.
