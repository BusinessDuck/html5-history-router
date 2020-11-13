const log = (message: string) => {
    console.log(`%c[Router]%c ${message}`, 'color: rgb(255, 105, 100);', 'color: inherit');
};

export interface RouterOptions {
    debug?: boolean;
}

export interface RouterState {
    _reverted?: boolean;
}

export type RouteHandler<T extends RouterState = RouterState> = (
    path: string,
    state?: T,
    params?: Record<string, unknown>,
    applied?: boolean,
) => Promise<boolean>;

/**
 * Router
 */
export class Router {
    protected routes: Array<{ route: string | RegExp; handler: RouteHandler }> = [];
    protected options: RouterOptions;
    private alwaysFunc: RouteHandler;
    private _resolving: ReturnType<RouteHandler> | null;
    private _resolver: RouteHandler;
    private _prevUrl: string;
    private _prevState: RouterState;
    private _subscribed: boolean;
    private _listener: () => void;

    /**
     * Creates an instance of Router.
     */
    constructor(options: RouterOptions) {
        this.routes = [];
        this.options = Object.assign(
            {
                debug: false,
            },
            options,
        );
        this.always(() => null);
        this._listener = () => this._onLocationChange(false);
        this._subscribe();
        this.resolve();
        window.addEventListener('DOMContentLoaded', this._listener);
    }

    /**
     * Dispose router
     */
    public dispose() {
        this._prevState = null;
        this._prevUrl = null;
        this._unsubscribe();
    }

    /**
     * Sync current route with router
     * !NB: Use it after external location or history change
     */
    public applyState() {
        this._saveState(document.location.pathname, history.state);
        return this._onLocationChange(true);
    }

    /**
     * Push route state to history stack
     */
    public pushState<T extends RouterState = RouterState>(url = '/', state = {} as T) {
        if (!state._reverted) {
            this._saveState(document.location.pathname, history.state);
        }

        if (url !== location.pathname) {
            history.pushState(state, document.title, url);
        } else {
            history.replaceState(state, document.title, url);
        }

        if (this._resolving) {
            return Promise.resolve(false);
        }

        return this._onLocationChange();
    }

    /**
     * Pop state from history stack
     */
    public popState() {
        history.back();
    }

    /**
     * Replace current url to new with state
     */
    public replaceState<T extends RouterState = RouterState>(url = '/', state = {} as T) {
        history.replaceState(state, document.title, url);

        return this._onLocationChange();
    }

    /**
     * Resolve route
     */
    public resolve(handler: RouteHandler = () => Promise.resolve(true)) {
        this._resolver = handler;

        return this;
    }

    /**
     * Attach route with handler
     */
    public on(route: string | RegExp, handler: RouteHandler) {
        this.routes.push({
            route,
            handler,
        });

        return this;
    }

    /**
     *  Default route fallback
     */
    public default(handler: RouteHandler) {
        this.routes.push({
            route: '',
            handler,
        });

        return this;
    }

    /**
     * Every route change callback
     */
    public always(func: RouteHandler) {
        this.alwaysFunc = func;

        return this;
    }

    /**
     * Parse route by regexp or route mask
     */
    private _getRouteParser(route: string | RegExp) {
        const paramNames: string[] = [];
        let regexp: RegExp;

        if (route instanceof RegExp) {
            regexp = route;
        } else {
            const expression = route
                .replace(/([:*])(\w+)/g, (full, dots, name) => {
                    paramNames.push(name);
                    return '([^/]+)';
                })
                .replace(/\*/g, '(?:.*)');

            regexp = new RegExp(`${expression}(?:/$|$)`);
        }

        return {
            paramNames,
            regexp,
        };
    }

    /**
     * Collect route params from matches founded in route path
     */
    private _collectRouteParams(match: string[], paramNames: string[]) {
        return match.slice(1, match.length).reduce((params, value, index) => {
            params[paramNames[index]] = decodeURIComponent(value);

            return params;
        }, {});
    }

    /**
     * Location change callback
     */
    private _onLocationChange(applied?: boolean) {
        const path = decodeURI(location.pathname);

        if (this.options.debug) {
            log(`pushChange, ${path}`);
        }

        // Resolve already in progress
        if (this._resolving) {
            return this._resolving;
        }

        this._resolving = this._resolver(path).then((result) => {
            if (result) {
                this._resolving = null;
                return this._resolveLocation(path, history.state, applied);
            } else {
                return this._revertState().then(() => {
                    this._resolving = null;
                    return result;
                });
            }
        });

        return this._resolving;
    }

    /**
     * Revert state to previous saved
     */
    private _revertState() {
        // First loaded state
        if (!this._prevUrl) {
            this.popState();
            return Promise.resolve(true);
        }

        // remove forward button
        return this.pushState(this._prevUrl, Object.assign({}, { _reverted: true }, this._prevState));
    }

    /**
     * Resolve location
     */
    private _resolveLocation(path: string, state: RouterState, applied: boolean) {
        this._handleRoutes(path, state, applied);
        this._saveState(path, state);
        this.alwaysFunc(path);

        return Promise.resolve(true);
    }

    /**
     * Apply routes handler to current route
     */
    private _handleRoutes(path: string, state: RouterState, applied: boolean) {
        for (let i = 0; i < this.routes.length; i++) {
            const parser = this._getRouteParser(this.routes[i].route);
            const match = path.match(parser.regexp);

            if (match) {
                const params = this._collectRouteParams(match, parser.paramNames);

                this.routes[i].handler.call(null, {
                    path,
                    state,
                    params,
                    applied,
                });

                break;
            }
        }
    }

    /**
     * Subscribe browser events
     */
    private _subscribe() {
        if (!this._subscribed) {
            window.addEventListener('popstate', this._listener);
            this._subscribed = true;
        }
    }

    /**
     * Unsubscribe browser popstate
     */
    private _unsubscribe() {
        if (this._subscribed) {
            window.removeEventListener('popstate', this._listener);
            this._subscribed = false;
        }
    }

    /**
     * Save last handled state of route
     */
    private _saveState(url: string, state: RouterState) {
        this._prevUrl = url;
        this._prevState = state;
    }
}
