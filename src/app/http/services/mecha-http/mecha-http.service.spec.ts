import { TestBed, inject } from '@angular/core/testing';

import { MechaHttpService } from './mecha-http.service';

describe('MechaHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MechaHttpService]
    });
  });

  it('should be created', inject([MechaHttpService], (service: MechaHttpService) => {
    expect(service).toBeTruthy();
  }));
});
