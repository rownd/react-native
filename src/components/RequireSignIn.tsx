import React, {
  FunctionComponent,
  useEffect,
} from 'react';
import { useRownd } from '..';
import type { RequestSignIn } from 'src/hooks/rownd';

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
      requestSignIn({ ...signInProps });
    }
  }, [is_authenticated, is_initializing, requestSignIn]);

  if (is_initializing && initializing) {
    return <>{initializing}</>;
  }

  return <>{children}</>;
};

export default RequireSignIn;
