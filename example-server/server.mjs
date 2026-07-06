import RowndMigrationPlugin from '@supertokens-plugins/rownd-nodejs';
import cors from 'cors';
import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import SuperTokens from 'supertokens-node';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import AccountLinking from 'supertokens-node/recipe/accountlinking';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import Passwordless from 'supertokens-node/recipe/passwordless';
import Session from 'supertokens-node/recipe/session';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import UserMetadata from 'supertokens-node/recipe/usermetadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnvFile(path.join(__dirname, '.env'));

const port = Number(process.env.EXAMPLE_BACKEND_PORT || process.env.PORT || 3137);
const apiBasePath = process.env.API_BASE_PATH || '/auth';
const apiDomain = process.env.API_DOMAIN || `http://localhost:${port}`;
const hubBaseUrl = process.env.EXAMPLE_HUB_BASE_URL || 'https://rownd-hub.supertokens.com';
const appName = process.env.APP_NAME || 'Rownd React Native Example';
const rowndAppKey = requireEnv('ROWND_APP_KEY');
const rowndAppSecret = requireEnv('ROWND_APP_SECRET');
const appKey = process.env.APP_KEY || rowndAppKey;
const appId = process.env.APP_ID || appKey;
const googleClientId = optionalEnv('GOOGLE_CLIENT_ID');
const googleClientSecret = optionalEnv('GOOGLE_CLIENT_SECRET');
const googleIosClientId = optionalEnv('GOOGLE_IOS_CLIENT_ID');
const appleClientId = optionalEnv('APPLE_CLIENT_ID');
const appleClientSecret = optionalEnv('APPLE_CLIENT_SECRET');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || `${hubBaseUrl},http://localhost:8081,http://127.0.0.1:8081`)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const thirdPartyProviders = [];
const signInMethods = [{ method: 'email' }, { method: 'phone' }];

if (googleClientId && googleClientSecret) {
  thirdPartyProviders.push({
    config: {
      thirdPartyId: 'google',
      clients: [
        {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      ],
    },
  });
  signInMethods.push({
    method: 'google',
    clientId: googleClientId,
    ...(googleIosClientId ? { iosClientId: googleIosClientId } : {}),
  });
}

if (appleClientId && appleClientSecret) {
  thirdPartyProviders.push({
    config: {
      thirdPartyId: 'apple',
      clients: [
        {
          clientId: appleClientId,
          clientSecret: appleClientSecret,
        },
      ],
    },
  });
  signInMethods.push({ method: 'apple', clientId: appleClientId });
}

signInMethods.push({
  method: 'anonymous',
  type: 'guest',
  displayName: 'Continue as guest',
});

SuperTokens.init({
  debug: process.env.ENABLE_DEBUG_LOGS === 'true',
  supertokens: {
    connectionURI: requireEnv('SUPERTOKENS_CONNECTION_URI'),
    ...(process.env.SUPERTOKENS_API_KEY ? { apiKey: process.env.SUPERTOKENS_API_KEY } : {}),
  },
  appInfo: {
    appName,
    apiDomain,
    websiteDomain: hubBaseUrl,
    apiBasePath,
  },
  recipeList: [
    AccountLinking.init({}),
    Session.init(),
    UserMetadata.init(),
    Passwordless.init({
      contactMethod: 'EMAIL_OR_PHONE',
      flowType: 'MAGIC_LINK',
    }),
    EmailVerification.init({
      mode: process.env.EMAIL_VERIFICATION_MODE === 'REQUIRED' ? 'REQUIRED' : 'OPTIONAL',
    }),
    ThirdParty.init({
      signInAndUpFeature: {
        providers: thirdPartyProviders,
      },
    }),
  ],
  experimental: {
    plugins: [
      RowndMigrationPlugin.init({
        rowndAppKey,
        rowndAppSecret,
        enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
        clientDomains: {
          mobile: `${hubBaseUrl}/`,
        },
        schema: {
          first_name: {
            display_name: 'First name',
            type: 'string',
            owned_by: 'user',
            user_visible: true,
            show_empty: true,
          },
          last_name: {
            display_name: 'Last name',
            type: 'string',
            owned_by: 'user',
            user_visible: true,
            show_empty: true,
          },
          email: {
            display_name: 'Email',
            type: 'string',
            owned_by: 'user',
            user_visible: true,
            show_empty: false,
          },
          phone_number: {
            display_name: 'Phone number',
            type: 'string',
            owned_by: 'user',
            user_visible: true,
            show_empty: false,
          },
          google_id: {
            display_name: 'Google ID',
            type: 'string',
            owned_by: 'app',
            user_visible: false,
            read_only: true,
            show_empty: false,
          },
        },
        appConfig: {
          id: appId,
          name: appName,
          signInMethods,
          profile: {
            accountInformation: {
              methods: {
                email: { enabled: true },
                phone: { enabled: true },
                ...(googleClientId ? { google: { enabled: true } } : {}),
                ...(appleClientId ? { apple: { enabled: true } } : {}),
              },
            },
            personalInformation: { enabled: true },
            preferences: { enabled: true },
            signOutButton: { enabled: true },
            deleteAccountButton: { enabled: true },
          },
        },
      }),
    ],
  },
});

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || allowedOrigins[0]);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'content-type',
      'authorization',
      'x-rownd-app-key',
      'ngrok-skip-browser-warning',
      ...SuperTokens.getAllCORSHeaders(),
    ],
    exposedHeaders: ['front-token', 'st-access-token', 'st-refresh-token', 'anti-csrf'],
  })
);

app.use(express.json());
app.use(middleware());

app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.get('/example-bootstrap', (_req, res) => {
  res.json({
    appKey,
    hubBaseUrl,
    supertokens: {
      appInfo: {
        apiDomain,
        apiBasePath,
      },
    },
  });
});

app.get('/sessioninfo', verifySession(), (req, res) => {
  res.json({
    status: 'OK',
    userId: req.session.getUserId(),
  });
});

app.get('/test/protected', verifySession(), (req, res) => {
  res.json({
    status: 'OK',
    userId: req.session.getUserId(),
    accessTokenPayload: req.session.getAccessTokenPayload(),
  });
});

app.use(errorHandler());

app.listen(port, () => {
  console.log(`React Native example backend listening on ${apiDomain}`);
  console.log(`SuperTokens APIs mounted at ${apiDomain}${apiBasePath}`);
  console.log(`Hub base URL: ${hubBaseUrl}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^[']|[']$/g, '')
      .replace(/^["]|["]$/g, '');
    process.env[key] ??= value;
  }
}
