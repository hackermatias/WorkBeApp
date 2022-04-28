/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AbpHttpInterceptor } from 'abp-ng2-module';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { NFC, Ndef } from '@ionic-native/nfc/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { OCR } from '@ionic-native/ocr/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ServiceProxyModule } from '../shared/service-proxies/service-proxy.module';
import { SharedModule } from '../shared/shared.module';
import { AppSessionService } from '../shared/session/app-session.service';
import { AppAuthService } from '../shared/auth/app-auth.service';

import { API_BASE_URL } from '../shared/service-proxies/service-proxies';
import { AppConsts } from '../shared/AppConsts';
import { AppInitializer } from '../shared/app-initializer';

//Pages and Components
import { CardComponent } from './card/card.component';
import { CheckComponent } from './check/check.component';
import { DniComponent } from './dni/dni.component';
import { DoneComponent } from './done/done.component';
import { FailedAlertComponent } from './failed-alert/failed-alert.component';
import { FarmsPage } from './farms/farms.page';
import { HomePage } from './home/home.page';
import { LocationPage } from './location/location.page';
import { LoginPage } from './login/login.page';
import { RecordsPage } from './records/records.page';
import { SettingsPage } from './settings/settings.page';
import { SyncPage } from './sync/sync.page';
import { StartPage } from './start/start.page';
import { ValidateIdComponent } from './validate-id/validate-id.component';
import { VehicularControlComponent } from './vehicular-control/vehicular-control.component';
import { VehicularManifestComponent } from './vehicular-manifest/vehicular-manifest.component';
import { VehicularSingleResumeComponent } from './vehicular-single-resume/vehicular-single-resume.component';
import { VehicularSingleWorkersComponent } from './vehicular-single-workers/vehicular-single-workers.component';
import { VehicularSingleWorkersListComponent } from './vehicular-single-workers-list/vehicular-single-workers-list.component';



@NgModule({
  declarations: [
    AppComponent,
    CheckComponent,
    DniComponent,
    HomePage,
    FarmsPage,
    LocationPage,
    LoginPage,
    RecordsPage,
    StartPage,
    SettingsPage,
    ValidateIdComponent,
    VehicularControlComponent,
    CardComponent,
    FailedAlertComponent,
    VehicularSingleWorkersComponent,
    VehicularManifestComponent,
    VehicularSingleResumeComponent,
    VehicularSingleWorkersListComponent,
    DoneComponent,
    SyncPage
  ],
  entryComponents: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    AppRoutingModule,
    ServiceProxyModule,
    SharedModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    AppSessionService,
    AppAuthService,
    AppVersion,
    { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: API_BASE_URL, useFactory: () => AppConsts.remoteServiceBaseUrl },
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitializer: AppInitializer) => appInitializer.init(),
      deps: [AppInitializer],
      multi: true,
    },
    ScreenOrientation,
    NFC,
    Ndef,
    SplashScreen,
    StatusBar,
    TextToSpeech,
    NativeAudio,
    Device,
    Geolocation,
    BarcodeScanner,
    Camera,
    OCR
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
