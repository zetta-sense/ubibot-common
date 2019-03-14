import { TestBed } from '@angular/core/testing';

import { UbiSyncService } from './ubi-sync.service';

describe('UbiSyncService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UbiSyncService = TestBed.get(UbiSyncService);
    expect(service).toBeTruthy();
  });
});
