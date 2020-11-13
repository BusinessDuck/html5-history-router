var log = function (message) {
    console.log("%c[Router]%c " + message, 'color: rgb(255, 105, 100);', 'color: inherit');
};
/**
 * Router
 */
var Router = /** @class */ (function () {
    /**
     * Creates an instance of Router.
     */
    function Router(options) {
        var _this = this;
        this.routes = [];
        this.routes = [];
        this.options = Object.assign({
            debug: false,
        }, options);
        this.always(function () { return null; });
        this._listener = function () { return _this._onLocationChange(false); };
        this._subscribe();
        this.resolve();
        window.addEventListener('DOMContentLoaded', this._listener);
    }
    /**
     * Dispose router
     */
    Router.prototype.dispose = function () {
        this._prevState = null;
        this._prevUrl = null;
        this._unsubscribe();
    };
    /**
     * Sync current route with router
     * !NB: Use it after external location or history change
     */
    Router.prototype.applyState = function () {
        this._saveState(document.location.pathname, history.state);
        return this._onLocationChange(true);
    };
    /**
     * Push route state to history stack
     */
    Router.prototype.pushState = function (url, state) {
        if (url === void 0) { url = '/'; }
        if (state === void 0) { state = {}; }
        if (!state._reverted) {
            this._saveState(document.location.pathname, history.state);
        }
        if (url !== location.pathname) {
            history.pushState(state, document.title, url);
        }
        else {
            history.replaceState(state, document.title, url);
        }
        if (this._resolving) {
            return Promise.resolve(false);
        }
        return this._onLocationChange();
    };
    /**
     * Pop state from history stack
     */
    Router.prototype.popState = function () {
        history.back();
    };
    /**
     * Replace current url to new with state
     */
    Router.prototype.replaceState = function (url, state) {
        if (url === void 0) { url = '/'; }
        if (state === void 0) { state = {}; }
        history.replaceState(state, document.title, url);
        return this._onLocationChange();
    };
    /**
     * Resolve route
     */
    Router.prototype.resolve = function (handler) {
        if (handler === void 0) { handler = function () { return Promise.resolve(true); }; }
        this._resolver = handler;
        return this;
    };
    /**
     * Attach route with handler
     */
    Router.prototype.on = function (route, handler) {
        this.routes.push({
            route: route,
            handler: handler,
        });
        return this;
    };
    /**
     *  Default route fallback
     */
    Router.prototype.default = function (handler) {
        this.routes.push({
            route: '',
            handler: handler,
        });
        return this;
    };
    /**
     * Every route change callback
     */
    Router.prototype.always = function (func) {
        this.alwaysFunc = func;
        return this;
    };
    /**
     * Parse route by regexp or route mask
     */
    Router.prototype._getRouteParser = function (route) {
        var paramNames = [];
        var regexp;
        if (route instanceof RegExp) {
            regexp = route;
        }
        else {
            var expression = route
                .replace(/([:*])(\w+)/g, function (full, dots, name) {
                paramNames.push(name);
                return '([^/]+)';
            })
                .replace(/\*/g, '(?:.*)');
            regexp = new RegExp(expression + "(?:/$|$)");
        }
        return {
            paramNames: paramNames,
            regexp: regexp,
        };
    };
    /**
     * Collect route params from matches founded in route path
     */
    Router.prototype._collectRouteParams = function (match, paramNames) {
        return match.slice(1, match.length).reduce(function (params, value, index) {
            params[paramNames[index]] = decodeURIComponent(value);
            return params;
        }, {});
    };
    /**
     * Location change callback
     */
    Router.prototype._onLocationChange = function (applied) {
        var _this = this;
        var path = decodeURI(location.pathname);
        if (this.options.debug) {
            log("pushChange, " + path);
        }
        // Resolve already in progress
        if (this._resolving) {
            return this._resolving;
        }
        this._resolving = this._resolver(path).then(function (result) {
            if (result) {
                _this._resolving = null;
                return _this._resolveLocation(path, history.state, applied);
            }
            else {
                return _this._revertState().then(function () {
                    _this._resolving = null;
                    return result;
                });
            }
        });
        return this._resolving;
    };
    /**
     * Revert state to previous saved
     */
    Router.prototype._revertState = function () {
        // First loaded state
        if (!this._prevUrl) {
            this.popState();
            return Promise.resolve(true);
        }
        // remove forward button
        return this.pushState(this._prevUrl, Object.assign({}, { _reverted: true }, this._prevState));
    };
    /**
     * Resolve location
     */
    Router.prototype._resolveLocation = function (path, state, applied) {
        this._handleRoutes(path, state, applied);
        this._saveState(path, state);
        this.alwaysFunc(path);
        return Promise.resolve(true);
    };
    /**
     * Apply routes handler to current route
     */
    Router.prototype._handleRoutes = function (path, state, applied) {
        for (var i = 0; i < this.routes.length; i++) {
            var parser = this._getRouteParser(this.routes[i].route);
            var match = path.match(parser.regexp);
            if (match) {
                var params = this._collectRouteParams(match, parser.paramNames);
                this.routes[i].handler.call(null, {
                    path: path,
                    state: state,
                    params: params,
                    applied: applied,
                });
                break;
            }
        }
    };
    /**
     * Subscribe browser events
     */
    Router.prototype._subscribe = function () {
        if (!this._subscribed) {
            window.addEventListener('popstate', this._listener);
            this._subscribed = true;
        }
    };
    /**
     * Unsubscribe browser popstate
     */
    Router.prototype._unsubscribe = function () {
        if (this._subscribed) {
            window.removeEventListener('popstate', this._listener);
            this._subscribed = false;
        }
    };
    /**
     * Save last handled state of route
     */
    Router.prototype._saveState = function (url, state) {
        this._prevUrl = url;
        this._prevState = state;
    };
    return Router;
}());

export { Router };
