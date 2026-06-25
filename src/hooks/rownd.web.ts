import { useRownd as useReactRownd } from '@supertokens/rownd-react';
import type { TRowndContext } from './rownd';
import type { RequestSignIn } from '../types';

function toWebSignInOptions(opts?: RequestSignIn) {
  if (!opts) {
    return undefined;
  }

  const method = opts.method === 'guest' ? 'anonymous' : opts.method;

  return {
    ...opts,
    method,
    post_login_redirect: opts.postSignInRedirect,
  };
}

export function useRownd(): TRowndContext {
  const {
    requestSignIn,
    signOut,
    getAccessToken,
    is_authenticated,
    is_initializing,
    auth,
    access_token,
    user,
    manageAccount,
    setUser,
    setUserValue,
  } = useReactRownd() as any;

  return {
    access_token,
    auth: {
      access_token,
      app_id: auth.app_id || null,
      is_verified_user: auth.is_verified_user,
      auth_level: auth.auth_level,
    },
    // @ts-ignore
    getAccessToken,
    is_authenticated,
    is_initializing,
    manageAccount,
    requestSignIn: (opts) => requestSignIn(toWebSignInOptions(opts)),
    signOut,
    user: {
      data: user.data,
      setValue: setUserValue,
      set: setUser,
      isLoading: Boolean(user.isLoading ?? user.is_loading),
    },
  };
}
