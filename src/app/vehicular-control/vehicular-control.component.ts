import { Component, Injector, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppComponentBase } from '../../shared/app-component-base';
import { CheckComponent } from '../check/check.component';

@Component({
  selector: 'app-vehicular-control',
  templateUrl: './vehicular-control.component.html',
  styleUrls: ['./vehicular-control.component.scss'],
})
export class VehicularControlComponent extends AppComponentBase implements OnInit {
@Input() openedModals: string[];
currentModal: any;

  constructor(
    injector: Injector,
    private modalController: ModalController
  ) {
    super(injector);
  }

  async ngOnInit() {
    this.currentModal = await this.modalController.getTop();
   }

  async goCheck(from: number) {
    await this.storageService.set('TypeAccess', from);
    this.openedModals = [...this.openedModals, this.currentModal.id];
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

  async goHome() {
    this.modalController.dismiss();
  }
}
