export default class EventManager {
    constructor() {
        this.observers = {};
        this.assignEventHandlers();
    }

    /**
     * Assign event handlers to the document object.
     * 
     * @memberof EventManager
     */
    assignEventHandlers() {
        // Handling events without addEventListener, 
        // using inline event attributes
        this.assignEventHandler('click');
        this.assignEventHandler('keydown', true, 10);
        this.assignEventHandler('dblclick');
        this.assignEventHandler('change');



        // ... other native DOM events
    }

    /**
     * Assign an event handler to the document object.
     * 
     * @param {string} eventType
     * @param {boolean} isThrottled
     * @param {number} delay
     * @memberof EventManager
     */
    assignEventHandler(eventType, isThrottled = false, delay = 0) {
        let lastEventTime = 0;
        document[`on${eventType}`] = (event) => {
            if (isThrottled) {
                const now = new Date().getTime();
                if (now - lastEventTime >= delay) {
                    lastEventTime = now;
                    this.notify(eventType, event);
                }
            } else {
                this.notify(eventType, event);
            }
        };
    }

    /**
     * Subscribe to an event.
     * 
     * @param {string} eventType
     * @param {function} callback
     * @memberof EventManager
     */
    subscribe(eventType, callback) {
        // Handles custom application-level events
        if (!this.observers[eventType]) {
            this.observers[eventType] = [];
        }
        this.observers[eventType].push(callback);
    }

    /**
     * Unsubscribe from an event.
     * 
     * @param {string} eventType
     * @param {function} callback
     * @memberof EventManager
     */
    unsubscribe(eventType, callback) {
        if (this.observers[eventType]) {
            this.observers[eventType] = this.observers[eventType].filter(cb => cb !== callback);
        }
    }

    /**
     * Notify all subscribers of an event.
     * 
     * @param {string} eventType
     * @param {object} data
     * @memberof EventManager
     */
    notify(eventType, data) {
        if (this.observers[eventType]) {
            this.observers[eventType].forEach(callback => callback(data));
        }
    }
}