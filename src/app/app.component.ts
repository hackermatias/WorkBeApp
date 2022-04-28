import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonTabs,
  MenuController,
  Platform,
} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NFC } from '@ionic-native/nfc/ngx';
import { AppComponentBase } from '../shared/app-component-base';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SyncService } from '../shared/services/sync.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent extends AppComponentBase {
  @ViewChild(IonTabs) tabs: IonTabs;
  routePath: string;
  version = '';
  country: string;
  fullscreen = false;
  entrance = false;
  userName = '';

  syncSubscriptionP: Subscription;
  syncSubscriptionV: Subscription;

  constructor(
    injector: Injector,
    public menuController: MenuController,
    private screenOrientation: ScreenOrientation,
    private cdRef: ChangeDetectorRef,
    private alertController: AlertController,
    private appVersion: AppVersion,
    private nfc: NFC,
    private router: Router,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private syncService: SyncService
  ) {
    super(injector);
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      this.statusBar.styleBlackTranslucent();
      this.splashScreen.hide();
      this.appVersion
        .getVersionNumber()
        .then((value) => (this.version = value))
        .catch(() => (this.version = 'dev'));
      this.nfc.addNdefListener().subscribe((a) => {
        console.log('NdefListener', a);
      });
      if (this.appSession.user) {
        this.userName = this.appSession.user.userName;
      }
      this.storageService.getFullScreen().subscribe((fullscreen) => {
        this.fullscreen = fullscreen;
      });
      this.storageService.getEntrance().subscribe((entrance) => {
        this.entrance = entrance ? true : false;
      });
      this.router.navigate(['/start'], {
        replaceUrl: true,
      });
      this.storageService.get('Country').then(async (country: string) => {
        if (country) {
          this.country = country;
        } else {
          this.country = 'CL';
          await this.storageService.set('Country', this.country);
        }
      });
      this.tabs.outlet.stackEvents.subscribe((value) => {
        this.storageService.set(
          'FullScreen',
          value.enteringView.ref.instance.fullScreen ?? false
        );
        this.routePath = value.enteringView.stackId;
        this.cdRef.detectChanges();
      });
    });
  }

  goTo(event: MouseEvent, tab: string) {
    event.stopImmediatePropagation();
    this.router.navigate([tab], {
      replaceUrl: true,
    });
  }

  getCurrentLanguage() {
    const defaultLang = this.translate.getDefaultLang();
    switch (defaultLang) {
      case 'es':
        return this.translate.get('spanish');
      case 'en':
        return this.translate.get('english');
    }
  }

  getFlagName() {
    switch (this.country) {
      case 'CL':
        return 'chile';
      case 'PE':
        return 'peru';
      case 'EN':
        return 'united-kingdom';
    }
  }

  getCountryName() {
    switch (this.country) {
      case 'CL':
        return 'Chile';
      case 'PE':
        return 'Peru';
    }
  }

  async logout() {
    let attendancesP = await this.storageService.get('Attendances', true);
    let attendancesV = await this.storageService.get('VehicularAttendances', true);
    attendancesP = attendancesP ? attendancesP : [];
    attendancesV = attendancesV ? attendancesV : [];
    let syncPedestrian = await this.storageService.get('SyncPedestrian', true);
    let syncVehicular = await this.storageService.get('SyncVehicular', true);
    syncPedestrian = syncPedestrian ? syncPedestrian : [];
    syncVehicular = syncVehicular ? syncVehicular : [];
    if (attendancesP.length !== syncPedestrian.length) {
      const alert = await this.alertController.create({
        header: 'Error',
        mode: 'ios',
        message: await this.translate.get('logoutError').toPromise(),
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
    } else if (attendancesV.length !== syncVehicular.length) {
      const alert = await this.alertController.create({
        header: 'Error',
        mode: 'ios',
        message: await this.translate.get('logoutError').toPromise(),
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
    }
    else {
      const alert = await this.alertController.create({
        header: await this.translate.get('alert').toPromise(),
        mode: 'ios',
        message: await this.translate.get('logoutMsg').toPromise(),
        buttons: [
          {
            text: await this.translate.get('yes').toPromise(),
            handler: async () => {
              await this.storageService.clear();
              location.reload();
            },
          },
          {
            text: 'No',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
    }
  }

  async changeTranslate() {
    const alert = await this.alertController.create({
      header: await this.translate.get('changeTranslate').toPromise(),
      mode: 'ios',
      inputs: [
        {
          type: 'radio',
          name: 'language',
          value: 'es',
          label: await this.translate.get('spanish').toPromise(),
          checked: this.translate.defaultLang === 'es' && this.country === 'CL',
        },
        {
          type: 'radio',
          name: 'language',
          value: 'es_pe',
          label: await this.translate.get('spanish_pe').toPromise(),
          checked: this.translate.defaultLang === 'es' && this.country === 'PE',
        },
        {
          type: 'radio',
          name: 'language',
          value: 'en',
          label: await this.translate.get('english').toPromise(),
          checked: this.translate.defaultLang === 'en',
        },
      ],
      buttons: [
        {
          text: 'OK',
          handler: async (lang) => {
            if (lang) {
              await this.storageService.setDefaultLang(lang.split('_')[0]);
              if (lang.startsWith('es')) {
                if (lang.endsWith('_pe')) {
                  this.country = 'PE';
                } else {
                  this.country = 'CL';
                }
              } else {
                this.country = 'EN';
              }
              await this.storageService.set('Country', this.country);
            }
            this.menuController.close();
          },
        },
        {
          text: await this.translate.get('cancel').toPromise(),
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }
}
