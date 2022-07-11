import { useEffect, useCallback, useRef } from 'react';
import isEqual from 'lodash-es/isEqual';
import { useDebounce, useApi, useDeviceFingerprint } from '../hooks';
import { DEFAULT_USER_AGENT } from '../hooks/api';
import { IConfig } from '../utils/config';
import { useGlobalContext } from './GlobalContext';
import { ActionType } from '../data/actions';
import ky from 'ky';
import Clipboard from '@react-native-clipboard/clipboard';
import base64 from 'react-native-base64';
import { Linking } from 'react-native';
import { events, EventType } from '../utils/events';

export type UserInfoResp = {
  data: {
    [key: string]: any;
  };
  redacted: string[];
};

interface UserAclsResponse {
  acls: Record<string, { shared: boolean }>;
}

type DefaultContextProps = {
  config: IConfig;
};

export function DefaultContext({ config }: DefaultContextProps) {
  const { state, dispatch } = useGlobalContext();
  const { client: api } = useApi();
  useDeviceFingerprint();

  // Fetch app schema and config
  useEffect(() => {
    (async () => {
      try {
        const resp: any = await api
          .get('hub/app-config', {
            headers: {
              'x-rownd-app-key': config.appKey,
            },
          })
          .json();

        if (resp?.app?.icon) {
          const iconMeta = await ky.head(resp.app.icon);
          resp.app.icon_content_type = iconMeta.headers.get('content-type');
        }

        dispatch({
          type: ActionType.SET_APP_CONFIG,
          payload: resp.app,
        });
      } catch (err) {
        console.error('Failed to fetch app config:', err);
      }
    })();
  }, [api, config.appKey, dispatch]);

  /**
   * If not signed in, check the clipboard for an init hash or auth link we can use to auto-auth the user
   */
  useEffect(() => {
    if (state.auth.access_token || !state.app.id) {
      return;
    }

    (async () => {
      try {
        let authData = null;

        let authLink =
          (await Linking.getInitialURL()) || (await Clipboard.getString());
        if (authLink.includes('rownd.link')) {
          dispatch({
            type: ActionType.CHANGE_ROUTE,
            payload: {
              route: '/account/auto-signin',
              opts: {
                type: 'sign-in',
              },
            },
          });

          authData = await ky
            .get(authLink, {
              headers: {
                'User-Agent': DEFAULT_USER_AGENT,
              },
            })
            .json();
        } else if (authLink.startsWith('rph_init=')) {
          const authStr = authLink.split('rph_init=')[1];
          authData = JSON.parse(base64.decode(authStr));
        } else {
          return;
        }

        // Clear the clipboard value so we don't leak any creds
        Clipboard.setString('');

        dispatch({
          type: ActionType.LOGIN_SUCCESS,
          payload: authData,
        });
      } catch (err) {
        console.error(
          'We found an auth link or string, but failed to authenticate with it because:',
          err
        );
      }
    })();
  }, [state.auth.access_token, state.app.id, dispatch]);

  const retrieveUserInfo = useCallback(() => {
    if (!state.auth.access_token || !state.app.id) {
      return;
    }

    (async () => {
      const userInfo: UserInfoResp = await api
        .get(`me/applications/${state.app.id}/data`, {
          headers: {
            Authorization: `Bearer ${state.auth.access_token}`,
          },
        })
        .json();
      dispatch({
        type: ActionType.LOAD_USER,
        payload: userInfo,
      });

      dispatch({
        type: ActionType.UPDATE_LOCAL_ACLS,
        payload: userInfo.redacted.reduce(
          (acc: Record<string, any>, field: string) => {
            acc[field] = { shared: false };
            return acc;
          },
          {}
        ),
      });
    })();
  }, [api, dispatch, state.app.id, state.auth.access_token]);

  const retrieveAcls = useCallback(() => {
    if (!state.app.id || !state.auth.access_token) {
      return;
    }

    (async () => {
      try {
        const appUserAcls: UserAclsResponse = await api
          .get(`me/applications/${state.app.id}/acls`, {
            headers: {
              Authorization: `Bearer ${state.auth.access_token}`,
            },
          })
          .json();
        dispatch({
          type: ActionType.UPDATE_LOCAL_ACLS,
          payload: appUserAcls.acls,
        });
      } catch (err) {
        if (err instanceof Error) {
          // const unsharedAcls = reduceSchemaToUnsharedAcls();
          dispatch({
            type: ActionType.UPDATE_LOCAL_ACLS,
            payload: {},
          });
        }
      }
    })();
  }, [api, dispatch, state.app.id, state.auth.access_token]);

  useEffect(retrieveUserInfo, [retrieveUserInfo]);
  useEffect(retrieveAcls, [retrieveAcls]);

  useEffect(() => {
    if (!state.user.needs_refresh) {
      return;
    }
    retrieveUserInfo();
    dispatch({
      type: ActionType.SET_REFRESH_USER_DATA,
      payload: { needs_refresh: false },
    });
  }, [dispatch, retrieveUserInfo, state.user.needs_refresh]);

  const saveAclsDebounced = useDebounce(saveAcls, 2000); // 2s

  async function saveAcls() {
    if (state.app.id && state.local_acls) {
      await api
        .put(`me/applications/${state.app.id}/acls`, {
          headers: {
            Authorization: `Bearer ${state.auth.access_token}`,
          },
          json: {
            acls: state.local_acls,
          },
        })
        .json();
    }
  }

  const localAclsRef = useRef(state.local_acls);
  useEffect(() => {
    // Don't save acls if they were just loaded for the first time or they haven't changed
    if (
      !localAclsRef.current ||
      isEqual(localAclsRef.current, state.local_acls)
    ) {
      return;
    }
    saveAclsDebounced();
  }, [saveAclsDebounced, state.local_acls]);

  const saveUserDataDebounced = useDebounce(saveUserData, 2000); // 2s

  // Save user data in the application state to the API server
  async function saveUserData() {
    if (state.app.id && state.user.data && state.auth.access_token) {
      dispatch({
        type: ActionType.SET_IS_SAVING_USER_DATA,
        payload: {
          saving: true,
        },
      });

      const eventDetails: Record<string, any> = {};
      try {
        eventDetails.data = await api
          .put(`me/applications/${state.app.id}/data`, {
            headers: {
              Authorization: `Bearer ${state.auth.access_token}`,
            },
            json: {
              data: state.user.data,
            },
          })
          .json();
      } catch (err) {
        eventDetails.error = err;
        // Get the latest user info from Rownd. Something was probably bad
        // with the data we just tried to save.
        // This is a bit hacky. We should be able to reset the state without
        // calling rownd again by rolling back to a previously good state...
        retrieveUserInfo();
        // TODO: Set some error state
      } finally {
        events.dispatch(EventType.USER_DATA_SAVED, eventDetails);
        dispatch({
          type: ActionType.SET_IS_SAVING_USER_DATA,
          payload: {
            saving: false,
          },
        });
      }
    }
  }

  const userDataRef = useRef(state.user.data);
  useEffect(() => {
    // Don't update the user data in the API server if the email is unknown or the data hasn't changed
    if (
      (!state.user.data?.email && !state.user.data.phone_number) ||
      isEqual(userDataRef.current, state.user.data)
    ) {
      return;
    }
    saveUserDataDebounced();
    userDataRef.current = state.user.data;
  }, [dispatch, saveUserDataDebounced, state.user.data]);

  return null;
}
