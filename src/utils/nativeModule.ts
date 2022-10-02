import { NativeModules, Platform } from 'react-native';

export const LINKING_ERROR =
  `The package '@rownd/react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

export const Rownd = NativeModules.RowndPlugin
  ? NativeModules.RowndPlugin
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const IOSRowndEventEmitter =
  Platform.OS !== 'ios'
    ? null
    : NativeModules.RowndPluginEventEmitter
    ? NativeModules.RowndPluginEventEmitter
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );

const isNotAvailableInAndroidYet = () => {
  console.log('ROWND: NOT AVAILABLE IN ANDROID YET');
  return true;
};

export function configure(appKey: string): Promise<string> {
  return Rownd.configure(appKey);
}

export function requestSignIn() {
  return Rownd.requestSignIn();
}

export function signOut() {
  return Rownd.signOut();
}

export function manageAccount() {
  return Rownd.manageAccount();
}

export function getAccessToken(): Promise<string> {
  if (isNotAvailableInAndroidYet()) return Promise.resolve('');
  return Rownd.getAccessToken();
}

export function setUserDataValue(key: string, value: any) {
  return Rownd.setUserDataValue(
    key,
    Platform.OS === 'android' ? { value } : value
  );
}

export function setUserData(data: Record<string, any>) {
  return Rownd.setUserData(data);
}

export function handleSignInLink(url: string) {
  return Rownd.handleSignInLink(url);
}
