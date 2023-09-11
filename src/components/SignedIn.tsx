import React from 'react';
import { useRownd } from '../hooks/rownd';

interface SignedInProps {
  children: React.ReactNode;
}

const SignedIn: React.FC<SignedInProps> = ({ children }) => {
  const { is_authenticated } = useRownd();

  if (!is_authenticated) {
    return null;
  }
  return <>{children}</>;
};

export default SignedIn;