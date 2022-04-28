import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { AppComponentBase } from '../../shared/app-component-base';
import { EntranceDto, FarmDto } from '../../shared/service-proxies/service-proxies';
import { LocationTracker } from '../../shared/services/location-tracker.service';
import { CheckComponent } from '../check/check.component';
import { VehicularControlComponent } from '../vehicular-control/vehicular-control.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends AppComponentBase implements OnInit {
  farm: FarmDto;
  entrance: EntranceDto;
  openedModals: string[] = [];

  constructor(
    injector: Injector,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private locationTracker: LocationTracker,
  ) {
    super(injector);
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('loading').toPromise()
    });
    await loading.present();
    this.locationTracker.startWatchPosition();
    this.farm = await this.storageService.get('Farm');
    this.entrance = await this.storageService.get('Entrance');
    await loading.dismiss();
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

  async goCheck(from: number) {
    await this.storageService.set('TypeAccess', from);
    const modal = await this.modalController.create({
      component: CheckComponent,
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

  async goVechicularControl() {
    const modal = await this.modalController.create({
      component: VehicularControlComponent,
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
}
