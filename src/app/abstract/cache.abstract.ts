import { InjectionToken } from '@angular/core';

export interface CacheInterface {
    add(key: any, value: any): void | boolean;
    remove(key: any): void | boolean;
    find(key: any): any;
    contains(key: any): boolean;
    dump(): void;
    getCacheTtl(): number;
}

export const CACHE: InjectionToken<CacheInterface> = new InjectionToken<CacheInterface>('mechaCache');
