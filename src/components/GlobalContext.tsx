import React, {
  useReducer,
  createContext,
  FunctionComponent,
  useEffect,
  useContext,
} from 'react';
import { NativeEventEmitter, LogBox } from 'react-native';
import { initialRowndState, rowndReducer } from '../reducer/rowndReducer';

import * as NativeRowndModules from '../utils/nativeModule';
import { RowndEventEmitter } from '../utils/nativeModule';
import type { ContextProps, GlobalState } from './GlobalContext.types';
import type { TAction } from '../constants/action';
import { ActionType } from '../constants/action';

LogBox.ignoreLogs(['Sending `update_state` with no listeners registered.']);

export const GlobalContext = createContext<
  { state: GlobalState; dispatch: React.Dispatch<TAction> } | undefined
>(undefined);

const eventEmitter = new NativeEventEmitter(RowndEventEmitter);

const RowndProvider: FunctionComponent<ContextProps> = ({
  children,
  config,
}) => {
  const [state, dispatch] = useReducer(rowndReducer, initialRowndState);
  const value = { state, dispatch };

  useEffect(() => {
    NativeRowndModules.configure(config.appKey);
  }, []);


  useEffect(() => {
    const onSessionConnect = (event: object) => {
      dispatch({ type: ActionType.UPDATE_STATE, payload: event });
    };
    const subscription = eventEmitter.addListener(
      'update_state',
      onSessionConnect
    );

    if (!subscription) return;

    return () => {
      subscription.remove()
    }
  },[])

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
