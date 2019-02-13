import { TestBed } from '@angular/core/testing';

import { UbiLocalizeService } from './ubi-localize.service';

describe('UbiLocalizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UbiLocalizeService = TestBed.get(UbiLocalizeService);
    expect(service).toBeTruthy();
  });
});
