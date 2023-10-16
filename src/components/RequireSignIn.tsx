import React, { FunctionComponent, useEffect } from 'react';
import { useRownd } from '..';
import type { RequestSignIn } from 'src/hooks/rownd';
import { Platform } from 'react-native';

export type ContextProps = {
  children?: React.ReactNode;
  initializing?: React.ReactNode;
  signInProps?: RequestSignIn;
};

const RequireSignIn: FunctionComponent<ContextProps> = ({
  children,
  initializing,
  signInProps,
}) => {
  const { is_authenticated, is_initializing, requestSignIn } = useRownd();

  useEffect(() => {
    if (!is_authenticated && !is_initializing) {
      requestSignIn({
        ...(Platform.OS === 'web' ? { prevent_closing: true } : undefined),
        ...signInProps,
      });
    }
  }, [is_authenticated, is_initializing, signInProps]);

  if (is_initializing && initializing) {
    return <>{initializing}</>;
  }

  return <>{children}</>;
};

export default RequireSignIn;
