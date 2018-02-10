import { InjectionToken } from '@angular/core';
export interface AppConfigInterface {
    cacheTtl: number;
}
export declare const APP_CONFIG: InjectionToken<AppConfigInterface>;
