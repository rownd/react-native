// import { logger } from "./utils/log";

let count = 0;

type QueueItem = {
    action: () => Promise<any>,
    resolve: (value?: any) => void,
    reject: (reason?: any) => void,
    count: number,
}

class Queue {
    #_items: any[];
    constructor() { this.#_items = []; }
    enqueue(item: QueueItem | (() => Promise<any>)) { this.#_items.push(item); }
    dequeue(): any { return this.#_items.shift(); }
    get size() { return this.#_items.length; }
}

class AutoQueue<T> extends Queue {
    _cache: Record<string, unknown>;
    #_pendingPromise: boolean;
    constructor() {
        super();
        this.#_pendingPromise = false;
        this._cache = {};
    }

    enqueue(action: () => Promise<any>): Promise<T> {
        return new Promise((resolve, reject) => {
            super.enqueue({ action, resolve, reject, count: count++ });
            // logger.log('queued', count);
            this.dequeue();
        });
    }

    async dequeue() {
        if (this.#_pendingPromise) return false;

        const item = super.dequeue();

        if (!item) {
            this._cache = {};
            return false;
        }

        // logger.log('dequeued', item.count);

        try {
            this.#_pendingPromise = true;

            const payload = await item.action(this);

            this.#_pendingPromise = false;
            item.resolve(payload);
        } catch (e) {
            this.#_pendingPromise = false;
            item.reject(e);
        } finally {
            this.dequeue();
        }

        return true;
    }
}

export default AutoQueue;