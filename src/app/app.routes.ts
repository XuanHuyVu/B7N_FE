import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/badminton-club/badminton-club.routes')
        .then((m) => m.badmintonClubRoutes)
  },
  { path: '**', redirectTo: '' }
];