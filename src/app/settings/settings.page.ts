import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PickerController } from '@ionic/angular';
import { AppComponentBase } from '../../shared/app-component-base';
import { EntranceDto, FarmDto } from '../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage extends AppComponentBase implements OnInit {
  soundAlerts: boolean;
  restrictionAlert: boolean;
  screenBlockDelay: number;
  pickerSecCol: any;
  farm: FarmDto;
  entrance: EntranceDto;

  constructor(injector: Injector,
    private router: Router,
    private pickerController: PickerController,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.storageService.get('ScreenBlockDelay').then((screenBlockDelay) => {
      this.screenBlockDelay = screenBlockDelay || 4;
      this.storageService.get('SoundAlerts').then((soundAlerts) => {
        this.soundAlerts = soundAlerts || false;
        this.storageService.get('RestrictionAlert').then((restrictionAlert) => {
          this.restrictionAlert = restrictionAlert || false;
          this.storageService.getFarm().subscribe((farm: FarmDto) => {
            this.farm = farm;
            this.storageService.getEntrance().subscribe((entrance: EntranceDto) => {
              this.entrance = entrance;
            });
          });
        });
      });
    });
  }

  async openDelayTime() {
    const sec = await this.translate.get('seconds').toPromise();
    const cancel = await this.translate.get('cancel').toPromise();
    const confirm = await this.translate.get('confirm').toPromise();
    this.pickerSecCol = {
      name: 'sec',
      selectedIndex: this.screenBlockDelay - 4,
      suffix: sec,
      options: []
    };
    for (let i = 4; i <= 10; i++) {
      this.pickerSecCol.options.push({
        text: i.toString().padStart(2, '0'),
        value: i,
        disabled: false
      });
    }
    const columnOptions = [this.pickerSecCol];
    const picker = await this.pickerController.create({
      columns: columnOptions,
      mode: 'ios',
      buttons: [
        {
          text: cancel,
          role: 'cancel'
        },
        {
          text: confirm,
          handler: (value) => {
            this.screenBlockDelay = value.sec.value;
            this.storageService.set('ScreenBlockDelay', this.screenBlockDelay);
          }
        }
      ]
    });
    await picker.present();
  }

  async goToFarms() {
    await this.storageService.set('Farm', null);
    await this.storageService.set('Entrance', null);
    this.router.navigate(['farms'], { replaceUrl: true });
  }

  async goToLocation() {
    await this.storageService.set('Entrance', null);
    this.router.navigate(['location', this.farm.id], { replaceUrl: true });
  }

  async soundAlertsChange() {
    await this.storageService.set('SoundAlerts', this.soundAlerts);
  }

  async restrictionAlertChange() {
    await this.storageService.set('RestrictionAlert', this.restrictionAlert);
  }

}
