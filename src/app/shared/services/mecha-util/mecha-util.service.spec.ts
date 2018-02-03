import { TestBed, inject } from '@angular/core/testing';

import { MechaUtilService } from './mecha-util.service';

describe('MechaUtilService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MechaUtilService]
    });
  });

  it('should return consistent hash codes', inject([MechaUtilService], (service: MechaUtilService) => {
    const hashCode1: number = service.getHashCode('teststring');

    const hashCode2: number = service.getHashCode('teststring');

    expect(hashCode1).toEqual(hashCode2);
  }));
});
