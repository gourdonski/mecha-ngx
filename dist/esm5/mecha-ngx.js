import { InjectionToken, Inject, Injectable, NgModule } from '@angular/core';
import { Lookup } from 'molar';
import { HttpClient, HttpResponse, HttpClientModule } from '@angular/common/http';
import { fromJS } from 'immutable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import { BrowserModule } from '@angular/platform-browser';
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
var APP_CONFIG = new InjectionToken('mechaAppConfig');
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */
var CACHE = new InjectionToken('mechaCache');
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var MechaCacheService = /** @class */ (function () {
    /**
     * @param {?} _appConfig
     */
    function MechaCacheService(_appConfig) {
        this._appConfig = _appConfig;
        this._cache = new Lookup(false, _appConfig.cacheTtl);
    }
    /**
     * Adds a resource to the cache using a key
     * @param {?} key Key provided to identify the resource in the cache
     * @param {?} value Value for the resource in the cache
     *
     * @return {?} Flag indicating if resource was successfully added
     */
    MechaCacheService.prototype.add = function (key, value) {
        return this._cache.add(key, value);
    };
    /**
     * Removes a resource from the cache by key
     * @param {?} key Key provided to identify the resource in the cache
     *
     * @return {?} Flag indicating if removal was successful
     */
    MechaCacheService.prototype.remove = function (key) {
        return this._cache.remove(key) > 0;
    };
    /**
     * Finds a resource in the cache by key
     * @param {?} key Key provided to identify the resource in the cache
     *
     * @return {?} The matching resource, if one exists
     */
    MechaCacheService.prototype.find = function (key) {
        return this._cache.find(key)[0];
    };
    /**
     * Checks if a resource exists in the cache by key
     * @param {?} key Key provided to identify the resource in the cache
     *
     * @return {?} Flag indicating if resource exists in the cache
     */
    MechaCacheService.prototype.contains = function (key) {
        return this._cache.contains(key);
    };
    /**
     * Remove all resources from the cache
     * @return {?}
     */
    MechaCacheService.prototype.dump = function () {
        this._cache.clear();
    };
    /**
     * Get time to live in milliseconds for resources in cache
     *
     * @return {?} Time to live in milliseconds
     */
    MechaCacheService.prototype.getCacheTtl = function () {
        return this._appConfig.cacheTtl;
    };
    return MechaCacheService;
}());
MechaCacheService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MechaCacheService.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Inject, args: [APP_CONFIG,] },] },
]; };
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var MechaHttpResponse = /** @class */ (function () {
    /**
     * @param {?} __0
     */
    function MechaHttpResponse(_a) {
        var requester = _a.requester, _b = _a.requestNumber, requestNumber = _b === void 0 ? 1 : _b, _c = _a.lastRequestTimestamp, lastRequestTimestamp = _c === void 0 ? new Date() : _c, data = _a.data;
        this.requester = requester;
        this.requestNumber = requestNumber;
        this.lastRequestTimestamp = lastRequestTimestamp;
        this.data = data;
    }
    return MechaHttpResponse;
}());
/**
 * @record
 */
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var MechaUtilService = /** @class */ (function () {
    function MechaUtilService() {
    }
    /**
     * Converts a string to a hash code
     * @param {?} val Value to be hashed
     *
     * @return {?} Hash code generated from input value
     */
    MechaUtilService.prototype.getHashCode = function (val) {
        if (!(typeof val === 'string' || val instanceof String)) {
            return null;
        }
        var /** @type {?} */ hash = 0;
        var /** @type {?} */ chr;
        if (val.length === 0) {
            return hash;
        }
        for (var /** @type {?} */ i = 0; i < val.length; i++) {
            chr = val.charCodeAt(i);
            // tslint:disable-next-line:no-bitwise
            hash = ((hash << 5) - hash) + chr;
            // tslint:disable-next-line:no-bitwise
            hash |= 0; // convert to 32-bit integer
        }
        return hash;
    };
    return MechaUtilService;
}());
MechaUtilService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MechaUtilService.ctorParameters = function () { return []; };
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var ARBITRARY_TOKEN_VALUE = ' ';
var MechaHttpService = /** @class */ (function () {
    /**
     * @param {?} _appConfig
     * @param {?} _cache
     * @param {?} _http
     * @param {?} _util
     */
    function MechaHttpService(_appConfig, _cache, _http, _util) {
        this._appConfig = _appConfig;
        this._cache = _cache;
        this._http = _http;
        this._util = _util;
        this._requestLookup = {};
        this._requesterHistory = {};
        this._isDebouncingRequest = false;
    }
    /**
     * Vanilla get request
     * @template T
     * @param {?} url URL to get resource from
     *
     * @return {?} The response as an observable
     */
    MechaHttpService.prototype.get = function (url) {
        var _this = this;
        var /** @type {?} */ requester = 'get';
        return this._http
            .get(url)
            .catch(this.handleResponseError)
            .map(function (response) { return new MechaHttpResponse({
            requester: requester,
            requestNumber: _this.getRequestNumber(requester),
            data: _this.getResponseJson(response),
        }); });
    };
    /**
     * Share a single request amongst subscribers
     * @template T
     * @param {?} url URL to get resource from
     *
     * @return {?} The shared response as an observable
     */
    MechaHttpService.prototype.getShared = function (url) {
        var _this = this;
        var /** @type {?} */ requester = 'getShared';
        return this._http
            .get(url)
            .catch(this.handleResponseError)
            .map(function (response) { return new MechaHttpResponse({
            requester: requester,
            requestNumber: _this.getRequestNumber(requester),
            data: _this.getResponseJson(response),
        }); })
            .share();
    };
    /**
     * Thwart spammers with a debounced get
     * @template T
     * @param {?} url URL to get resource from
     * @param {?=} debounceInMilliseconds
     * @return {?} The debounced response as an observable
     */
    MechaHttpService.prototype.getDebounced = function (url, debounceInMilliseconds) {
        var _this = this;
        if (debounceInMilliseconds === void 0) { debounceInMilliseconds = 1000; }
        var /** @type {?} */ requester = 'getDebounced';
        if (!this._isDebouncingRequest) {
            this._debouncedSource = new AsyncSubject();
            // not using switchMap because we don't want to hit backend at all until debounce completes
            this._http.get(url)
                .takeUntil(this._debouncedSource)
                .debounceTime(debounceInMilliseconds)
                .catch(this.handleResponseError)
                .map(function (response) { return new MechaHttpResponse({
                requester: requester,
                requestNumber: _this.getRequestNumber(requester),
                data: _this.getResponseJson(response),
            }); })
                .finally(function () { return _this._isDebouncingRequest = false; })
                .subscribe(this._debouncedSource);
        }
        this._isDebouncingRequest = true;
        return this._debouncedSource;
    };
    /**
     * Get responses until a condition is met, just because
     * @template T
     * @param {?} url URL to get resource from
     * @param {?} cancelToken Token used to cancel the interval
     * @param {?=} intervalInMilliseconds
     * @param {?=} numberOfIntervals
     * @return {?} The response in intervals as an observable
     */
    MechaHttpService.prototype.getUntil = function (url, cancelToken, intervalInMilliseconds, numberOfIntervals) {
        var _this = this;
        if (intervalInMilliseconds === void 0) { intervalInMilliseconds = 1000; }
        var /** @type {?} */ requester = 'getUntil';
        var /** @type {?} */ getUntil$ = Observable
            .interval(intervalInMilliseconds)
            .takeUntil(cancelToken);
        if (numberOfIntervals) {
            getUntil$ = getUntil$.take(numberOfIntervals);
        }
        return getUntil$
            .switchMap(function () { return _this._http.get(url); })
            .catch(this.handleResponseError)
            .map(function (response) { return new MechaHttpResponse({
            requester: requester,
            requestNumber: _this.getRequestNumber(requester),
            data: _this.getResponseJson(response),
        }); })
            .share();
    };
    /**
     * Make sure nothing is messing with your response
     * @template T
     * @param {?} url URL to get resource from
     *
     * @return {?} The response shared immutably as an observable
     */
    MechaHttpService.prototype.getImmutable = function (url) {
        var _this = this;
        var /** @type {?} */ requester = 'getImmutable';
        return this._http
            .get(url)
            .catch(this.handleResponseError)
            .map(function (response) { return fromJS(new MechaHttpResponse({
            requester: requester,
            requestNumber: _this.getRequestNumber(requester),
            data: _this.getResponseJson(response),
        })); })
            .share()
            .map(function (immutable) { return immutable.toJS(); });
    };
    /**
     * Cache a response to save trips to the backend
     * @template T
     * @param {?} url URL to get resource from
     *
     * @return {?} The cached response as an observable
     */
    MechaHttpService.prototype.getCached = function (url) {
        var _this = this;
        var /** @type {?} */ requester = 'getCached';
        var /** @type {?} */ key = this._util.getHashCode(url); // hashing URL and using as key in cache
        var /** @type {?} */ token = this._cache.find(key);
        // if initial call or cache is expired, make fetch
        if (token == null) {
            this._cache.add(key, ARBITRARY_TOKEN_VALUE);
            // clean up existing subject before re-initializing
            if (this._cachedSource != null) {
                this._cachedSource.complete();
            }
            this._cachedSource = new AsyncSubject();
            this._http
                .get(url)
                .catch(this.handleResponseError)
                .map(function (response) { return new MechaHttpResponse({
                requester: requester,
                requestNumber: _this.getRequestNumber(requester),
                data: _this.getResponseJson(response),
            }); })
                .subscribe(this._cachedSource);
        }
        return this._cachedSource;
    };
    /**
     * Cache a response to save trips to the backend and pass immutable copy to subscribers so they don't mess with each other
     * @template T
     * @param {?} url URL to get resource from
     *
     * @return {?} The cached response shared immutably as an observable
     */
    MechaHttpService.prototype.getCachedImmutable = function (url) {
        var _this = this;
        var /** @type {?} */ requester = 'getCachedImmutable';
        var /** @type {?} */ key = this._util.getHashCode("immutable" + url); // hashing URL and using as key in cache
        var /** @type {?} */ token = this._cache.find(key);
        // if initial call or cache is expired, make fetch
        if (token == null) {
            this._cache.add(key, ARBITRARY_TOKEN_VALUE);
            // clean up existing subject before re-initializing
            if (this._cachedImmutableSource != null) {
                this._cachedImmutableSource.complete();
            }
            this._cachedImmutableSource = new AsyncSubject();
            this._http
                .get(url)
                .catch(this.handleResponseError)
                .map(function (response) { return fromJS(new MechaHttpResponse({
                requester: requester,
                requestNumber: _this.getRequestNumber(requester),
                data: _this.getResponseJson(response),
            })); })
                .subscribe(this._cachedImmutableSource);
        }
        return this._cachedImmutableSource.map(function (immutable) { return immutable.toJS(); });
    };
    /**
     * @param {?} requester
     * @return {?}
     */
    MechaHttpService.prototype.getRequestNumber = function (requester) {
        return ++(this._requesterHistory[requester] = this._requesterHistory[requester] || { requestNumber: 0 }).requestNumber;
    };
    /**
     * @template T
     * @param {?} response
     * @return {?}
     */
    MechaHttpService.prototype.getResponseJson = function (response) {
        return response.body;
    };
    /**
     * @param {?} error
     * @return {?}
     */
    MechaHttpService.prototype.handleResponseError = function (error) {
        var /** @type {?} */ errorMessage;
        if (error instanceof HttpResponse) {
            var /** @type {?} */ json = error.body;
            var /** @type {?} */ err = json.error || JSON.stringify(json);
            errorMessage = "" + error.status + (error.statusText ? ' ' + error.statusText : '') + " - " + err;
        }
        else {
            errorMessage = error.message ? error.message : error.toString();
        }
        return Observable.throw(errorMessage);
    };
    return MechaHttpService;
}());
MechaHttpService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MechaHttpService.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Inject, args: [APP_CONFIG,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [CACHE,] },] },
    { type: HttpClient, },
    { type: MechaUtilService, },
]; };
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var defaultConfig = {
    cacheTtl: 60000,
};
/**
 * @record
 */
var MechaModule = /** @class */ (function () {
    function MechaModule() {
    }
    /**
     * @param {?} __0
     * @return {?}
     */
    MechaModule.forRoot = function (_a) {
        var _b = _a.appConfig, appConfig = _b === void 0 ? defaultConfig : _b, _c = _a.cacheClass, cacheClass = _c === void 0 ? MechaCacheService : _c;
        return {
            ngModule: MechaModule,
            providers: [
                { provide: APP_CONFIG, useValue: appConfig },
                { provide: CACHE, useClass: cacheClass },
            ]
        };
    };
    return MechaModule;
}());
MechaModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    BrowserModule,
                    HttpClientModule,
                ],
                providers: [
                    MechaHttpService,
                    MechaUtilService,
                ],
            },] },
];
/** @nocollapse */
MechaModule.ctorParameters = function () { return []; };
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */
export { MechaModule, APP_CONFIG as ɵc, CACHE as ɵe, MechaHttpService as ɵa, MechaUtilService as ɵf };
//# sourceMappingURL=mecha-ngx.js.map
