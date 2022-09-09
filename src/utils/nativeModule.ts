import { NativeModules, Platform } from 'react-native';

export const LINKING_ERROR =
  `The package '@rownd/react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Rownd = NativeModules.RowndPlugin
  ? NativeModules.RowndPlugin
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const RowndEventEmitter = NativeModules.RowndPluginEventEmitter
  ? NativeModules.RowndPluginEventEmitter
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return Rownd.multiply(a, b);
}

export function configure(appKey: string): Promise<string> {
  return Rownd.configure(appKey);
}

export function requestSignIn() {
  return Rownd.requestSignIn();
}

export function signOut() {
  return Rownd.signOut();
}

export function manageUser() {
  return Rownd.manageUser();
}

export function hello() {
  return Rownd.hello();
}

export function getAccessToken(): Promise<string> {
  return Rownd.getAccessToken();
}

export function setUserDataValue(key: string, value: any) {
  return Rownd.setUserDataValue(key, value);
}

export function setUserData(data: any) {
  return Rownd.setUserData(data);
}
