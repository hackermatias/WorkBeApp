import { Component, Injector, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AppComponentBase } from '../../shared/app-component-base';
import { CreateVehicleEntranceDto } from '../../shared/service-proxies/service-proxies';
import { VehicularSingleWorkersListComponent } from '../vehicular-single-workers-list/vehicular-single-workers-list.component';
import { DoneComponent } from '../done/done.component';

@Component({
  selector: 'app-vehicular-single-resume',
  templateUrl: './vehicular-single-resume.component.html',
  styleUrls: ['./vehicular-single-resume.component.scss'],
})
export class VehicularSingleResumeComponent extends AppComponentBase implements OnInit {
  @Input() openedModals: string[];
  vehicularAttendance: CreateVehicleEntranceDto;
  vehicularAttendances: CreateVehicleEntranceDto[];
  check: boolean;
  title: string;
  today: moment.Moment;
  translateDay: string;
  translateMonth: string;
  defaultImage = '../../assets/imgs/profile-default-img.png';

  constructor(
    injector: Injector,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {
    super(injector);
    this.today = moment(new Date());
    this.storageService.getCheck().subscribe(value => {
      this.check = value;
    });
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
    this.title = await this.storageService.getTitle();
    this.vehicularAttendance = await this.storageService.get('VehicularAttendance', true);
    this.vehicularAttendances = await this.storageService.get('VehicularAttendances', true);
    this.translateDay = await this.translate.get(this.today.format('dddd')).toPromise();
    this.translateMonth = await this.translate.get(this.today.format('MMMM')).toPromise();
    if(!this.vehicularAttendances || !this.vehicularAttendances.length) {
      this.vehicularAttendances = [];
    }
    await loading.dismiss();
  }

  get formatTime(): string {
    return this.today.format('HH:mm');
  }
  get formatDate(): string {
    return this.translateDay + ' ' + this.today.format('D') + ' ' +  this.translateMonth + ' ' + this.today.format('YYYY');
  }

  async back() {
    await this.modalController.dismiss();
  }

  get attendanceImage(): string {
    return `url(${this.defaultImage})`;
  }

  async displayWorkers() {
    const modal = await this.modalController.create({
      component: VehicularSingleWorkersListComponent,
      componentProps: {
        openedModals: this.openedModals
      },
      showBackdrop: true,
      backdropDismiss: false,
      keyboardClose: false,
      swipeToClose: false,
    });
    modal.present();
  }

  async finalize() {
    this.vehicularAttendance.startDate = moment(new Date());
    this.vehicularAttendance.creationTime = moment(new Date());
    this.vehicularAttendances = [...this.vehicularAttendances, this.vehicularAttendance];
    await this.storageService.set('VehicularAttendance', JSON.stringify(this.vehicularAttendance));
    await this.storageService.set('VehicularAttendances', JSON.stringify(this.vehicularAttendances));
    const modal = await this.modalController.create({
      component: DoneComponent,
      componentProps: {
        openedModals: this.openedModals
      },
      showBackdrop: true,
      backdropDismiss: false,
      keyboardClose: false,
      swipeToClose: false,
      cssClass: 'modal-done'
    });
    modal.present();
  }

  async goHome() {
    await this.storageService.set('VehicularAttendance', JSON.stringify(null));
    if(this.openedModals.length) {
      for(const modal of this.openedModals) {
        await this.modalController.dismiss(null, null, modal);
      }
    }
  }

}
