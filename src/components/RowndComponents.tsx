import React from 'react';
import { SignIn } from './SignIn';
import { AutoSigninDialog } from './AutoSigninDialog';
import { useGlobalContext } from './GlobalContext';

export function RowndComponents() {
  const { state } = useGlobalContext();
  // useDeviceContext(tw);

  return (
    <>
      {state.nav.current_route === '/account/login' && <SignIn />}
      {state.nav.current_route === '/account/auto-signin' && (
        <AutoSigninDialog />
      )}
    </>
  );
}
