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
      const user = action.payload?.user || {};
      const auth = action.payload?.auth || {};
      const appConfig = action.payload?.appConfig || {};

      newState = {
        user: {
          data: {
            ...user.data,
            email: user.data?.email,
          },
          isLoading: Boolean(user.isLoading ?? user.is_loading),
          // meta: {}
        },
        auth: {
          access_token: auth.access_token ?? null,
          refresh_token: auth.refresh_token ?? null,
          app_id: appConfig.id || auth.app_id || null,
          is_verified_user: auth.is_verified_user,
          auth_level: auth.auth_level ?? user.auth_level ?? null,
        },
        app: {
          schema: appConfig.schema ?? null,
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
