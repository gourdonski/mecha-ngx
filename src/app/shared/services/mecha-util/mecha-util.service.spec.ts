import { TestBed, inject } from '@angular/core/testing';

import { MechaUtilService } from './mecha-util.service';

describe('MechaUtilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MechaUtilService]
    });
  });

  it('should be created', inject([MechaUtilService], (service: MechaUtilService) => {
    expect(service).toBeTruthy();
  }));
});
