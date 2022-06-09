import jwt_decode from 'jwt-decode';

type TokenInput = Record<string, any> | string;

// Make sure token is always in a decoded form
function normalizeToken(token: TokenInput): Record<string, any> {
  if (typeof token === 'string') {
    return jwt_decode(token);
  }

  return token;
}

export function getAppId(token: TokenInput) {
  token = normalizeToken(token);

  return token?.aud
    ?.find((aud: string) => aud.startsWith('app:'))
    ?.substring(4);
}

export function getUserId(token: TokenInput) {
  token = normalizeToken(token);

  return token?.sub;
}
