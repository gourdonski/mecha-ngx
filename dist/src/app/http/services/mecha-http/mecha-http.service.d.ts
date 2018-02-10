import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
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
import { AppConfigInterface } from '../../../abstract/app-config.abstract';
import { CacheInterface } from '../../../abstract/cache.abstract';
import { MechaHttpResponseInterface } from '../../models/mecha-http-response.model';
import { MechaUtilService } from '../../../shared/services/mecha-util/mecha-util.service';
export declare class MechaHttpService {
    private readonly _appConfig;
    private readonly _cache;
    private readonly _http;
    private readonly _util;
    private _requestLookup;
    private _requesterHistory;
    private _isDebouncingRequest;
    private _debouncedSource;
    private _cachedSource;
    private _cachedImmutableSource;
    constructor(_appConfig: AppConfigInterface, _cache: CacheInterface, _http: HttpClient, _util: MechaUtilService);
    /**
     * Vanilla get request
     * @param url URL to get resource from
     *
     * @returns The response as an observable
    */
    get<T>(url: string): Observable<MechaHttpResponseInterface<T>>;
    /**
     * Share a single request amongst subscribers
     * @param url URL to get resource from
     *
     * @returns The shared response as an observable
    */
    getShared<T>(url: string): Observable<MechaHttpResponseInterface<T>>;
    /**
     * Thwart spammers with a debounced get
     * @param url URL to get resource from
     * @param [debounceInMilliseconds=1000] Length of time to debounce before submitting request
     *
     * @returns The debounced response as an observable
    */
    getDebounced<T>(url: string, debounceInMilliseconds?: number): Observable<MechaHttpResponseInterface<T>>;
    /**
      * Get responses until a condition is met, just because
      * @param url URL to get resource from
      * @param cancelToken Token used to cancel the interval
      * @param [intervalInMilliseconds=1000] Length of time for each interval
      * @param [numberOfIntervals] Number of times to execute request
      *
      * @returns The response in intervals as an observable
     */
    getUntil<T>(url: string, cancelToken: Subject<void>, intervalInMilliseconds?: number, numberOfIntervals?: number): Observable<MechaHttpResponseInterface<T>>;
    /**
     * Make sure nothing is messing with your response
     * @param url URL to get resource from
     *
     * @returns The response shared immutably as an observable
    */
    getImmutable<T>(url: string): Observable<MechaHttpResponseInterface<T>>;
    /**
     * Cache a response to save trips to the backend
     * @param url URL to get resource from
     *
     * @returns The cached response as an observable
    */
    getCached<T>(url: string): Observable<MechaHttpResponseInterface<T>>;
    /**
     * Cache a response to save trips to the backend and pass immutable copy to subscribers so they don't mess with each other
     * @param url URL to get resource from
     *
     * @returns The cached response shared immutably as an observable
    */
    getCachedImmutable<T>(url: string): Observable<MechaHttpResponseInterface<T>>;
    private getRequestNumber(requester);
    private getResponseJson<T>(response);
    private handleResponseError(error);
}
