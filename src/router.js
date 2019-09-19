const log = message => {
    console.log(`%c[Router]%c ${message}`, 'color: rgb(255, 105, 100);', 'color: inherit');
};

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
    constructor(options) {
        this.routes = [];
        this.options = Object.assign({
            debug: false
        }, options);
        this.always(() => null);
        this._onLocationChange = this._onLocationChange.bind(this);
        this._subscribe();
        this.resolve();
        window.addEventListener('DOMContentLoaded', this._onLocationChange);
    }

    /**
     * Sync current route with router
     * ! User it after external location or history change
     * @memberof Router
     */
    applyState() {
        this._saveState(document.location.pathname, history.state);
        return this._onLocationChange(true);
    }

    /**
     * Push route state to history stack
     * @param {string} [url='/']
     * @param {*} [state={}]
     * @memberof Router
     */
    pushState(url = '/', state = {}) {

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
     * @memberof Router
     */
    popState() {
        history.back();
    }

    /**
     * Replace current url to new with state
     * @param {string} [url='/']
     * @param {*} [state={}]
     * @memberof Router
     */
    replaceState(url = '/', state = {}) {
        history.replaceState(state, document.title, url);

        return this._onLocationChange();
    }

    /**
     * Resolve route
     * @param {function} handler
     */
    resolve(handler = () => Promise.resolve(true)) {
        this._resolver = handler;

        return this;
    }

    /**
     * Attach route with handler
     * @param {string|RegExp} route
     * @param {function} handler
     * @returns {Router}
     * @memberof Router
     */
    on(route, handler) {
        this.routes.push({
            route,
            handler
        });

        return this;
    }

    /**
     *  Default route fallback
     * @param {function} handler
     * @returns {Router}
     * @memberof Router
     */
    default(handler) {
        this.routes.push({
            route: '',
            handler
        });

        return this;
    }

    /**
     * Every route change callback
     * @param {*} func
     * @returns {Router}
     * @memberof Router
     */
    always(func) {
        this.alwaysFunc = func;

        return this;
    }

    /**
     * Parse route by regexp or route mask
     * @param {string} route
     * @returns {*}
     * @memberof Router
     */
    _getRouteParser(route) {
        const paramNames = [];
        let regexp;

        if (route instanceof RegExp) {
            regexp = route;
        } else {
            regexp = route.replace(/([:*])(\w+)/g, (full, dots, name) => {
                paramNames.push(name);
                return '([^/]+)';
            }).replace(/\*/g, '(?:.*)');

            regexp = new RegExp(`${regexp}(?:/$|$)`);
        }

        return {
            paramNames,
            regexp
        };
    }

    /**
     * Collect route params from matches founded in route path
     * @param {*} match
     * @param {*} paramNames
     * @returns {*}
     * @private
     * @memberof Router
     */
    _collectRouteParams(match, paramNames) {
        return match.slice(1, match.length).reduce((params, value, index) => {
            params[paramNames[index]] = decodeURIComponent(value);

            return params;
        }, {});
    }

    /**
     * Location change callback
     * @param {Boolean} applied
     * @private
     * @memberof Router
     */
    _onLocationChange(applied) {
        const path = decodeURI(location.pathname);

        if (this.options.debug) {
            log(`pushChange, ${path}`);
        }

        if (applied instanceof Event) {
            applied = false;
        }

        // Resolve already in progress
        if (this._resolving) {
            return this._resolving;
        }

        return this._resolving = this._resolver(this._prevUrl, path).then((result) => {

            if (result) {
                this._resolving = false;
                return this._resolveLocation(path, history.state, applied);
            } else {
                return this._revertState().then(() => {
                    this._resolving = false;
                });
            }

        });
    }

    /**
     * Revert state to previous saved
     */
    _revertState() {
        // First loaded state
        if (!this._prevUrl) {
            return Promise.resolve(this.popState());
        }

        // remove forward button
        return this.pushState(this._prevUrl, { _reverted: true, ...this._prevState });
    }

    /**
     * Resolve location
     * @param {string} path
     * @param {null|object} state
     * @param {boolean} applied
     */
    _resolveLocation(path, state, applied) {
        this._handleRoutes(path, state, applied);
        this._saveState(path, state);
        this.alwaysFunc(path);

        return Promise.resolve(true);
    }

    /**
     * Apply routes handler to current route
     * @param {string} path
     * @param {null|object} state
     * @param {boolean} applied
     */
    _handleRoutes(path, state, applied) {
        for (let i = 0; i < this.routes.length; i++) {
            const parser = this._getRouteParser(this.routes[i].route);
            const match = path.match(parser.regexp);

            if (match) {
                const params = this._collectRouteParams(match, parser.paramNames);

                this.routes[i].handler.call(null, {
                    path,
                    state,
                    params,
                    applied
                });

                break;
            }
        }
    }

    /**
     * Subscribe browser events
     */
    _subscribe() {
        if (!this._subscribed) {
            window.addEventListener('popstate', this._onLocationChange);
            this._subscribed = true;
        }
    }

    /**
     * Unsubscripe browser popstate
     */
    _unsubscribe() {
        if (this._subscribed) {
            window.removeEventListener('popstate', this._onLocationChange);
            this._subscribed = false;
        }
    }

    /**
     * Save last handled state of route
     * @param {string} url
     * @param {object|null} state
     */
    _saveState(url, state) {
        this._prevUrl = url;
        this._prevState = state;
    }
}
