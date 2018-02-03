import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { APP_CONFIG, AppConfigInterface } from './abstract/app-config.abstract';
import { CACHE, CacheInterface } from './abstract/cache.abstract';
import { MechaHttpService } from './http/services/mecha-http/mecha-http.service';
import { MechaCacheService } from './shared/services/mecha-cache/mecha-cache.service';

const defaultConfig: AppConfigInterface = {
  cacheTtl: 5000,
};

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
  ],
  providers: [
    MechaHttpService,
  ],
})
export class MechaModule {
  static forRoot(appConfig: AppConfigInterface = defaultConfig): ModuleWithProviders {
    return {
      ngModule: MechaModule,
      providers: [
        { provide: APP_CONFIG, useValue: appConfig },
        { provide: CACHE, useClass: MechaCacheService },
      ]
    };
  }
}
