import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation if authToken exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('validToken');
    expect(guard.canActivate()).toBeTrue();
  });

  it('should block navigation and redirect to login if authToken is missing', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(guard.canActivate()).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
