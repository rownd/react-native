import type { GlobalState } from '../components/GlobalContext.types';
import { ActionType, TAction } from '../constants/action';

export const initialRowndState: GlobalState = {
  // is_initializing: false,
  user: {
    data: {
      email: null,
    },
    isLoading: false,
    // meta: {}
  },
  auth: {
    access_token: null,
    refresh_token: null,
    app_id: null,
  },
  app: {
    schema: null,
    config: null,
  },
  // is_saving_user_data: false,
  // config,
};

export function rowndReducer(state: GlobalState, action: TAction): GlobalState {
  let newState: GlobalState;

  switch (action.type) {
    case ActionType.UPDATE_STATE:
      newState = {
        user: {
          data: {
            ...action.payload?.user?.data,
            email: action.payload?.user?.data?.email,
          },
          isLoading: Boolean(action.payload?.user?.isLoading),
          // meta: {}
        },
        auth: {
          access_token: action.payload?.auth?.access_token,
          refresh_token: action.payload?.auth?.refresh_token,
          app_id: action.payload?.appConfig?.id || null,
        },
        app: {
          schema: action.payload.appConfig?.schema,
          config: null,
        },
        // is_saving_user_data: false,
        // config
      };
      return newState;
    default:
      newState = state;
      return newState;
  }
}
