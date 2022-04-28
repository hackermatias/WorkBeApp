import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';
import { StartPage } from './start/start.page';
import { FarmsPage } from './farms/farms.page';
import { LocationPage } from './location/location.page';
import { SettingsPage } from './settings/settings.page';
import { RecordsPage } from './records/records.page';
import { SyncPage } from './sync/sync.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full'
  },
  {
    path: 'start',
    component: StartPage
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'home',
    component: HomePage
  },
  {
    path: 'farms',
    component: FarmsPage
  },
  {
    path: 'location/:id',
    component: LocationPage
  },
  {
    path: 'settings',
    component: SettingsPage
  },
  {
    path: 'records',
    component: RecordsPage
  },
  {
    path: 'sync',
    component: SyncPage
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
