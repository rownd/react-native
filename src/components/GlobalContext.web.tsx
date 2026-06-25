import React from 'react';
import type { ContextProps } from './GlobalContext.types';
import { RowndProvider as RowndReactProvider } from '@supertokens/rownd-react';

const RowndProvider: React.FC<ContextProps> = ({ children, config }) => {
  return (
    <RowndReactProvider
      appKey={config.appKey}
      supertokens={config.supertokens}
      hubUrlOverride={config.hubUrlOverride}
    >
      {children}
    </RowndReactProvider>
  );
};

export { RowndProvider };
