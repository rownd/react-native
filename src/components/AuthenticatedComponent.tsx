import React, { useEffect } from 'react';

const { useRownd } = require('../hooks/rownd');

interface IAuthenticatedComponentProps {
  shouldRequestSignIn?: boolean;
  renderContentWhenUnauthenticated?: boolean;
}

export default function ({
  shouldRequestSignIn,
  renderContentWhenUnauthenticated,
  children,
}: React.PropsWithChildren<IAuthenticatedComponentProps>) {
  const { is_authenticated, requestSignIn } = useRownd();

  useEffect(() => {
    if (shouldRequestSignIn && !is_authenticated) {
      requestSignIn();
    }
  }, [is_authenticated, requestSignIn, shouldRequestSignIn]);

  return (
    <>
      {(is_authenticated || renderContentWhenUnauthenticated) && (
        <>{children}</>
      )}
    </>
  );
}
