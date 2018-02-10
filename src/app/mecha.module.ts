import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { APP_CONFIG, AppConfigInterface } from './abstract/app-config.abstract';
import { CACHE, CacheInterface } from './abstract/cache.abstract';
import { MechaCacheService } from './shared/services/mecha-cache/mecha-cache.service';
import { MechaHttpService } from './http/services/mecha-http/mecha-http.service';
import { MechaUtilService } from './shared/services/mecha-util/mecha-util.service';

const defaultConfig: AppConfigInterface = {
  cacheTtl: 60000,
};

export interface MechaModuleOptionsInterface {
  appConfig?: AppConfigInterface;
  cacheClass?: new (...args: any[]) => CacheInterface;
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    MechaHttpService,
    MechaUtilService,
  ],
})
export class MechaModule {
  static forRoot({
      appConfig = defaultConfig,
      cacheClass = MechaCacheService,
    }: MechaModuleOptionsInterface): ModuleWithProviders {
    return {
      ngModule: MechaModule,
      providers: [
        { provide: APP_CONFIG, useValue: appConfig },
        { provide: CACHE, useClass: cacheClass },
      ]
    };
  }
}
