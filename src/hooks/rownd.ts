import {
  requestSignIn,
  signOut,
  manageAccount,
  getAccessToken,
  setUserDataValue,
  setUserData,
} from '../utils/nativeModule';
import { useRowndContext } from '../components/GlobalContext';
import type {
  RequestSignIn,
  RequestSignInMethods,
  RequestSignInIntent,
} from '../types';

export type { RequestSignIn, RequestSignInMethods, RequestSignInIntent };

export type TRowndContext = {
  access_token: string | null;
  auth: AuthContext;
  is_authenticated: boolean;
  is_initializing: boolean;
  getAccessToken: () => Promise<string>;
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
  isLoading: boolean;
};

type AuthContext = {
  access_token: string | null;
  app_id: string | null;
  is_verified_user?: boolean;
  auth_level?: string | null;
};

export function useRownd(): TRowndContext {
  const { state } = useRowndContext();

  return {
    access_token: state.auth.access_token,
    auth: state.auth,
    getAccessToken,
    is_authenticated: !!state.auth.access_token,
    is_initializing: !state.auth.app_id,
    manageAccount,
    requestSignIn,
    signOut,
    user: {
      data: state.user.data,
      setValue: setUserDataValue,
      set: setUserData,
      isLoading: state.user.isLoading,
    },
  };
}
