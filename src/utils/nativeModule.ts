import { NativeModules, Platform } from 'react-native';
import type { RequestSignIn } from 'src/hooks/rownd';
import type { Customizations, IConfig } from './config';

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

export function configure(config: IConfig): Promise<string> {
  return Rownd.configure(config);
}

export function customizations(customizationConfig: Customizations) {
  return Rownd.customizations(customizationConfig);
}

export function requestSignIn(config?: RequestSignIn) {
  if (!config) {
    return Rownd.requestSignIn({ method: 'default' });
  }
  return Rownd.requestSignIn({
    method: config?.method,
    postSignInRedirect: config?.postSignInRedirect,
    intent: config?.intent
  });
}

export function signOut() {
  return Rownd.signOut();
}

export function manageAccount() {
  return Rownd.manageAccount();
}

export function getAccessToken(token?: string): Promise<string> {
  return Rownd.getAccessToken(token || null);
}

export function getFirebaseIdToken(): Promise<string> {
  return Rownd.getFirebaseIdToken();
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
