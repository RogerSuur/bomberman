import StateManager from './state.js';
import Router from './router.js';
import EventManager from './events.js';
import DOMAbstraction from './dom.js';

export default class MiniFramework {
    /**
     * Creates an instance of MiniFramework.
     * 
     * @param {object} config
     * @param {object} config.initialState
     * @param {array} config.routes
     * @memberof MiniFramework
     */
    constructor(config) {
        this.state = new StateManager(config.initialState);
        this.events = new EventManager();
        this.router = new Router(config.routes, this.state, this.events);
        this.dom = new DOMAbstraction(this.events);
    }

    // ... other methods and properties
}