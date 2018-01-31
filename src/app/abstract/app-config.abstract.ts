import { InjectionToken } from '@angular/core';

export interface AppConfig {
    cacheTtl: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('appConfig');