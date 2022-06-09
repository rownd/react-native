import { useGlobalContext } from '../components/GlobalContext';
import { ActionType } from '../data/actions';

interface INavOpts {
  route?: string;
  hide?: boolean;
}

export default function useNav() {
  const { dispatch } = useGlobalContext();

  return ({ route, hide }: INavOpts) => {
    if (hide) {
      dispatch({
        type: ActionType.SET_CONTAINER_VISIBLE,
        payload: {
          isVisible: false,
        },
      });
    } else if (route) {
      dispatch({
        type: ActionType.CHANGE_ROUTE,
        payload: {
          current_route: route,
        },
      });
    }
  };
}
