import { TestBed } from '@angular/core/testing';

import { HelpServiceService } from './help-service.service';

describe('HelpServiceService', () => {
  let service: HelpServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
