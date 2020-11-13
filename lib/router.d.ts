/**
 * Router
 * @export
 * @class Router
 */
export class Router {
    /**
     * Creates an instance of Router.
     * @param {*} [options]
     * @memberof Router
     */
    constructor(options?: any);
    routes: any[];
    options: any;
    /**
     * Location change callback
     * @param {Boolean} applied
     * @private
     * @memberof Router
     */
    private _onLocationChange;
    /**
     * Sync current route with router
     * ! Use it after external location or history change
     * @memberof Router
     */
    applyState(): any;
    /**
     * Push route state to history stack
     * @param {string} [url='/']
     * @param {*} [state={}]
     * @memberof Router
     */
    pushState(url?: string, state?: any): any;
    /**
     * Pop state from history stack
     * @memberof Router
     */
    popState(): void;
    /**
     * Replace current url to new with state
     * @param {string} [url='/']
     * @param {*} [state={}]
     * @memberof Router
     */
    replaceState(url?: string, state?: any): any;
    /**
     * Resolve route
     * @param {function} handler
     */
    resolve(handler?: Function): Router;
    _resolver: Function;
    /**
     * Attach route with handler
     * @param {string|RegExp} route
     * @param {function} handler
     * @returns {Router}
     * @memberof Router
     */
    on(route: string | RegExp, handler: Function): Router;
    /**
     *  Default route fallback
     * @param {function} handler
     * @returns {Router}
     * @memberof Router
     */
    default(handler: Function): Router;
    /**
     * Every route change callback
     * @param {*} func
     * @returns {Router}
     * @memberof Router
     */
    always(func: any): Router;
    alwaysFunc: any;
    /**
     * Parse route by regexp or route mask
     * @param {string} route
     * @returns {*}
     * @memberof Router
     */
    _getRouteParser(route: string): any;
    /**
     * Collect route params from matches founded in route path
     * @param {*} match
     * @param {*} paramNames
     * @returns {*}
     * @private
     * @memberof Router
     */
    private _collectRouteParams;
    _resolving: any;
    /**
     * Revert state to previous saved
     */
    _revertState(): any;
    /**
     * Resolve location
     * @param {string} path
     * @param {null|object} state
     * @param {boolean} applied
     */
    _resolveLocation(path: string, state: any, applied: boolean): Promise<boolean>;
    /**
     * Apply routes handler to current route
     * @param {string} path
     * @param {null|object} state
     * @param {boolean} applied
     */
    _handleRoutes(path: string, state: any, applied: boolean): void;
    /**
     * Subscribe browser events
     */
    _subscribe(): void;
    _subscribed: boolean;
    /**
     * Unsubscribe browser popstate
     */
    _unsubscribe(): void;
    /**
     * Save last handled state of route
     * @param {string} url
     * @param {object|null} state
     */
    _saveState(url: string, state: any): void;
    _prevUrl: string;
    _prevState: any;
}
