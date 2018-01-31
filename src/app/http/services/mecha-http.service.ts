import { Inject, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { APP_CONFIG, AppConfig } from '../../abstract/app-config.abstract';
import { CACHE, Cache } from '../../abstract/cache.abstract';

@Injectable()
export class MechaHttpService {
  constructor(
    @Inject(APP_CONFIG) private readonly _appConfig, 
    @Inject(CACHE) private readonly _cache,
    private readonly _http: Http) { }
}
