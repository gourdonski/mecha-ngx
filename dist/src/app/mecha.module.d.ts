import { ModuleWithProviders } from '@angular/core';
import { AppConfigInterface } from './abstract/app-config.abstract';
import { CacheInterface } from './abstract/cache.abstract';
export interface MechaModuleOptionsInterface {
    appConfig: AppConfigInterface;
    cacheClass: new (...args: any[]) => CacheInterface;
}
export declare class MechaModule {
    static forRoot({appConfig, cacheClass}: MechaModuleOptionsInterface): ModuleWithProviders;
}
