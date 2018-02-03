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
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';

import { APP_CONFIG, AppConfigInterface } from '../../abstract/app-config.abstract';
import { CACHE, CacheInterface } from '../../abstract/cache.abstract';
import { MechaHttpResponse, MechaHttpResponseInterface } from '../models/mecha-http-response.model';

interface RequestNumberInterface {
  requestNumber: number;
}

@Injectable()
export class MechaHttpService {
  private _requesterHistory: { [key: string]: RequestNumberInterface } = {};

  private _isDebouncingRequest: boolean = false;

  private _debouncedResponseSource: AsyncSubject<MechaHttpResponseInterface<any>>;

  constructor(
    @Inject(APP_CONFIG) private readonly _appConfig: AppConfigInterface, 
    @Inject(CACHE) private readonly _cache: CacheInterface,
    private readonly _http: Http) { }

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
        data: this.getResponseJson<T>(response)
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
          data: this.getResponseJson<T>(response)
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
