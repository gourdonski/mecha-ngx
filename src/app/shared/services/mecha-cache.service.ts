import { Inject, Injectable } from '@angular/core';

import * as molar from 'molar';

import { APP_CONFIG, AppConfig } from '../../abstract/app-config.abstract';
import { Cache } from '../../abstract/cache.abstract';

@Injectable()
export class MechaCacheService implements Cache {
  private _cache: molar.ILookup;

  constructor(@Inject(APP_CONFIG) readonly appConfig: AppConfig) {
      this._cache = new molar.Lookup(false, appConfig.cacheTtl);
  }

  /**
   * Adds an entry to the cache using a key
   * @param {any} key
   * @param {any} value
   * @returns {boolean} Flag indicating if entry was successfully added
  */
  add(key: any, value: any): boolean {
      return this._cache.add(key, value);
  }

  /**
   * Removes an entry from the cache by key
   * @param {any} key
   * @returns {boolean} Flag indicating if removal was successful
  */
  remove(key: any): boolean {
      return this._cache.remove(key) > 0;
  }

  /**
   * Finds an entry in the cache by key
   * @param {any} key
   * @returns {any} The matching entry, if one exists
  */
  find(key: any): any {
      return this._cache.find(key)[0];
  }

  /**
   * Checks if an entry exists in the cache by key
   * @param {any} key
   * @returns {boolean} Flag indicating if entry exists in the cache
  */
  contains(key: any): boolean {
      return this._cache.contains(key);
  }

  /**
   * Remove all entries from the cache
  */
  dump(): void {
      this._cache.clear();
  }
}
