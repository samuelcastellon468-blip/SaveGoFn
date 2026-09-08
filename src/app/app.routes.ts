/*import { Routes } from '@angular/router';

export const routes: Routes = [];
*/
import { Routes } from '@angular/router';
import { Tiktok } from './components/tiktok/tiktok';
import { Whatsapp } from './components/whatsapp/whatsapp';
import { Saved } from './components/saved/saved';

export const routes: Routes = [
  { path: 'tiktok', component: Tiktok },
  { path: 'whatsapp', component: Whatsapp },
  { path: 'saved', component: Saved },
  { path: '', redirectTo: 'tiktok', pathMatch: 'full' },
  { path: '**', redirectTo: 'tiktok' }
];
