import React from 'react';
import type { RowndProviderConfig } from '../types';
import type { ReactTestRenderer } from 'react-test-renderer';
import type { TRowndContext } from '../hooks/rownd';

const testGlobal = global as typeof globalThis & { MessageChannel?: unknown };
const originalMessageChannel = testGlobal.MessageChannel;
// React 17 scheduler keeps MessageChannel open under newer Node versions.
delete testGlobal.MessageChannel;
const TestRenderer =
  require('react-test-renderer') as typeof import('react-test-renderer');
const { act } = TestRenderer;

const mockRemove = jest.fn();
const mockNativeEventAddListener = jest.fn();
const mockPlatform = {
  OS: 'ios',
  select: (values: Record<string, string>) => values.ios,
};
const mockRowndPlugin = {
  configure: jest.fn(),
  customizations: jest.fn(),
  requestSignIn: jest.fn(),
  signOut: jest.fn(),
  manageAccount: jest.fn(),
  getAccessToken: jest.fn(),
  setUserDataValue: jest.fn(),
  setUserData: jest.fn(),
  handleSignInLink: jest.fn(),
};
const mockGetInitialURL = jest.fn();
const mockAddEventListener = jest.fn();

jest.mock('react-native', () => {
  return {
    NativeModules: {
      RowndPlugin: mockRowndPlugin,
      RowndPluginEventEmitter: {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: mockNativeEventAddListener,
    })),
    LogBox: {
      ignoreLogs: jest.fn(),
    },
    Platform: mockPlatform,
    Linking: {
      getInitialURL: mockGetInitialURL,
      addEventListener: mockAddEventListener,
    },
  };
});

const { RowndProvider } =
  require('../components/GlobalContext') as typeof import('../components/GlobalContext');
const { useRownd } =
  require('../hooks/rownd') as typeof import('../hooks/rownd');

const config: RowndProviderConfig = {
  appKey: 'test_app_key',
  supertokens: {
    appInfo: {
      appName: 'React Native Test',
      apiDomain: 'http://10.0.2.2:3137',
      apiBasePath: '/auth',
    },
  },
  hubUrlOverride: 'http://10.0.2.2:8787',
  deepLinkScheme: 'rowndsupertokens',
};

function flushPromises() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

describe('RowndProvider', () => {
  afterAll(() => {
    testGlobal.MessageChannel = originalMessageChannel;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatform.OS = 'ios';
    mockAddEventListener.mockReturnValue({ remove: mockRemove });
    mockNativeEventAddListener.mockReturnValue({ remove: jest.fn() });
    mockGetInitialURL.mockResolvedValue(null);
  });

  it('forwards provider config and customizations to the native module', async () => {
    const customizations = { sheetCornerBorderRadius: '18' };

    await act(async () => {
      TestRenderer.create(
        <RowndProvider config={config} customizations={customizations} />
      );
      await flushPromises();
    });

    expect(mockRowndPlugin.configure).toHaveBeenCalledWith(config);
    expect(mockRowndPlugin.customizations).toHaveBeenCalledWith(customizations);
  });

  it('forwards initial and runtime deep links to the native module', async () => {
    const initialUrl =
      'rowndsupertokens://account/login?preAuthSessionId=pid#abc';
    const runtimeUrl =
      'rowndsupertokens://account/verify-email?token=token_123';
    mockGetInitialURL.mockResolvedValue(initialUrl);

    await act(async () => {
      TestRenderer.create(<RowndProvider config={config} />);
      await flushPromises();
    });

    expect(mockRowndPlugin.handleSignInLink).toHaveBeenCalledWith(initialUrl);

    const listener = mockAddEventListener.mock.calls[0][1];
    listener({ url: runtimeUrl });

    expect(mockRowndPlugin.handleSignInLink).toHaveBeenCalledWith(runtimeUrl);
  });

  it('removes the deep-link listener on unmount', async () => {
    let renderer: ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(<RowndProvider config={config} />);
      await flushPromises();
    });

    act(() => {
      renderer.unmount();
    });

    expect(mockRemove).toHaveBeenCalled();
  });

  it('updates hook state from iOS native update_state events', async () => {
    let latest: TRowndContext | undefined;
    const Probe = () => {
      latest = useRownd();
      return null;
    };

    await act(async () => {
      TestRenderer.create(
        <RowndProvider config={config}>
          <Probe />
        </RowndProvider>
      );
      await flushPromises();
    });

    const updateStateListener = mockNativeEventAddListener.mock.calls.find(
      ([eventName]) => eventName === 'update_state'
    )[1];

    act(() => {
      updateStateListener({
        auth: {
          access_token: 'ios-st-access-token',
          auth_level: 'verified',
        },
        user: {
          data: { email: 'ios@example.com' },
          is_loading: true,
        },
        appConfig: { id: 'app_ios', schema: {} },
      });
    });

    expect(latest?.is_authenticated).toBe(true);
    expect(latest?.is_initializing).toBe(false);
    expect(latest?.access_token).toBe('ios-st-access-token');
    expect(latest?.auth.auth_level).toBe('verified');
    expect(latest?.user.data.email).toBe('ios@example.com');
    expect(latest?.user.isLoading).toBe(true);
  });

  it('updates hook state from Android JSON update_state events', async () => {
    mockPlatform.OS = 'android';
    let latest: TRowndContext | undefined;
    const Probe = () => {
      latest = useRownd();
      return null;
    };

    await act(async () => {
      TestRenderer.create(
        <RowndProvider config={config}>
          <Probe />
        </RowndProvider>
      );
      await flushPromises();
    });

    const updateStateListener = mockNativeEventAddListener.mock.calls.find(
      ([eventName]) => eventName === 'update_state'
    )[1];

    act(() => {
      updateStateListener({
        state: JSON.stringify({
          auth: {
            access_token: 'android-st-access-token',
            auth_level: 'instant',
          },
          user: {
            data: { email: 'android@example.com' },
            isLoading: false,
          },
          appConfig: { id: 'app_android', schema: {} },
        }),
      });
    });

    expect(latest?.is_authenticated).toBe(true);
    expect(latest?.is_initializing).toBe(false);
    expect(latest?.access_token).toBe('android-st-access-token');
    expect(latest?.auth.auth_level).toBe('instant');
    expect(latest?.user.data.email).toBe('android@example.com');
    expect(latest?.user.isLoading).toBe(false);
  });
});
