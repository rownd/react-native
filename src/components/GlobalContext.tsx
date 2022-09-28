import React, {
  useReducer,
  createContext,
  FunctionComponent,
  useEffect,
  useContext,
} from 'react';
import { NativeEventEmitter, YellowBox, Platform } from 'react-native';
import { initialRowndState, rowndReducer } from '../reducer/rowndReducer';

import * as NativeRowndModules from '../utils/nativeModule';
import { Rownd, IOSRowndEventEmitter } from '../utils/nativeModule';
import type { ContextProps, GlobalState } from './GlobalContext.types';
import type { TAction } from '../constants/action';
import { ActionType } from '../constants/action';

YellowBox.ignoreWarnings([
  'Sending `update_state` with no listeners registered.',
]);
YellowBox.ignoreWarnings(['YellowBox has been replaced with LogBox.']);

export const GlobalContext = createContext<
  { state: GlobalState; dispatch: React.Dispatch<TAction> } | undefined
>(undefined);

const eventEmitter = new NativeEventEmitter(IOSRowndEventEmitter || Rownd);

const RowndProvider: FunctionComponent<ContextProps> = ({
  children,
  config,
}) => {
  const [state, dispatch] = useReducer(rowndReducer, initialRowndState);
  const value = { state, dispatch };

  useEffect(() => {
    NativeRowndModules.configure(config.appKey);
  }, [config.appKey]);

  useEffect(() => {
    const onSessionConnect = (event: any) => {
      dispatch({
        type: ActionType.UPDATE_STATE,
        payload: Platform.OS === 'android' ? JSON.parse(event.state) : event,
      });
    };
    const subscription = eventEmitter.addListener(
      'update_state',
      onSessionConnect
    );

    if (!subscription) return;

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

function useRowndContext() {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContext Provider'
    );
  }

  return context;
}

export { RowndProvider, useRowndContext };
