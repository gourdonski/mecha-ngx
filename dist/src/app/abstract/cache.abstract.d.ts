import { InjectionToken } from '@angular/core';
export interface CacheInterface {
    add(key: any, value: any, onDestroy?: () => void): void | boolean;
    remove(key: any): void | boolean;
    find(key: any): any;
    contains(key: any): boolean;
    dump(): void;
    getCacheTtl(): number;
}
export declare const CACHE: InjectionToken<CacheInterface>;
