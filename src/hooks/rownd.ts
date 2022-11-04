import {
  requestSignIn,
  signOut,
  manageAccount,
  getAccessToken,
  setUserDataValue,
  setUserData,
} from '../utils/nativeModule';
import { useRowndContext } from '../components/GlobalContext';

export type TRowndContext = {
  requestSignIn: (e?: RequestSignIn) => void;
  signOut: () => void;
  manageAccount: () => void;
  getAccessToken: () => Promise<string>;
  user: UserContext;
  is_authenticated: boolean;
  is_initializing: boolean;
  access_token: string | null;
  auth: AuthContext;
};

type UserContext = {
  data: {
    id?: string;
    email?: string | null;
    phone?: string | null;
    [key: string]: any;
  };
  set: (data: Record<string, any>) => void;
  setValue: (key: string, value: any) => void;
  //set: (data: any) => void;
};

type AuthContext = {
  access_token: string | null;
  app_id: string | null;
  is_verified_user?: boolean;
};

export type RequestSignInMethods = 'google' | 'apple' | 'default';
export type RequestSignIn = {method?: RequestSignInMethods, postSignInRedirect?: string}

export function useRownd(): TRowndContext {
  const { state } = useRowndContext();

  return {
    requestSignIn,
    signOut,
    manageAccount,
    getAccessToken,
    user: {
      data: state.user.data,
      setValue: setUserDataValue,
      set: setUserData,
    },
    is_authenticated: !!state.auth.access_token,
    is_initializing: !!state.auth.app_id,
    auth: state.auth,
    access_token: state.auth.access_token,
  };
}
