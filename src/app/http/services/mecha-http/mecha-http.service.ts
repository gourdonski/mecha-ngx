import { Inject, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import * as Immutable from 'immutable';
import { AsyncSubject, Observable, Subject } from 'rxjs';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { APP_CONFIG, AppConfigInterface } from '../../../abstract/app-config.abstract';
import { CACHE, CacheInterface } from '../../../abstract/cache.abstract';
import { MechaHttpResponse, MechaHttpResponseInterface } from '../../models/mecha-http-response.model';
import { MechaUtilService } from '../../../shared/services/mecha-util/mecha-util.service';

interface RequestNumberInterface { requestNumber: number; }

const ARBITRARY_TOKEN_VALUE: string = ' ';

@Injectable()
export class MechaHttpService {
  private _requesterHistory: { [key: string]: RequestNumberInterface } = {};

  private _isDebouncingRequest: boolean = false;

  private _debouncedResponseSource: AsyncSubject<MechaHttpResponseInterface<any>>;

  private _cachedSource: AsyncSubject<MechaHttpResponseInterface<any>>;

  private _cachedImmutableSource: AsyncSubject<MechaHttpResponseInterface<any>>;

  constructor(
    @Inject(APP_CONFIG) private readonly _appConfig: AppConfigInterface, 
    @Inject(CACHE) private readonly _cache: CacheInterface,
    private readonly _http: Http,
    private readonly _util: MechaUtilService) { }

  /**
   * Vanilla get request
   * @param {string} url URL to get resource from
   *
   * @returns {Observable<MechaHttpResponseInterface<T>>} The response as an observable
  */
  public get<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'get';

    return this._http
      .get(url)
      .catch(this.handleResponseError)
      .map((response: Response) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }));
  }

  /**
   * Thwart spammers with a debounced get
   * @param {string} url URL to get resource from
   * @param {number} [debounceInMilliseconds=1000] Length of time to debounce before submitting request
   *
   * @returns {Observable<MechaHttpResponseInterface<T>>} The debounced response as an observable
  */
  public getDebounced<T>(url: string, debounceInMilliseconds: number = 1000): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'getDebounced';

    if (!this._isDebouncingRequest) {
      this._debouncedResponseSource = new AsyncSubject<MechaHttpResponseInterface<any>>();

      this._http.get(url)
        .takeUntil(this._debouncedResponseSource)
        .debounceTime(debounceInMilliseconds)
        .catch(this.handleResponseError)
        .map((response: Response) => new MechaHttpResponse<T>({
          requester: requester,
          requestNumber: this.getRequestNumber(requester),
          data: this.getResponseJson<T>(response),
        }))
        .subscribe((response: MechaHttpResponseInterface<T>) => {
          this._debouncedResponseSource.next(response);

          this._debouncedResponseSource.complete();
        }, (err: any) => {
          this._debouncedResponseSource.error(err);

          this._debouncedResponseSource.complete();
        }, () => this._isDebouncingRequest = false);
    }
    
    this._isDebouncingRequest = true;

    return this._debouncedResponseSource;
  }

 /**
   * Get responses until a condition is met, just because
   * @param {string} url URL to get resource from
   * @param {Subject<void>} cancelToken Token used to cancel the interval
   * @param {number} [intervalInMilliseconds=1000] Length of time for each interval
   * @param {number} [numberOfIntervals] Number of times to execute request
   * 
   * @returns {Observable<MechaHttpResponseInterface<T>>} The response in intervals as an observable
  */
  public getUntil<T>(url: string, cancelToken: Subject<void>, intervalInMilliseconds: number = 1000, numberOfIntervals?: number): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'getUntil';

    let getUntil$: Observable<number> = Observable
      .interval(intervalInMilliseconds)
      .takeUntil(cancelToken);

    if (numberOfIntervals) {
      getUntil$ = getUntil$.take(numberOfIntervals);
    }

    return getUntil$
      .switchMap(() => this._http.get(url))
      .catch(this.handleResponseError)
      .map((response: Response) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }))
      .share();
  }

  /**
   * Share a single request amongst subscribers
   * @param {string} url URL to get resource from
   * 
   * @returns {Observable<MechaHttpResponseInterface<T>>} The shared response as an observable
  */
  public getShared<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'getShared';

    return this._http
      .get(url)
      .catch(this.handleResponseError)
      .map((response: Response) => new MechaHttpResponse<T>({
        requester: requester,
        requestNumber: this.getRequestNumber(requester),
        data: this.getResponseJson<T>(response),
      }))
      .share();
  }


  /**
   * Make sure nothing is messing with your response
   * @param {string} url URL to get resource from
   *
   * @returns {Observable<MechaHttpResponseInterface<T>>} The response shared immutably as an observable
  */
  public getImmutable<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'getImmutable';

    return this._http
      .get(url)
      .catch(this.handleResponseError)
      .map((response: Response) => Immutable
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
   * @param {string} url URL to get resource from
   *
   * @returns {Observable<MechaHttpResponseInterface<T>>} The cached response as an observable
  */
  public getCached<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'getCached';
    
    const key: number = this._util.getHashCode(url); // hashing URL and using as key in cache.
    
    const token: string = this._cache.find(key);

    // if initial call or cache is expired, make fetch.
    if (token == null) {
      this._cache.add(key, ARBITRARY_TOKEN_VALUE);

      // clean up existing subject before re-initializing.
      if (this._cachedSource) {
        this._cachedSource.unsubscribe();
      }

      this._cachedSource = new AsyncSubject();

      this._http
        .get(url)
        .catch(this.handleResponseError)
        .map((response: Response) => new MechaHttpResponse<T>({
          requester: requester,
          requestNumber: this.getRequestNumber(requester),
          data: this.getResponseJson<T>(response),
        }))
        .subscribe((response: MechaHttpResponseInterface<T>) => {
          this._cachedSource.next(response);

          this._cachedSource.complete();
        }, (err: any) => this._cachedSource.error(err));
    }

    return this._cachedSource;
  }

  /**
   * Cache a response to save trips to the backend and pass immutable copy to subscribers so they don't mess with each other
   * @param {string} url URL to get resource from
   *
   * @returns {Observable<MechaHttpResponseInterface<T>>} The cached response shared immutably as an observable
  */
  public getCachedImmutable<T>(url: string): Observable<MechaHttpResponseInterface<T>> {
    const requester: string = 'getCachedImmutable';

    const key: number = this._util.getHashCode(`immutable${url}`); // hashing URL and using as key in cache

    const token: string = this._cache.find(key);

    // if initial call or cache is expired, make fetch.
    if (token == null) {
      this._cache.add(key, ARBITRARY_TOKEN_VALUE);

      // clean up existing subject before re-initializing.
      if (this._cachedImmutableSource) {
        this._cachedImmutableSource.unsubscribe();
      }

      this._cachedImmutableSource = new AsyncSubject();

      this._http
        .get(url)
        .catch(this.handleResponseError)
        .map((response: Response) => Immutable
          .fromJS(new MechaHttpResponse<T>({
            requester: requester,
            requestNumber: this.getRequestNumber(requester),
            data: this.getResponseJson<T>(response),
          })))
        .subscribe((result: any) => {
          this._cachedImmutableSource.next(result);

          this._cachedImmutableSource.complete();
        }, (err: any) => this._cachedImmutableSource.error(err));
    }

    return this._cachedImmutableSource.map((immutable: any) => immutable.toJS());
  }

  private getRequestNumber(requester: string): number {
    return ++(this._requesterHistory[requester] = this._requesterHistory[requester] || { requestNumber: 0 }).requestNumber
  }

  // the following are based on the Angular Http service doc
  private getResponseJson<T>(response: Response): T {
    const json = response.json();

    if (json == null) {
      return null;
    }

    return typeof json.data === 'undefined' ? json : json.data;
  }

  private handleResponseError(error: any): Observable<string> {
    let errorMessage: string;

    if (error instanceof Response) {
      const json = error.json();
      
      const err = json.error || JSON.stringify(json);

      errorMessage = `${error.status}${error.statusText ? ' ' + error.statusText : ''} - ${err}`;
    } 
    else errorMessage = error.message ? error.message : error.toString();

    return Observable.throw(errorMessage);
  }
}
