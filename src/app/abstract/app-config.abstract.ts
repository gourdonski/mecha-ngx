import { InjectionToken } from '@angular/core';

export interface AppConfigInterface {
    cacheTtl: number;
}

export const APP_CONFIG: InjectionToken<AppConfigInterface> = new InjectionToken<AppConfigInterface>('mechaAppConfig');
