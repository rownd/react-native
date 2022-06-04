import EventEmitter, { EventListener} from 'eventemitter3';
const bus = new EventEmitter();

export enum EventType {
    AUTH = 'auth',
    SIGN_OUT = 'sign_out',
    USER_DATA = 'user_data',
    USER_DATA_SAVED = 'user_data_saved',
}

export type TAuthEvent = {
    access_token: string;
    user_id: string;
    app_id: string;
}

type EventListenerOptions = {
    once?: boolean;
}

export const events = {
    addEventListener: (type: string, callback: (...args: any[]) => void | null, options?: boolean | EventListenerOptions | undefined): void => {
        if (!Object.values<string>(EventType).includes(type)) {
            console.warn(`Unknown event type: ${type}`);
            return;
        }

        let busFn = bus.on;
        if (options === true || (options as EventListenerOptions)?.once) {
            busFn = bus.once;
        }

        busFn.apply(bus, [type, callback, options]);
    },
    removeEventListener: bus.removeListener,
    dispatchEvent: (event: CustomEvent): boolean => {
        if (!Object.values<string>(EventType).includes(event.type)) {
            throw new Error(`Unknown event type: ${event.type}`);
        }

        return bus.emit(event.type, event.detail);
    },
    dispatch(type: EventType, data: any): boolean {
        if (!Object.values<string>(EventType).includes(type)) {
            throw new Error(`Unknown event type: ${type}`);
        }

        return bus.emit(type, data);
    },
}
