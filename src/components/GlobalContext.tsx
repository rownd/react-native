import React, { createContext, FunctionComponent } from 'react';
import { useReducer, useContext } from 'react';
import isEqual from 'lodash-es/isEqual';
import pick from 'lodash-es/pick';
import jwt_decode from 'jwt-decode';
import type { IConfig } from '../utils/config';
import storage from '../utils/storage';
import { events, EventType } from '../utils/events';

import { type TAction, ActionType } from '../data/actions';

type Dispatch = (action: TAction) => void;

export type GlobalState = {
  is_initializing: boolean;
  is_container_visible: boolean;
  use_modal: boolean;
  nav: {
    current_route: string;
    route_trigger: string;
    event_id: string;
    section: string;
    options?: any;
  };
  user: {
    data: {
      id?: string;
      email: string | null;
      [key: string]: any;
    };
    needs_refresh?: boolean;
    redacted: string[];
  };
  auth: {
    access_token: string | null;
    refresh_token: string | null;
    app_id: string | null;
    init_data?: Record<string, any>;
    is_verified_user?: boolean;
  };
  app: {
    id?: string;
    icon?: string;
    icon_content_type?: string;
    config: AppConfig | null;
    schema: AppSchema | null;
    user_verification_field?: string;
    user_verification_fields?: string[];
  };
  local_acls: Record<string, { shared: boolean }> | null;
  is_saving_user_data: boolean;
  config?: IConfig;
};

type AppSchema = Record<string, SchemaField>;

export interface SchemaField {
  display_name: string;
  type: string;
  data_category: string;
  required: boolean;
  owned_by: string;
  user_visible: boolean;
  revoke_after: string;
  required_retention: string;
  collection_justification: string;
  opt_out_warning: string;
}

interface AppConfig {
  customizations: {
    primary_color: string;
  };
  default_user_id_format?: string;
  hub: {
    auth: {
      allow_unverified_users?: boolean;
      additional_fields: [
        {
          name: string;
          type: string;
          label: string;
          placeholder?: string;
          options: [
            {
              value: string;
              label: string;
            }
          ];
        }
      ];
      email: {
        from_address: string;
        image: string;
      };
      show_app_icon: boolean;
    };
    customizations: HubCustomizations;
  };
}

export interface HubCustomizations {
  rounded_corners: boolean;
  primary_color: string;
  placement: 'bottom-left' | 'hidden';
  offset_x: number;
  offset_y: number;
  property_overrides: Record<string, string>;
}

type ContextProps = {
  config: IConfig;
};

export const GlobalContext = createContext<
  { state: GlobalState; dispatch: Dispatch } | undefined
>(undefined);

function handleStateInit(initialState: GlobalState) {
  if (storage.contains('state')) {
    const state = JSON.parse(storage.getString('state') || '{}');

    return {
      ...initialState,
      ...state,
    };
  }

  return initialState;
}

// async function updateStorage(newState: any) {
//     const oldState = JSON.parse(await storage.getItem('state') || '{}');

//     if (!isEqual(oldState, newState)) {
//         console.log('writing new state', newState);
//         await storage.setItem('state', JSON.stringify(newState));
//     }
// }

