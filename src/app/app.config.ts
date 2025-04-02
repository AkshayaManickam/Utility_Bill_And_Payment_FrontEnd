import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr'; // ✅ Import ToastrModule

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(BrowserAnimationsModule), // ✅ Ensure animations are provided
    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot({  
      timeOut: 1000,  // ✅ Ensure toast stays visible
      positionClass: 'toast-top-right',  // ✅ Adjust position
      preventDuplicates: true,
      closeButton: true
    }))
  ]
};
