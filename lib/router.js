'use strict';var _createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();Object.defineProperty(exports,'__esModule',{value:!0});function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}var log=function(a){console.log('%c[Router]%c '+a,'color: rgb(255, 105, 100);','color: inherit')},Router=exports.Router=function(){/**
     * Creates an instance of Router.
     * @param {*} [options]
     * @memberof Router
     */function a(b){_classCallCheck(this,a),this.routes=[],this.options=Object.assign({debug:!1},b),this.always(function(){return null}),this._onLocationChange=this._onLocationChange.bind(this),this._subscribe(),this.resolve(),window.addEventListener('DOMContentLoaded',this._onLocationChange)}/**
     * Sync current route with router
     * ! User it after external location or history change
     * @memberof Router
     */return _createClass(a,[{key:'applyState',value:function a(){return this._onLocationChange(!0)}/**
     * Push route state to history stack
     * @param {string} [url='/']
     * @param {*} [state={}]
     * @memberof Router
     */},{key:'pushState',value:function c(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:'/',b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return a===location.pathname?history.replaceState(b,document.title,a):history.pushState(b,document.title,a),this._resolving?Promise.resolve(!1):this._onLocationChange()}/**
     * Pop state from history stack
     * @memberof Router
     */},{key:'popState',value:function a(){history.back()}/**
     * Replace current url to new with state
     * @param {string} [url='/']
     * @param {*} [state={}]
     * @memberof Router
     */},{key:'replaceState',value:function c(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:'/',b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return history.replaceState(b,document.title,a),this._onLocationChange()}/**
     * Resolve route
     * @param {function} handler
     */},{key:'resolve',value:function b(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:function(){return Promise.resolve(!0)};return this._resolver=a,this}/**
     * Attach route with handler
     * @param {string|RegExp} route
     * @param {function} handler
     * @returns {Router}
     * @memberof Router
     */},{key:'on',value:function c(a,b){return this.routes.push({route:a,handler:b}),this}/**
     *  Default route fallback
     * @param {function} handler
     * @returns {Router}
     * @memberof Router
     */},{key:'default',value:function b(a){return this.routes.push({route:'',handler:a}),this}/**
     * Every route change callback
     * @param {*} func
     * @returns {Router}
     * @memberof Router
     */},{key:'always',value:function b(a){return this.alwaysFunc=a,this}/**
     * Parse route by regexp or route mask
     * @param {string} route
     * @returns {*}
     * @memberof Router
     */},{key:'_getRouteParser',value:function d(a){var b=[],c=void 0;return a instanceof RegExp?c=a:(c=a.replace(/([:*])(\w+)/g,function(a,c,d){return b.push(d),'([^/]+)'}).replace(/\*/g,'(?:.*)'),c=new RegExp(c+'(?:/$|$)')),{paramNames:b,regexp:c}}/**
     * Collect route params from matches founded in route path
     * @param {*} match
     * @param {*} paramNames
     * @returns {*}
     * @private
     * @memberof Router
     */},{key:'_collectRouteParams',value:function c(a,b){return a.slice(1,a.length).reduce(function(a,c,d){return a[b[d]]=decodeURIComponent(c),a},{})}/**
     * Location change callback
     * @param {Boolean} applied
     * @private
     * @memberof Router
     */},{key:'_onLocationChange',value:function d(a){var b=this,c=decodeURI(location.pathname);// Resolve already in progress
return this.options.debug&&log('pushChange, '+c),a instanceof Event&&(a=!1),this._resolving?this._resolving:this._resolving=this._resolver(this._prevUrl,c).then(function(d){return d?(b._resolving=!1,b._resolveLocation(c,history.state,a)):b._revertState().then(function(){return b._resolving=!1,!1})})}/**
     * Revert state to previous saved
     */},{key:'_revertState',value:function a(){// First loaded state
return this._prevUrl?this.pushState(this._prevUrl,this._prevState):Promise.resolve(this.popState());// remove forward button
}/**
     * Resolve location
     * @param {string} path
     * @param {null|object} state
     * @param {boolean} applied
     */},{key:'_resolveLocation',value:function d(a,b,c){return this._handleRoutes(a,b,c),this._saveState(a,b),this.alwaysFunc(a),Promise.resolve(!0)}/**
     * Apply routes handler to current route
     * @param {string} path
     * @param {null|object} state
     * @param {boolean} applied
     */},{key:'_handleRoutes',value:function f(a,b,c){for(var g=0;g<this.routes.length;g++){var d=this._getRouteParser(this.routes[g].route),e=a.match(d.regexp);if(e){var h=this._collectRouteParams(e,d.paramNames);this.routes[g].handler.call(null,{path:a,state:b,params:h,applied:c});break}}}/**
     * Subscribe browser events
     */},{key:'_subscribe',value:function a(){this._subscribed||(window.addEventListener('popstate',this._onLocationChange),this._subscribed=!0)}/**
     * Unsubscripe browser popstate
     */},{key:'_unsubscribe',value:function a(){this._subscribed&&(window.removeEventListener('popstate',this._onLocationChange),this._subscribed=!1)}/**
     * Save last handled state of route
     * @param {string} url
     * @param {object|null} state
     */},{key:'_saveState',value:function c(a,b){this._prevUrl=a,this._prevState=b}}]),a}();/**
 * Router
 * @export
 * @class Router
 */