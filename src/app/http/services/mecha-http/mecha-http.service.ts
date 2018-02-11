import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import * as Immutable from 'immutable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
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

import { APP_CONFIG, AppConfigInterface } from '../../../abstract/app-config.abstract';
import { CACHE, CacheInterface } from '../../../abstract/cache.abstract';
import { MechaHttpResponse, MechaHttpResponseInterface } from '../../models/mecha-http-response.model';
import { MechaUtilService } from '../../../shared/services/mecha-util/mecha-util.service';

interface RequestNumberInterface { requestNumber: number; }

@Injectable()
export class MechaHttpService {
  private _requesterHistory: { [key: string]: RequestNumberInterface } = {};

  constructor(
    @Inject(APP_CONFIG) private readonly _appConfig: AppConfigInterface,
    @Inject(CACHE) private readonly _cache: CacheInterface,
    private readonly _http: HttpClient,
    private readonly _util: MechaUtilService) { }

  /**
   * Vanilla get request
   * @param url URL to get resource from
   *
   * @returns The response as an observable
  */
  public get<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester = 'get';

    return this._http
      .get(url)
      .catch(this.handleResponseError)
      .map((response: HttpResponse<T>) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }));
  }

  /**
   * Share a single request amongst subscribers
   * @param url URL to get resource from
   *
   * @returns The shared response as an observable
  */
  public getShared<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester = 'getShared';

    return this._http
      .get(url)
      .catch(this.handleResponseError)
      .map((response: HttpResponse<T>) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }))
      .share();
  }

  /**
   * Thwart spammers with a debounced get
   * @param url URL to get resource from
   * @param requestSource Source subject for making requests
   * @param [debounceInMilliseconds=1000] Length of time to debounce before submitting request
   *
   * @returns The debounced response as an observable
  */
  public getDebounced<T>(url: string, requestSource: Subject<any>, debounceInMilliseconds: number = 1000):
    Observable<MechaHttpResponseInterface<T>> {
    const requester = 'getDebounced';

    return requestSource
      .debounceTime(debounceInMilliseconds)
      .switchMap(() => this._http.get(url))
      .catch(this.handleResponseError)
      .map((response: HttpResponse<T>) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }))
      .share();
  }

 /**
   * Get responses until a condition is met, just because
   * @param url URL to get resource from
   * @param cancelToken Token used to cancel the interval
   * @param [intervalInMilliseconds=1000] Length of time for each interval
   * @param [numberOfIntervals] Number of times to execute request
   *
   * @returns The response in intervals as an observable
  */
  public getUntil<T>(url: string, cancelToken: Subject<void>, intervalInMilliseconds: number = 1000, numberOfIntervals?: number):
    Observable<MechaHttpResponseInterface<T>> {
    const requester = 'getUntil';

    let getUntil$: Observable<number> = Observable
      .interval(intervalInMilliseconds)
      .takeUntil(cancelToken);

    if (numberOfIntervals != null) {
      getUntil$ = getUntil$.take(numberOfIntervals);
    }

    return getUntil$
      .switchMap(() => this._http.get(url))
      .catch(this.handleResponseError)
      .map((response: HttpResponse<T>) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }))
      .share();
  }

  /**
   * Make sure nothing is messing with your response
   * @param url URL to get resource from
   *
   * @returns The response shared immutably as an observable
  */
  public getImmutable<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester = 'getImmutable';

    return this._http
      .get(url)
      .catch(this.handleResponseError)
      .map((response: HttpResponse<T>) => Immutable
        .fromJS(new MechaHttpResponse<T>({
          requester: requester,
          requestNumber: this.getRequestNumber(requester),
          data: this.getResponseJson<T>(response),
        })))
      .share()
      .map((immutable: any) => immutable.toJS());
  }

  /**
   * Cache a response to save trips to the backend
   * @param url URL to get resource from
   *
   * @returns The cached response as an observable
  */
  public getCached<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    try {
      const requester = 'getCached';

      const key: number = this._util.getHashCode(url); // hashing URL and using as key in cache

      let cachedSource: AsyncSubject<MechaHttpResponseInterface<T>> = this._cache.find(key);

      // if initial call or cache is expired, make fetch
      if (cachedSource == null) {
        cachedSource = new AsyncSubject();

        this._cache.add(key, cachedSource, () => cachedSource.complete());

        this._http
          .get(url)
          .catch(this.handleResponseError)
          .map((response: HttpResponse<T>) => new MechaHttpResponse<T>({
            requester: requester,
            requestNumber: this.getRequestNumber(requester),
            data: this.getResponseJson<T>(response),
          }))
          .subscribe(cachedSource);
      }

      return cachedSource.asObservable();
    } catch (err) {
      return Observable.throw(err);
    }
  }

  /**
   * Cache a response to save trips to the backend and pass immutable copy to subscribers so they don't mess with each other
   * @param url URL to get resource from
   *
   * @returns The cached response shared immutably as an observable
  */
  public getCachedImmutable<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    try {
      const requester = 'getCachedImmutable';

      const key: number = this._util.getHashCode(`immutable${url}`); // hashing URL and using as key in cache

      let cachedImmutableSource: AsyncSubject<MechaHttpResponseInterface<T>> = this._cache.find(key);

      // if initial call or cache is expired, make fetch
      if (cachedImmutableSource == null) {
        cachedImmutableSource = new AsyncSubject();

        this._cache.add(key, cachedImmutableSource, () => cachedImmutableSource.complete());

        this._http
          .get(url)
          .catch(this.handleResponseError)
          .map((response: HttpResponse<T>) => Immutable
            .fromJS(new MechaHttpResponse<T>({
              requester: requester,
              requestNumber: this.getRequestNumber(requester),
              data: this.getResponseJson<T>(response),
            })))
          .subscribe(cachedImmutableSource);
      }

      return cachedImmutableSource.map((immutable: any) => immutable.toJS());
    } catch (err) {
      return Observable.throw(err);
    }
  }

  private getRequestNumber(requester: string): number {
    return ++(this._requesterHistory[requester] = this._requesterHistory[requester] || { requestNumber: 0 }).requestNumber;
  }

  // the following are based on the Angular Http service doc
  private getResponseJson<T>(response: HttpResponse<T>): T {
    try {
      return response.body;
    } catch (err) {
      return err;
    }
  }

  private handleResponseError(error: any): Observable<string> {
    let errorMessage: string;

    if (error instanceof HttpResponse) {
      const json = error.body;

      const err = json.error || JSON.stringify(json);

      errorMessage = this.formatError(error.status, error.statusText, err);
    } else { errorMessage = error.message ? error.message : error.toString(); }

    return Observable.throw(errorMessage);
  }

  private formatError = (errorStatus: number | string, errorStatusText?: string, errorMessage?: string): string =>
    `${errorStatus}${errorStatusText == null ? '' : ' ' + errorStatusText}${errorMessage == null ? '' : ' - ' + errorMessage}`
}