const GlobalContextProvider: FunctionComponent<ContextProps> = ({
  children,
  config,
}) => {
  const initialState: GlobalState = {
    is_initializing: false,
    is_container_visible: false,
    use_modal: false,
    nav: {
      current_route: '/',
      route_trigger: '',
      event_id: '',
      section: '',
      options: {},
    },
    user: {
      data: {
        email: null,
      },
      needs_refresh: false,
      redacted: [],
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
    local_acls: null,
    is_saving_user_data: false,
    config,
  };

  // TODO: There's a better way to do this where we have a set of rules that watch/apply to the state as it changes
  // function dispatchExternalEvents(prevState: GlobalState, nextState: GlobalState) {

  //     // Log in, get new token, load previous auth state, etc
  //     if (prevState.auth.access_token !== nextState.auth.access_token) {
  //         events.dispatch(EventType.AUTH, {
  //             access_token: nextState.auth.access_token,
  //             user_id: nextState.user.data.id,
  //             app_id: nextState.auth.app_id,
  //         });
  //     }

  //     // User data changes. Also, fire the event when ACLs change since this affects the data
  //     // that the application can see.
  //     if (!isEqual(prevState.local_acls, nextState.local_acls) ||
  //         !isEqual(prevState.user.data, nextState.user.data)) {
  //         events.dispatch(EventType.USER_DATA, {
  //             // The data is filtered on the local_acls
  //             data: redactUserDataWithAcls(nextState.user.data, nextState.local_acls),
  //         });
  //     }

  //     // Log out
  //     if (nextState.auth.access_token === null) {
  //         events.dispatch(EventType.SIGN_OUT, {});
  //     }
  // }

  function mainReducer(state: GlobalState, action: TAction): GlobalState {
    let decodedToken: any;

    let newState;
    // let cachedAuth;
    switch (action.type) {
      case ActionType.SET_CONTAINER_VISIBLE:
        newState = {
          ...state,
          is_container_visible: action.payload.isVisible,
          use_modal:
            action.payload.isVisible === false ? false : state.use_modal,
          nav: {
            ...state.nav,
            current_route: '/',
          },
        };
        break;

      case ActionType.CHANGE_ROUTE:
        newState = {
          ...state,
          nav: {
            ...state.nav,
            current_route: action.payload.route,
            route_trigger: action.payload.trigger || '',
            event_id: action.payload.event_id,
            options: action.payload.opts,
          },
        };

        break;

      case ActionType.SET_SECTION:
        newState = {
          ...state,
          nav: {
            ...state.nav,
            section: action.payload.section,
          },
        };
        break;

      case ActionType.LOGIN_SUCCESS:
        // storage.setItem('auth', JSON.stringify(action.payload));
        decodedToken = jwt_decode(action.payload.access_token);

        // Ensure this token is for this app
        if (action.payload.app_id !== state.app.id) {
          return {
            ...state,
          };
        }

        newState = {
          ...state,
          auth: {
            ...state.auth,
            access_token: action.payload.access_token,
            refresh_token: action.payload.refresh_token,
            app_id: action.payload.app_id,
            is_verified_user:
              decodedToken?.['https://auth.rownd.io/is_verified_user'] !==
              false, // default is `true` if the attribute doesn't exist
          },
          user: {
            ...state.user,
            data: {
              ...state.user.data,
              id: action.payload.app_user_id,
            },
          },
        };
        break;

      case ActionType.SIGN_OUT:
        // storage.removeItem('auth');
        newState = {
          ...state,
          user: {
            data: {
              email: null,
            },
            redacted: [],
          },
          auth: {
            access_token: null,
            refresh_token: null,
            app_id: null,
          },
        };
        break;

      case ActionType.REFRESH_TOKEN:
        newState = {
          ...state,
          auth: {
            ...state.auth,
            access_token: action.payload.access_token,
            refresh_token: action.payload.refresh_token,
          },
        };

        // cachedAuth = storage.getItem('auth');
        // if (cachedAuth) {
        //     const cachedAuthObj = JSON.parse(cachedAuth);
        //     cachedAuth = {
        //         ...cachedAuthObj,
        //         ...newState.auth,
        //     };
        //     storage.setItem('auth', JSON.stringify(newState.auth));
        // }

        break;

      case ActionType.LOAD_USER:
        newState = {
          ...state,
          user: {
            ...state.user,
            data: {
              ...action.payload.data,
            },
            redacted: action.payload.redacted,
          },
        };
        break;

      case ActionType.UPDATE_LOCAL_ACLS:
        newState = {
          ...state,
          local_acls: {
            ...state.local_acls,
            ...action.payload,
          },
        };
        break;

      case ActionType.SET_USER_DATA_FIELD:
        // Dispatch a USER_DATA_SAVED event to satisfy event listeners when the data
        // was not changed and no request to Rownd was ever made.
        if (state.user.data[action.payload.field] === action.payload.value) {
          events.dispatch(EventType.USER_DATA_SAVED, state.user.data);
        }

        newState = {
          ...state,
          user: {
            ...state.user,
            data: {
              ...state.user.data,
              [action.payload.field]: action.payload.value,
            },
          },
        };
        break;

      case ActionType.SET_USER_DATA:
        // Dispatch a USER_DATA_SAVED event to satisfy event listeners when the data
        // was not changed and no request to Rownd was ever made.
        if (
          isEqual(
            pick(state.user.data, Object.keys(action.payload.data)),
            action.payload.data
          )
        ) {
          events.dispatch(EventType.USER_DATA_SAVED, state.user.data);
        }

        newState = {
          ...state,
          user: {
            ...state.user,
            data: {
              ...state.user.data,
              ...action.payload.data,
            },
          },
        };
        break;

      case ActionType.SET_REFRESH_USER_DATA:
        newState = {
          ...state,
          user: {
            ...state.user,
            needs_refresh: action.payload.needs_refresh,
          },
        };
        break;

      case ActionType.LOAD_STATE:
        newState = {
          ...action.payload,
        };
        break;

      case ActionType.SET_IS_SAVING_USER_DATA: {
        newState = {
          ...state,
          is_saving_user_data: action.payload.saving,
        };
        break;
      }

      case ActionType.SET_APP_CONFIG:
        newState = {
          ...state,
          app: {
            ...state.app,
            ...action.payload,
          },
        };
        break;

      default:
        newState = state;
    }

    // Write state to local storage, minus a few fields
    const persistedState: any = { ...newState };
    delete persistedState.config;
    delete persistedState.nav;
    delete persistedState.is_container_visible;
    delete persistedState.use_modal;
    delete persistedState.is_initializing;
    delete persistedState.is_saving_user_data;

    // updateStorage(persistedState);
    storage.set('state', JSON.stringify(persistedState));

    // Fire any events that depend on state updates
    // dispatchExternalEvents(state, newState);

    return newState;
  }

  const [state, dispatch] = useReducer(
    mainReducer,
    initialState,
    handleStateInit
  );

  // Async load cached state from storage
  // useEffect(() => {
  //     (async () => {
  //         const existingStateStr = await storage.getItem('state');

  //         if (!existingStateStr) {
  //             return;
  //         }

  //         dispatch({
  //             type: ActionType.LOAD_STATE,
  //             payload: JSON.parse(existingStateStr),
  //         });
  //     });
  // }, []);

  const value = { state, dispatch };
  return (
    <GlobalContext.Provider value={value}>
      {children}
      {/* <ExternalApi config={config} dispatchEvents={(state: GlobalState) => dispatchExternalEvents(initialState, state)} /> */}
    </GlobalContext.Provider>
  );
};

function useGlobalContext() {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContext Provider'
    );
  }

  return context;
}

export { GlobalContextProvider, useGlobalContext };
