import { Component, Injector, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { timer } from 'rxjs';
import { AppComponentBase } from '../../shared/app-component-base';

@Component({
  selector: 'app-failed-alert',
  templateUrl: './failed-alert.component.html',
  styleUrls: ['./failed-alert.component.scss'],
})
export class FailedAlertComponent extends AppComponentBase implements OnInit {
  alertDelay: number;
  showCloseBtn = false;

  constructor(
    injector: Injector,
    private nativeAudio: NativeAudio,
    private modalController: ModalController
  ) {
    super(injector);
  }

  async ngOnInit() {
    try {
      await this.nativeAudio.preloadComplex('error', 'assets/sounds/error.mp3', 1, 1, 0);
    } catch (error) {
      console.log(error);
    }
    this.storageService.get('AlertDelay').then(async (alertDelay) => {
      this.alertDelay = alertDelay || 5;
      timer(this.alertDelay * 1000).subscribe(async () => {
        this.showCloseBtn = true;
        try {
          await this.nativeAudio.stop('error');
        } catch (error) {
          console.log(error);
        }
      });
      try {
        await this.nativeAudio.play('error');
      } catch (error) {
        console.log(error);
      }
    });
  }

  async close() {
    await this.modalController.dismiss();
  }

}
