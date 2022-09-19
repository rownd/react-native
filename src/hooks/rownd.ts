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
  requestSignIn: (opts?: RequestSignInOpts) => void;
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
  // set: (data: Record<string, any>) => void;
  setValue: (key: string, value: any) => void;
  set: (data: any) => void;
};

type AuthContext = {
  access_token: string | null;
  app_id: string | null;
  is_verified_user?: boolean;
};

type RequestSignInOpts = {
  identifier?: string;
  auto_sign_in?: boolean;
  init_data?: Record<string, any>;
  post_login_redirect?: string;
};

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
