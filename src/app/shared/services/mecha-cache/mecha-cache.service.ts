import { Inject, Injectable } from '@angular/core';

import * as molar from 'molar';

import { APP_CONFIG, AppConfigInterface } from '../../../abstract/app-config.abstract';
import { CacheInterface } from '../../../abstract/cache.abstract';

@Injectable()
export class MechaCacheService implements CacheInterface {
  // using a simple caching library that checks for expiration on retrieval
  private _cache: molar.ILookup;

  constructor(@Inject(APP_CONFIG) private readonly _appConfig: AppConfigInterface) {
    this._cache = new molar.Lookup(false, _appConfig.cacheTtl);
  }

  /**
   * Adds a resource to the cache using a key
   * @param key Key provided to identify the resource in the cache
   * @param value Value for the resource in the cache
   *
   * @returns Flag indicating if resource was successfully added
  */
  public add(key: any, value: any, onDestroy?: () => void): boolean {
    return this._cache.add(key, value, onDestroy);
  }

  /**
   * Removes a resource from the cache by key
   * @param key Key provided to identify the resource in the cache
   *
   * @returns Flag indicating if removal was successful
  */
  public remove(key: any): boolean {
    return this._cache.remove(key) > 0;
  }

  /**
   * Finds a resource in the cache by key
   * @param key Key provided to identify the resource in the cache
   *
   * @returns The matching resource, if one exists
  */
  public find(key: any): any {
    return this._cache.find(key)[0];
  }

  /**
   * Checks if a resource exists in the cache by key
   * @param key Key provided to identify the resource in the cache
   *
   * @returns Flag indicating if resource exists in the cache
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

  /**
   * Get time to live in milliseconds for resources in cache
   *
   * @returns Time to live in milliseconds
   */
  public getCacheTtl(): number {
    return this._appConfig.cacheTtl;
  }
}
