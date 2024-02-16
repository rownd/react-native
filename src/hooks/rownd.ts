import {
  requestSignIn,
  signOut,
  manageAccount,
  getAccessToken,
  getFirebaseIdToken,
  setUserDataValue,
  setUserData,
} from '../utils/nativeModule';
import { useRowndContext } from '../components/GlobalContext';

export type TRowndContext = {
  access_token: string | null;
  auth: AuthContext;
  is_authenticated: boolean;
  is_initializing: boolean;
  firebase: {
    getIdToken: () => Promise<string>;
  }
  getAccessToken: (token?: string) => Promise<string>;
  manageAccount: () => void;
  requestSignIn: (e?: RequestSignIn) => void;
  signOut: () => void;
  user: UserContext;
};

type UserContext = {
  data: {
    user_id?: string;
    email?: string | null;
    phone?: string | null;
    [key: string]: any;
  };
  set: (data: Record<string, any>) => void;
  setValue: (key: string, value: any) => void;
};

type AuthContext = {
  access_token: string | null;
  app_id: string | null;
  is_verified_user?: boolean;
};

export type RequestSignInMethods = 'google' | 'apple' | 'default' | 'guest' | 'passkey';
export type RequestSignInIntent = 'sign_in' | 'sign_up';
export type RequestSignIn = {method?: RequestSignInMethods, postSignInRedirect?: string, intent?: RequestSignInIntent}

export function useRownd(): TRowndContext {
  const { state } = useRowndContext();

  return {
    access_token: state.auth.access_token,
    auth: state.auth,
    getAccessToken,
    firebase: {
      getIdToken: getFirebaseIdToken,
    },
    is_authenticated: !!state.auth.access_token,
    is_initializing: !state.auth.app_id,
    manageAccount,
    requestSignIn,
    signOut,
    user: {
      data: state.user.data,
      setValue: setUserDataValue,
      set: setUserData,
    },  
  };
}
