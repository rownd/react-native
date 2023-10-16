import React from 'react';
import type { ContextProps } from './GlobalContext.types';
import {
  RowndProvider as RowndReactProvider,
} from '@rownd/react';

const RowndProvider: React.FC<ContextProps> = ({ children, config }) => {
  return (
    <RowndReactProvider appKey={config.appKey} apiUrl={config.apiUrl}>
      {children}
    </RowndReactProvider>
  );
};


export { RowndProvider };
