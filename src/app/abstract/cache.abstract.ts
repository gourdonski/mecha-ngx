import { InjectionToken } from '@angular/core';

export interface Cache {
    add(key: any, value: any): void | boolean;
    remove(key: any): void | boolean;
    find(key: any): any;
    contains(key: any): boolean;
    dump(): void;
}

export const CACHE = new InjectionToken<Cache>('cache');