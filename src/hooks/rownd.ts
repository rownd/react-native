import { requestSignIn, signOut } from '../utils/nativeModule';
import { useRowndContext } from '../components/GlobalContext';
import { useEffect } from 'react';

export type TRowndContext = {
  requestSignIn: (opts?: RequestSignInOpts) => void;
  signOut: () => void;
  user: {
    data: {
      email?: string | null;
    }
  };
  is_authenticated: boolean;
  is_initializing: boolean;
  access_token: string | null;
  auth: AuthContext;
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

  useEffect(() => {
    console.log('STATE: ',state)
  },[state])

  return {
    requestSignIn,
    signOut,
    user: {
      data: state.user.data,
    },
    is_authenticated: !!state.auth.access_token,
    is_initializing: !!state.auth.app_id,
    auth: state.auth,
    access_token: state.auth.access_token
  };
}
