import { TestBed, inject } from '@angular/core/testing';

import { MechaCacheService } from './mecha-cache.service';

describe('MechaCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MechaCacheService]
    });
  });

  it('should be created', inject([MechaCacheService], (service: MechaCacheService) => {
    expect(service).toBeTruthy();
  }));
});
