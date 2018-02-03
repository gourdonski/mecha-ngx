import { Inject, Injectable } from '@angular/core';

import * as molar from 'molar';

import { APP_CONFIG, AppConfigInterface } from '../../../abstract/app-config.abstract';
import { CacheInterface } from '../../../abstract/cache.abstract';

@Injectable()
export class MechaCacheService implements CacheInterface {
  // using a simple caching library that checks for expiration on retrieval
  private _cache: molar.ILookup;

  constructor(@Inject(APP_CONFIG) readonly appConfig: AppConfigInterface) {
    this._cache = new molar.Lookup(false, appConfig.cacheTtl);
  }

  /**
   * Adds a resource to the cache using a key
   * @param {any} key Key provided to identify the resource in the cache
   * @param {any} value Value for the resource in the cache
   *
   * @returns {boolean} Flag indicating if resource was successfully added
  */
  public add(key: any, value: any): boolean {
    return this._cache.add(key, value);
  }

  /**
   * Removes a resource from the cache by key
   * @param {any} key Key provided to identify the resource in the cache
   *
   * @returns {boolean} Flag indicating if removal was successful
  */
  public remove(key: any): boolean {
    return this._cache.remove(key) > 0;
  }

  /**
   * Finds a resource in the cache by key
   * @param {any} key Key provided to identify the resource in the cache
   *
   * @returns {any} The matching resource, if one exists
  */
  public find(key: any): any {
    return this._cache.find(key)[0];
  }

  /**
   * Checks if a resource exists in the cache by key
   * @param {any} key Key provided to identify the resource in the cache
   *
   * @returns {boolean} Flag indicating if resource exists in the cache
  */
  public contains(key: any): boolean {
    return this._cache.contains(key);
  }

  /**
   * Remove all resources from the cache
  */
  public dump(): void {
    this._cache.clear();
  }
}
