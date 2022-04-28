import { Component, Injector, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { timer } from 'rxjs';
import { AppComponentBase } from '../../shared/app-component-base';

@Component({
  selector: 'app-done',
  templateUrl: './done.component.html',
  styleUrls: ['./done.component.scss'],
})
export class DoneComponent extends AppComponentBase implements OnInit {
  @Input() openedModals: string[];
  srcImage = '../../assets/imgs/check-circle-regular.svg';
  image = new Image();
  imageReady = false;

  constructor(
    injector: Injector,
    private modalController: ModalController,
  ) {
    super(injector);
  }

  async ngOnInit() {
    const currentModal = await this.modalController.getTop();
    this.openedModals = [...this.openedModals, currentModal.id];
    this.image.src = this.srcImage;
    this.image.onload = async () => {
      this.imageReady = true;
      timer(1000).subscribe(async () => await this.goHome());
    };
  }

  get backGroundImage(): string {
    return `url(${this.image.src})`;
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
