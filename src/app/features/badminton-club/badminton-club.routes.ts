import { Routes } from '@angular/router';

export const badmintonClubRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/club-page/club-page.component')
        .then((m) => m.ClubPageComponent)
  }
];