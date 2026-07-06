import type { TRowndContext } from '../hooks/rownd';
import { ActionType } from '../constants/action';
import { initialRowndState, rowndReducer } from '../reducer/rowndReducer';
import type { RequestSignIn } from '../types';

const mockRequestSignIn = jest.fn();
const mockGetAccessToken = jest.fn();

function loadNativeModule() {
  jest.resetModules();
  const reactNative = require('react-native');
  reactNative.NativeModules.RowndPlugin = {
    configure: jest.fn(),
    customizations: jest.fn(),
    requestSignIn: mockRequestSignIn,
    signOut: jest.fn(),
    manageAccount: jest.fn(),
    getAccessToken: mockGetAccessToken,
    setUserDataValue: jest.fn(),
    setUserData: jest.fn(),
    handleSignInLink: jest.fn(),
  };
  reactNative.Platform.OS = 'ios';
  reactNative.Platform.select = (values: Record<string, string>) => values.ios;

  return require('../utils/nativeModule') as typeof import('../utils/nativeModule');
}

describe('native module auth forwarding', () => {
  beforeEach(() => {
    mockRequestSignIn.mockClear();
    mockGetAccessToken.mockClear();
  });

  it('defaults requestSignIn to the Hub default method', () => {
    const { requestSignIn } = loadNativeModule();

    requestSignIn();

    expect(mockRequestSignIn).toHaveBeenCalledWith({ method: 'default' });
  });

  it('normalizes guest to anonymous before forwarding', () => {
    const { requestSignIn } = loadNativeModule();

    requestSignIn({ method: 'guest' });
    requestSignIn({ method: 'anonymous' });

    expect(mockRequestSignIn).toHaveBeenNthCalledWith(1, {
      method: 'anonymous',
      postSignInRedirect: undefined,
      intent: undefined,
    });
    expect(mockRequestSignIn).toHaveBeenNthCalledWith(2, {
      method: 'anonymous',
      postSignInRedirect: undefined,
      intent: undefined,
    });
  });

  it('does not forward legacy token input when requesting an access token', () => {
    const { getAccessToken } = loadNativeModule();

    getAccessToken();

    expect(mockGetAccessToken).toHaveBeenCalledWith();
  });
});

describe('rowndReducer', () => {
  it('handles SuperTokens-backed native auth state without a refresh token', () => {
    const nextState = rowndReducer(initialRowndState, {
      type: ActionType.UPDATE_STATE,
      payload: {
        auth: {
          access_token: 'st-access-token',
          auth_level: 'verified',
        },
        user: {
          data: { email: 'test@example.com' },
          is_loading: true,
        },
        appConfig: { id: 'app_123', schema: {} },
      },
    });

    expect(nextState.auth.access_token).toBe('st-access-token');
    expect(nextState.auth.refresh_token).toBeNull();
    expect(nextState.auth.app_id).toBe('app_123');
    expect(nextState.auth.auth_level).toBe('verified');
    expect(nextState.user.isLoading).toBe(true);
  });

  it('does not throw when native state is missing appConfig', () => {
    const nextState = rowndReducer(initialRowndState, {
      type: ActionType.UPDATE_STATE,
      payload: {
        auth: { access_token: 'st-access-token' },
        user: { data: {} },
      },
    });

    expect(nextState.auth.app_id).toBeNull();
    expect(nextState.app.schema).toBeNull();
  });
});

function assertRemovedTypes(rownd: TRowndContext) {
  // @ts-expect-error Firebase is no longer part of the public API.
  rownd.firebase;

  // @ts-expect-error getAccessToken no longer accepts a legacy Rownd token.
  rownd.getAccessToken('legacy-rownd-token');

  // @ts-expect-error Passkeys are not supported by the SuperTokens-backed RN SDK.
  const passkeyRequest: RequestSignIn = { method: 'passkey' };

  return passkeyRequest;
}

expect(assertRemovedTypes).toBeDefined();
