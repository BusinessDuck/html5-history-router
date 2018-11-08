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
     * @param {*} options
     * @memberof Router
     */
    constructor(options) {
        this.routes = [];
        this.options = Object.assign({
            debug: false
        }, options);
        this.always(() => null);

        this._onLocationChange = this._onLocationChange.bind(this);
        window.addEventListener('popstate', this._onLocationChange);
        window.addEventListener('DOMContentLoaded', this._onLocationChange);
    }

    /**
     * Sync current route with router
     * ! User it after external location or history change
     * @memberof Router
     */
    applyState() {
        this._onLocationChange();
    }

    /**
     * Push route state to history stack
     * @param {string} [url='/']
     * @param {Object} [state={}]
     * @memberof Router
     */
    pushState(url = '/', state = {}) {
        if (url !== location.pathname) {
            history.pushState(state, document.title, url);
        } else {
            history.replaceState(state, document.title, url);
        }

        this._onLocationChange();
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
        if (url !== location.pathname) {
            history.replaceState(state, document.title, url);
            this._onLocationChange();
        }
    }

    /**
     * Attach route with handler
     * @param {string} route
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

        log(`pushChange, ${path}`);
        for (let i = 0; i < this.routes.length; i++) {
            const parser = this._getRouteParser(this.routes[i].route);
            const match = path.match(parser.regexp);

            if (match) {
                const params = this._collectRouteParams(match, parser.paramNames);

                this.routes[i].handler.call(null, {
                    path,
                    state: history.state,
                    params,
                    applied
                });

                break;
            }
        }

        this.alwaysFunc(path);
    }

}
