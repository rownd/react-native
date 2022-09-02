export enum ActionType {
  UPDATE_STATE = 'UPDATE_STATE',
}

export type TAction = {
  type: ActionType;
  payload?: any;
};
