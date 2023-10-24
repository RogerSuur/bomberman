export default class Router {
  constructor(routes, stateManager, eventsManager) {
    this.routes = routes; // Pre-defined routes configuration
    this.stateManager = stateManager; // Reference to the state manager
    this.eventsManager = eventsManager; // Reference to the events manager

    // Initialization of routes and potentially setting
    // up listeners for URL changes
    window.addEventListener("hashchange", this.handleHashChange.bind(this));
  }

  /**
   * Navigate to a different path.
   *
   * @param {string} path
   * @memberof Router
   */
  navigate(path) {
    // Logic to navigate to a different path,
    // updating the state and UI as necessary
    window.location.hash = path;
  }

  /**
   * Handle URL hash changes.
   *
   * @memberof Router
   */
  handleHashChange() {
    const path = window.location.hash.slice(1); // Remove the '#' symbol
    // Step 3: Resolve Route
    const matchingRoute = this.routes.find((route) => route.path === path);

    if (matchingRoute) {
      // Step 4: Update State
      this.stateManager.setState({ currentRoute: matchingRoute });
      // Step 5: Notify Subscribers
      this.eventsManager.notify("routeChange");
    } else {
      // give error 404
      window.location = "404";
    }
  }

  // ... other routing methods
}
