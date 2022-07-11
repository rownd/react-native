import { createContext } from 'react';
import { useGlobalContext } from "../components/GlobalContext";
import { ActionType } from '../data/actions';
import useApi from './api';
import { events, EventType } from '../utils/events';

export type TRowndContext = {
    requestSignIn: (opts?: RequestSignInOpts) => void;
    signOut: () => void;
    getAccessToken: (opts?: GetAccessTokenOpts) => Promise<string | null>;
    is_authenticated: boolean;
    is_initializing: boolean;
    access_token: string | null;
    auth: AuthContext;
    user: UserContext;
};

type AuthContext = {
    access_token: string | null;
    app_id: string | null;
    is_verified_user?: boolean;
};

type UserContext = {
    data: {
        id?: string;
        email?: string | null;
        phone?: string | null;
        [key: string]: any;
    };
    redacted_fields: string[];
    set: (data: Record<string, any>) => Promise<Record<string, any>>;
    setValue: (key: string, value: any) => Promise<Record<string, any>>;
};

type RequestSignInOpts = {
    identifier?: string;
    auto_sign_in?: boolean;
    init_data?: Record<string, any>;
    post_login_redirect?: string;
}

type GetAccessTokenOpts = {
    waitForToken?: boolean;
}

// const RowndContext = createContext<TRowndContext | null>(null);


export function useRownd(): TRowndContext {
    const { state, dispatch } = useGlobalContext();
    const { isNewAccessTokenNeeded, newAccessTokenFromRefreshToken, client: api } = useApi();

    const stateCopy = JSON.parse(JSON.stringify(state));

    const requestSignIn = (opts?: RequestSignInOpts): void => {
        dispatch({
            type: ActionType.CHANGE_ROUTE,
            payload: {
                route: '/account/login',
                options: opts
            }
        });
    };

    const signOut = () => {
        dispatch({
            type: ActionType.SIGN_OUT,
        });
    }

    const getAccessToken = async (opts?: GetAccessTokenOpts): Promise<string | null> => {
        const { waitForToken } = opts || {};
        let accessToken = state?.auth.access_token;

        // Wait for an access token to be available if none exists yet
        if (!accessToken && waitForToken) {
            return new Promise((resolve, reject) => {
                console.debug('auth_wait: waiting for access token');
                const listener = (evt: any) => {
                    console.debug('auth_wait: received access token');
                    const data = evt.detail;
                    resolve(data.access_token);
                };
            });
        }

        if (isNewAccessTokenNeeded(void 0)) {
            const resp = await newAccessTokenFromRefreshToken(stateCopy);
            accessToken = resp.access_token;
        }

        return accessToken;
    }

    const setUserData = (data: Record<string, any>): Promise<Record<string, any>> => {
        return new Promise((resolve, reject) => {
            console.debug('user_data_save_wait: waiting for data to be saved');
            const listener = (evt: any) => {
                console.debug('user_data_save_wait: received data saved event');
                if (evt.error) {
                    return reject(evt.error);
                }

                resolve(evt.data);
            };

            events.addEventListener(EventType.USER_DATA_SAVED, listener, { once: true });

            dispatch({
                type: ActionType.SET_USER_DATA,
                payload: {
                    data,
                },
            });
        });
    }

    const setUserDataValue = (key: string, value: any): Promise<Record<string, any>> => {
        return new Promise((resolve, reject) => {
            console.debug('user_data_save_wait: waiting for data to be saved');
            const listener = (evt: any) => {
                console.debug('user_data_save_wait: received data saved event');
                if (evt.error) {
                    return reject(evt.error);
                }

                resolve(evt.data);
            };

            events.addEventListener(EventType.USER_DATA_SAVED, listener, { once: true });

            dispatch({
                type: ActionType.SET_USER_DATA_FIELD,
                payload: {
                    field: key,
                    value,
                }
            });

            if (value) {
                return;
            }

            const valueAcl = {
                [key]: {
                    shared: true,
                }
            };

            dispatch({
                type: ActionType.UPDATE_LOCAL_ACLS,
                payload: valueAcl,
            })
        });
    }

    return {
        requestSignIn,
        signOut,
        getAccessToken,
        is_authenticated: !!state.auth.access_token,
        is_initializing: !!state.app.id,
        access_token: state.auth?.access_token,
        auth: state.auth,
        user: {
            data: state.user?.data,
            redacted_fields: state.user?.redacted,
            set: setUserData,
            setValue: setUserDataValue,
        },
    };
}