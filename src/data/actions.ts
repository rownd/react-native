export enum ActionType {
  SET_CONTAINER_VISIBLE = 'SET_CONTAINER_VISIBLE',
  CHANGE_ROUTE = 'CHANGE_ROUTE',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOAD_USER = 'LOAD_USER',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_LOCAL_ACLS = 'UPDATE_LOCAL_ACLS',
  SET_USER_DATA_FIELD = 'SET_USER_DATA_FIELD',
  SET_USER_DATA = 'SET_USER_DATA',
  SET_REFRESH_USER_DATA = 'SET_REFRESH_USER_DATA',
  LOAD_STATE = 'LOAD_STATE',
  SET_SECTION = 'SET_SECTION',
  SET_IS_SAVING_USER_DATA = 'SET_IS_SAVING_USER_DATA',
  SET_APP_CONFIG = 'SET_APP_CONFIG',
}

export type TAction = {
  type: ActionType;
  payload?: any;
};
