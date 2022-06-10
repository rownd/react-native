import ky from 'ky';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import path from 'path';

import { useGlobalContext, GlobalState } from '../components/GlobalContext';
import AutoQueue from '../utils/queue';
import { useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { ActionType } from '../data/actions';

const packageJson = require(path.join(__dirname, '../../package.json'));

type RefreshTokenResp = {
  access_token: string;
  refresh_token: string;
};

const refreshQueue = new AutoQueue<RefreshTokenResp>();

export const DEFAULT_USER_AGENT = `Rownd SDK for React Native/${packageJson.version} (Language: TypeScript/JavaScript; Platform=${Platform.OS};)`;

export default function useApi() {
  const { state, dispatch } = useGlobalContext();

  const authRef = useRef({
    access_token: state.auth.access_token,
    refresh_token: state.auth.refresh_token,
  });

  useEffect(() => {
    authRef.current = {
      access_token: state.auth.access_token,
      refresh_token: state.auth.refresh_token,
    };
  }, [state.auth.access_token, state.auth.refresh_token]);

  function isNewAccessTokenNeeded(request?: Request) {
    // stateCopy = stateCopy || state;
    // Skip requests that don't need authentication
    if (
      (!!request && !request?.headers.get('authorization')) ||
      !authRef.current?.access_token
    ) {
      return false;
    }

    const tokenPayload: JwtPayload = jwt_decode(authRef.current?.access_token);

    // Shave 5 minutes off the token expiration to account for clock skew
    const tokenExpiration = (tokenPayload.exp! - 5 * 60) * 1000;
    if (tokenExpiration > Date.now()) {
      return false; // shouldn't be expired
    }

    return true;
  }

  async function _newAccessTokenFromRefreshToken(
    this: AutoQueue<RefreshTokenResp>,
    stateCopy?: GlobalState
  ) {
    stateCopy = stateCopy || state;
    if (this?._cache?.resp) {
      // logger.log('using cached refresh response');
      return this._cache.resp;
    }

    try {
      // logger.log('requesting new refresh token');
      const resp: RefreshTokenResp = await ky
        .post(`${stateCopy.config?.apiUrl}/hub/auth/token`, {
          json: {
            refresh_token: stateCopy.auth?.refresh_token,
          },
        })
        .json();

      this._cache.resp = resp;

      // Update local cache ref immediately to prevent stale auth checks
      authRef.current = {
        access_token: resp.access_token,
        refresh_token: resp.refresh_token,
      };

      dispatch({
        type: ActionType.REFRESH_TOKEN,
        payload: resp,
      });

      return resp;
    } catch (err) {
      dispatch({
        type: ActionType.SIGN_OUT,
      });

      throw err;
    }
  }

  async function newAccessTokenFromRefreshToken(
    stateCopy?: GlobalState
  ): Promise<RefreshTokenResp> {
    return await refreshQueue.enqueue(
      _newAccessTokenFromRefreshToken.bind(refreshQueue, stateCopy)
    );
  }

  const client = useRef(
    ky.extend({
      prefixUrl: state.config?.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': DEFAULT_USER_AGENT,
      },
      retry: {
        limit: 2,
        statusCodes: [401, 408, 429, 500, 502, 503, 504],
      },
      hooks: {
        beforeRequest: [
          // Auto-refresh tokens
          async (request) => {
            // Skip requests that don't need authentication
            if (!isNewAccessTokenNeeded(request)) {
              return;
            }

            const tokenResp: RefreshTokenResp =
              await newAccessTokenFromRefreshToken();

            request.headers.set(
              'Authorization',
              `Bearer ${tokenResp.access_token}`
            );
          },
        ],
        beforeRetry: [
          async ({ request /*, options, error, retryCount*/ }) => {
            // Skip requests that don't need authentication
            if (!isNewAccessTokenNeeded(request)) {
              return;
            }

            const tokenResp: RefreshTokenResp =
              await newAccessTokenFromRefreshToken();

            request.headers.set(
              'Authorization',
              `Bearer ${tokenResp.access_token}`
            );
          },
        ],
      },
    })
  ).current;

  return {
    client,
    newAccessTokenFromRefreshToken,
    isNewAccessTokenNeeded,
  };
}
