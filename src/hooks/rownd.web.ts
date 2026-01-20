import { useRownd as useReactRownd } from '@rownd/react';
import type { TRowndContext } from './rownd';

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
  } = useReactRownd();

  return {
    access_token,
    auth: {
      access_token,
      app_id: auth.app_id || null,
      is_verified_user: auth.is_verified_user,
    },
    // @ts-ignore
    getAccessToken,
    is_authenticated,
    is_initializing,
    manageAccount,
    requestSignIn: (opts) =>
      requestSignIn({ ...opts, post_login_redirect: opts?.postSignInRedirect }),
    signOut,
    user: {
      data: user.data,
      setValue: setUserValue,
      set: setUser,
      isLoading: false, // Waiting for react sdk update
    },
  };
}
