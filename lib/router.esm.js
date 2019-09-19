var log = function (message) {
    console.log(("%c[Router]%c " + message), 'color: rgb(255, 105, 100);', 'color: inherit');
};

/**
 * Router
 * @export
 * @class Router
 */
var Router = function Router(options) {
    this.routes = [];
    this.options = Object.assign({
        debug: false
    }, options);
    this.always(function () { return null; });
    this._onLocationChange = this._onLocationChange.bind(this);
    this._subscribe();
    this.resolve();
    window.addEventListener('DOMContentLoaded', this._onLocationChange);
};

/**
 * Sync current route with router
 * ! User it after external location or history change
 * @memberof Router
 */
Router.prototype.applyState = function applyState () {
    this._saveState(document.location.pathname, history.state);
    return this._onLocationChange(true);
};

/**
 * Push route state to history stack
 * @param {string} [url='/']
 * @param {*} [state={}]
 * @memberof Router
 */
Router.prototype.pushState = function pushState (url, state) {
        if ( url === void 0 ) url = '/';
        if ( state === void 0 ) state = {};


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
};

/**
 * Pop state from history stack
 * @memberof Router
 */
Router.prototype.popState = function popState () {
    history.back();
};

/**
 * Replace current url to new with state
 * @param {string} [url='/']
 * @param {*} [state={}]
 * @memberof Router
 */
Router.prototype.replaceState = function replaceState (url, state) {
        if ( url === void 0 ) url = '/';
        if ( state === void 0 ) state = {};

    history.replaceState(state, document.title, url);

    return this._onLocationChange();
};

/**
 * Resolve route
 * @param {function} handler
 */
Router.prototype.resolve = function resolve (handler) {
        if ( handler === void 0 ) handler = function () { return Promise.resolve(true); };

    this._resolver = handler;

    return this;
};

/**
 * Attach route with handler
 * @param {string|RegExp} route
 * @param {function} handler
 * @returns {Router}
 * @memberof Router
 */
Router.prototype.on = function on (route, handler) {
    this.routes.push({
        route: route,
        handler: handler
    });

    return this;
};

/**
 *  Default route fallback
 * @param {function} handler
 * @returns {Router}
 * @memberof Router
 */
Router.prototype.default = function default$1 (handler) {
    this.routes.push({
        route: '',
        handler: handler
    });

    return this;
};

/**
 * Every route change callback
 * @param {*} func
 * @returns {Router}
 * @memberof Router
 */
Router.prototype.always = function always (func) {
    this.alwaysFunc = func;

    return this;
};

/**
 * Parse route by regexp or route mask
 * @param {string} route
 * @returns {*}
 * @memberof Router
 */
Router.prototype._getRouteParser = function _getRouteParser (route) {
    var paramNames = [];
    var regexp;

    if (route instanceof RegExp) {
        regexp = route;
    } else {
        regexp = route.replace(/([:*])(\w+)/g, function (full, dots, name) {
            paramNames.push(name);
            return '([^/]+)';
        }).replace(/\*/g, '(?:.*)');

        regexp = new RegExp((regexp + "(?:/$|$)"));
    }

    return {
        paramNames: paramNames,
        regexp: regexp
    };
};

/**
 * Collect route params from matches founded in route path
 * @param {*} match
 * @param {*} paramNames
 * @returns {*}
 * @private
 * @memberof Router
 */
Router.prototype._collectRouteParams = function _collectRouteParams (match, paramNames) {
    return match.slice(1, match.length).reduce(function (params, value, index) {
        params[paramNames[index]] = decodeURIComponent(value);

        return params;
    }, {});
};

/**
 * Location change callback
 * @param {Boolean} applied
 * @private
 * @memberof Router
 */
Router.prototype._onLocationChange = function _onLocationChange (applied) {
        var this$1 = this;

    var path = decodeURI(location.pathname);

    if (this.options.debug) {
        log(("pushChange, " + path));
    }

    if (applied instanceof Event) {
        applied = false;
    }

    // Resolve already in progress
    if (this._resolving) {
        return this._resolving;
    }

    return this._resolving = this._resolver(this._prevUrl, path).then(function (result) {

        if (result) {
            this$1._resolving = false;
            return this$1._resolveLocation(path, history.state, applied);
        } else {
            return this$1._revertState().then(function () {
                this$1._resolving = false;
            });
        }

    });
};

/**
 * Revert state to previous saved
 */
Router.prototype._revertState = function _revertState () {
    // First loaded state
    if (!this._prevUrl) {
        return Promise.resolve(this.popState());
    }

    // remove forward button
    return this.pushState(this._prevUrl, Object.assign({}, { _reverted: true }, this._prevState));
};

/**
 * Resolve location
 * @param {string} path
 * @param {null|object} state
 * @param {boolean} applied
 */
Router.prototype._resolveLocation = function _resolveLocation (path, state, applied) {
    this._handleRoutes(path, state, applied);
    this._saveState(path, state);
    this.alwaysFunc(path);

    return Promise.resolve(true);
};

/**
 * Apply routes handler to current route
 * @param {string} path
 * @param {null|object} state
 * @param {boolean} applied
 */
Router.prototype._handleRoutes = function _handleRoutes (path, state, applied) {
    for (var i = 0; i < this.routes.length; i++) {
        var parser = this._getRouteParser(this.routes[i].route);
        var match = path.match(parser.regexp);

        if (match) {
            var params = this._collectRouteParams(match, parser.paramNames);

            this.routes[i].handler.call(null, {
                path: path,
                state: state,
                params: params,
                applied: applied
            });

            break;
        }
    }
};

/**
 * Subscribe browser events
 */
Router.prototype._subscribe = function _subscribe () {
    if (!this._subscribed) {
        window.addEventListener('popstate', this._onLocationChange);
        this._subscribed = true;
    }
};

/**
 * Unsubscripe browser popstate
 */
Router.prototype._unsubscribe = function _unsubscribe () {
    if (this._subscribed) {
        window.removeEventListener('popstate', this._onLocationChange);
        this._subscribed = false;
    }
};

/**
 * Save last handled state of route
 * @param {string} url
 * @param {object|null} state
 */
Router.prototype._saveState = function _saveState (url, state) {
    this._prevUrl = url;
    this._prevState = state;
};

export { Router };
