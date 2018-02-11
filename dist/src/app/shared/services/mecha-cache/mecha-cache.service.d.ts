import { AppConfigInterface } from '../../../abstract/app-config.abstract';
import { CacheInterface } from '../../../abstract/cache.abstract';
export declare class MechaCacheService implements CacheInterface {
    private readonly _appConfig;
    private _cache;
    constructor(_appConfig: AppConfigInterface);
    /**
     * Adds a resource to the cache using a key
     * @param key Key provided to identify the resource in the cache
     * @param value Value for the resource in the cache
     *
     * @returns Flag indicating if resource was successfully added
    */
    add(key: any, value: any, onDestroy?: () => void): boolean;
    /**
     * Removes a resource from the cache by key
     * @param key Key provided to identify the resource in the cache
     *
     * @returns Flag indicating if removal was successful
    */
    remove(key: any): boolean;
    /**
     * Finds a resource in the cache by key
     * @param key Key provided to identify the resource in the cache
     *
     * @returns The matching resource, if one exists
    */
    find(key: any): any;
    /**
     * Checks if a resource exists in the cache by key
     * @param key Key provided to identify the resource in the cache
     *
     * @returns Flag indicating if resource exists in the cache
    */
    contains(key: any): boolean;
    /**
     * Remove all resources from the cache
    */
    dump(): void;
    /**
     * Get time to live in milliseconds for resources in cache
     *
     * @returns Time to live in milliseconds
     */
    getCacheTtl(): number;
}
