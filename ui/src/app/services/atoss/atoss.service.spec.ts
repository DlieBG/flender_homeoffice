import { TestBed } from '@angular/core/testing';

import { AtossService } from './atoss.service';

describe('AtossService', () => {
  let service: AtossService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtossService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
