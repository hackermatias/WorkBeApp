import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AppComponentBase } from '../../shared/app-component-base';
import { EntranceDto } from '../../shared/service-proxies/service-proxies';
import { ValidateIdComponent } from '../validate-id/validate-id.component';
import { VehicularManifestComponent } from '../vehicular-manifest/vehicular-manifest.component';
import { VehicularSingleWorkersComponent } from '../vehicular-single-workers/vehicular-single-workers.component';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
})
export class CheckComponent extends AppComponentBase implements OnInit {
  @Input() openedModals: string[];
  from: number;
  today: moment.Moment;
  entrance: EntranceDto;
  translateDay: string;
  translateMonth: string;

  constructor(
    injector: Injector,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    super(injector);
    this.today = moment(new Date());
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('loading').toPromise()
    });
    await loading.present();
    const currentModal = await this.modalController.getTop();
    this.openedModals = [...this.openedModals, currentModal.id];
    this.entrance = await this.storageService.get('Entrance');
    this.storageService.getTypeAccess().subscribe((value) => {
      this.from = value;
    });
    this.translateDay = await this.translate.get(this.today.format('dddd')).toPromise();
    this.translateMonth = await this.translate.get(this.today.format('MMMM')).toPromise();
    await loading.dismiss();
  }

  get formatTime(): string {
    return this.today.format('HH:mm');
  }
  get formatDate(): string {
    return this.translateDay + ' ' + this.today.format('D') + ' ' +  this.translateMonth + ' ' + this.today.format('YYYY');
  }

  async switchTarget(check: boolean) {
    await this.storageService.set('Check', check);
    const target = await this.storageService.get('TypeAccess');
    switch (target) {
      case 1:
        const modal1 = await this.modalController.create({
          component: ValidateIdComponent,
          componentProps: {
            openedModals: this.openedModals
          },
          showBackdrop: true,
          backdropDismiss: false,
          keyboardClose: false,
          swipeToClose: false,
        });
        modal1.present();
        break;
      case 2:
      case 3:
        const modal2 = await this.modalController.create({
          component: VehicularSingleWorkersComponent,
          componentProps: {
            openedModals: this.openedModals
          },
          showBackdrop: true,
          backdropDismiss: false,
          keyboardClose: false,
          swipeToClose: false,
        });
        modal2.present();
        break;
      case 4:
        // const modal3 = await this.modalController.create({
        //   component: VehicularManifestComponent,
        //   componentProps: {
        //     openedModals: this.openedModals
        //   },
        //   showBackdrop: true,
        //   backdropDismiss: false,
        //   keyboardClose: false,
        //   swipeToClose: false,
        // });
        // modal3.present();
        break;
      default:
        break;
    }
  }

  async goHome() {
    if(this.openedModals.length) {
      for(const modal of this.openedModals) {
        await this.modalController.dismiss(null, null, modal);
      }
    }
  }

}
