import React from 'react'
import { useRownd } from '../hooks/rownd';

interface SignedOutProps {
  children: React.ReactNode;
}

const SignedOut: React.FC<SignedOutProps> = ({ children }) => {
  const { is_authenticated } = useRownd();

  if (is_authenticated) {
    return null;
  }
  return <>{children}</>;
};

export default SignedOut