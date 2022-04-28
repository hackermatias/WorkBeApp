import { Component, Injector, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AppComponentBase } from '../../shared/app-component-base';
import { CreateAttendanceDto, CreateVehicleEntranceDto } from '../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-vehicular-single-workers-list',
  templateUrl: './vehicular-single-workers-list.component.html',
  styleUrls: ['./vehicular-single-workers-list.component.scss'],
})
export class VehicularSingleWorkersListComponent extends AppComponentBase implements OnInit {
  @Input() openedModals: string[];
  model: CreateVehicleEntranceDto;
  title: string;
  searchValue: string;
  check = true;

  constructor(
    injector: Injector,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
    super(injector);
    this.storageService.getCheck().subscribe((check) => {
      this.check = check;
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
    this.model = await this.storageService.get('VehicularAttendance', true);
    await loading.dismiss();
  }

  filteredSearch(): CreateAttendanceDto[] {
    if(this.searchValue) {
      return this.model.allAttendances.filter(a => this.formatName(a.fullNameWorker).includes(this.formatName(this.searchValue)));
    }
    return this.model.allAttendances;
  }

  formatName(name: string) {
    return name.trim().toLocaleLowerCase();
  }

  async back() {
    await this.modalController.dismiss();
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
