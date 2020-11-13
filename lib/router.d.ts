export interface RouterOptions {
    debug?: boolean;
}
export interface RouterState {
    _reverted?: boolean;
}
export declare type RouteHandler<T extends RouterState = RouterState> = (path: string, state?: T, params?: Record<string, unknown>, applied?: boolean) => Promise<boolean>;
/**
 * Router
 */
export declare class Router {
    protected routes: Array<{
        route: string | RegExp;
        handler: RouteHandler;
    }>;
    protected options: RouterOptions;
    private alwaysFunc;
    private _resolving;
    private _resolver;
    private _prevUrl;
    private _prevState;
    private _subscribed;
    private _listener;
    /**
     * Creates an instance of Router.
     */
    constructor(options: RouterOptions);
    /**
     * Dispose router
     */
    dispose(): void;
    /**
     * Sync current route with router
     * !NB: Use it after external location or history change
     */
    applyState(): Promise<boolean>;
    /**
     * Push route state to history stack
     */
    pushState<T extends RouterState = RouterState>(url?: string, state?: T): Promise<boolean>;
    /**
     * Pop state from history stack
     */
    popState(): void;
    /**
     * Replace current url to new with state
     */
    replaceState<T extends RouterState = RouterState>(url?: string, state?: T): Promise<boolean>;
    /**
     * Resolve route
     */
    resolve(handler?: RouteHandler): this;
    /**
     * Attach route with handler
     */
    on(route: string | RegExp, handler: RouteHandler): this;
    /**
     *  Default route fallback
     */
    default(handler: RouteHandler): this;
    /**
     * Every route change callback
     */
    always(func: RouteHandler): this;
    /**
     * Parse route by regexp or route mask
     */
    private _getRouteParser;
    /**
     * Collect route params from matches founded in route path
     */
    private _collectRouteParams;
    /**
     * Location change callback
     */
    private _onLocationChange;
    /**
     * Revert state to previous saved
     */
    private _revertState;
    /**
     * Resolve location
     */
    private _resolveLocation;
    /**
     * Apply routes handler to current route
     */
    private _handleRoutes;
    /**
     * Subscribe browser events
     */
    private _subscribe;
    /**
     * Unsubscribe browser popstate
     */
    private _unsubscribe;
    /**
     * Save last handled state of route
     */
    private _saveState;
}
