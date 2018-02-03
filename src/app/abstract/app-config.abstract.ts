import { InjectionToken } from '@angular/core';

export interface AppConfigInterface {
    cacheTtl: number;
}

export const APP_CONFIG = new InjectionToken<AppConfigInterface>('appConfig');