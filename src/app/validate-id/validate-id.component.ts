import { ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Ndef, NFC, NfcTag } from '@ionic-native/nfc/ngx';
import { BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner/ngx';
import { Device } from '@ionic-native/device/ngx';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { AppComponentBase } from '../../shared/app-component-base';
import {
  CreateAttendanceDto,
  CreateVehicleEntranceDto,
  EntranceDto,
  FarmDto,
  SimpleScheduleDto,
  SimpleWorkerDto,
  SimpleWorkerDtoListResultDto,
  WorkerServiceProxy,
} from '../../shared/service-proxies/service-proxies';
import { DniComponent } from '../dni/dni.component';
import { FailedAlertComponent } from '../failed-alert/failed-alert.component';
import { CardComponent } from '../card/card.component';
import { VehicularSingleResumeComponent } from '../vehicular-single-resume/vehicular-single-resume.component';


@Component({
  selector: 'app-validate-id',
  templateUrl: './validate-id.component.html',
  styleUrls: ['./validate-id.component.scss'],
})
export class ValidateIdComponent extends AppComponentBase implements OnInit {
  @Input() openedModals: string[];
  entrance: EntranceDto;
  vehicularAttendance: CreateVehicleEntranceDto;
  today: moment.Moment;
  translateDay: string;
  translateMonth: string;
  check: boolean;
  title: string;
  country = 'CL';
  attendances: CreateAttendanceDto[];
  model: CreateAttendanceDto;
  workers: SimpleWorkerDto[];
  farm: FarmDto;
  from: number;

  private nfcSubscription: Subscription;

  constructor(
    injector: Injector,
    private nfc: NFC,
    private barcodeScanner: BarcodeScanner,
    private device: Device,
    private workerService: WorkerServiceProxy,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    super(injector);
    this.today = moment(new Date());
    this.storageService.getCountry().subscribe((country) => {
      this.country = country;
      this.storageService.getCheck().subscribe(value => {
        this.check = value;
        this.storageService.getFarm().subscribe((farm: FarmDto) => {
          this.farm = new FarmDto(farm);
          this.storageService.getTypeAccess().subscribe((from) => {
            this.from = from;
          });
        });
      });
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
    this.entrance = await this.storageService.get('Entrance');
    this.workerService.getAllSimpleWorkersByFarm(this.farm.id)
      .subscribe(async (value: SimpleWorkerDtoListResultDto) => {
        await this.storageService.set('Workers', JSON.stringify(value.items));
        this.workers = value.items;
      },
        async (error) => {
          this.workers = await this.storageService.get('Workers', true);
        });
    this.attendances = await this.storageService.get('Attendances', true);
    this.attendances = this.attendances ? this.attendances : [];
    this.vehicularAttendance = await this.storageService.get('VehicularAttendance', true);
    const vehicularAttendances = await this.storageService.get('VehicularAttendances', true);
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

  async braceletValidation() {
    const loading = await this.loadingController.create({
      message: await this.translate.get('nfc1').toPromise(),
      backdropDismiss: true,
      keyboardClose: true,
    });
    await loading.present();
    loading.onDidDismiss().then(() => {
      if (this.nfcSubscription) {
        this.nfcSubscription.unsubscribe();
      }
    });

    // eslint-disable-next-line no-bitwise
    const flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V;
    if (this.nfcSubscription) {
      this.nfcSubscription.unsubscribe();
    }
    this.nfcSubscription = this.nfc.readerMode(flags).subscribe(
      async (tag) => {
        await loading.dismiss();
        await this.readTag(tag);
      },
      async (err) => {
        console.log('Error reading tag', err);
        await loading.dismiss();
        this.errorAlert(
          await this.translate.get('defaultError').toPromise(),
          () => { }
        );
      }
    );
  }

  async dniValidation() {
    this.model = new CreateAttendanceDto();
    this.barcodeScanner.scan().then((barcodeData: BarcodeScanResult) => {
      console.log('Read qrScanner: ' + barcodeData.text);
      if (this.country === 'CL') {
        this.model.dniWorker = barcodeData.text
          .toUpperCase()
          .split('RUN=')[1]
          .split('&')[0];
      } else {
        this.model.dniWorker = barcodeData.text;
      }
      this.validateWorker(this.model.dniWorker, true);
    }).catch(err => {
      console.log('Error', err);
    });
  }

  async manualValidation(dni?: string) {
    const modal = await this.modalController.create({
      component: DniComponent,
      componentProps: {
        dni: dni || ''
      },
      cssClass: 'modal-dni',
      showBackdrop: true,
      backdropDismiss: false,
      keyboardClose: false,
      swipeToClose: false,
    });
    modal.present();
  }

  async back() {
    await this.modalController.dismiss();
  }

  async validateContinue() {
    if (this.vehicularAttendance && this.vehicularAttendance.numberWorkers) {
      return true;
    }
    return false;
  }

  async continue() {
    const modal = await this.modalController.create({
      component: VehicularSingleResumeComponent,
      componentProps: {
        openedModals: this.openedModals
      },
      backdropDismiss: false,
      swipeToClose: false,
      keyboardClose: false,
    });
    modal.present();
  }

  async goHome() {
    if (this.from === 2) {
      await this.storageService.set('VehicularAttendance', JSON.stringify(null));
    }
    if (this.openedModals.length) {
      for (const modal of this.openedModals) {
        await this.modalController.dismiss(null, null, modal);
      }
    }
  }

  private async readTag(tag: NfcTag) {
    if (
      tag &&
      tag.ndefMessage &&
      tag.ndefMessage[0] &&
      tag.ndefMessage[0].payload
    ) {
      this.model = new CreateAttendanceDto();
      try {
        const arr = [];
        for (let i = 3; i < tag.ndefMessage[0].payload.length; i++) {
          arr.push(tag.ndefMessage[0].payload[i]);
        }
        const msg = this.nfc.bytesToString(arr);
        const args = msg.split('@');
        this.model.fullNameWorker = args[1].trim();
        this.model.dniWorker = args[0].trim();
        this.model.dniContractor = args[2].trim();
        if (!this.model.fullNameWorker || !this.model.dniWorker) {
          this.errorAlert(
            await this.translate.get('nfcFormatError').toPromise(),
            () => {
              this.braceletValidation();
            }
          );
        } else {
          this.validateWorker(this.model.dniWorker, false);
        }
      } catch (error) {
        console.error(error);
        this.errorAlert(
          await this.translate.get('nfcFormatError').toPromise(),
          () => {
            this.braceletValidation();
          }
        );
      }
    } else {
      this.errorAlert(
        await this.translate.get('defaultError').toPromise(),
        () => {
          this.braceletValidation();
        }
      );
    }
  }

  private async validateWorker(dni: string, qrValidation: boolean) {
    const worker = this.workerExist(dni);
    if (worker) {
      const workerRestriction = await this.workerRestriction(dni);
      if (!workerRestriction) {
        this.model.fullNameWorker = worker.fullName;
        this.model.workerId = worker.id;
        await this.createModel();
        const modal = await this.modalController.create({
          component: CardComponent,
          componentProps: {
            model: this.model,
          },
          cssClass: 'modal-card'
        });
        modal.present();
      } else {
        if (this.from === 1) {
          this.modalController.dismiss();
        }
        this.openAlert();
      }
    } else {
      if (qrValidation) {
        this.manualValidation(dni);
      } else {
        await this.createModel();
        const modal = await this.modalController.create({
          component: CardComponent,
          componentProps: {
            model: this.model,
          },
          cssClass: 'modal-card'
        });
        modal.present();
      }
      return;
    }
  }

  private async createModel() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('loading').toPromise()
    });
    await loading.present();
    const check = await this.storageService.get('Check');
    this.model.startDate = moment(new Date());
    this.model.farmId = this.farm.id;
    const entrance = await this.storageService.get('Entrance');
    this.model.entranceId = entrance.id;
    this.model.origin = 'WAC';
    this.model.deviceId = this.device.uuid;
    this.model.longitude = (await this.storageService.get('CurrentPoint')).longitude;
    this.model.latitude = (await this.storageService.get('CurrentPoint')).latitude;
    this.model.creationTime = moment(new Date());
    this.model.creatorUserId = this.appSession.userId;
    if (check) {
      this.model.actionTypeId = 1;
    } else {
      this.model.actionTypeId = 6;
    }
    if (this.from === 1) {
      this.attendances = [...this.attendances, this.model];
      await this.storageService.set('Attendances', JSON.stringify(this.attendances));
    }
    if (this.from === 2) {
      this.vehicularAttendance = await this.storageService.get('VehicularAttendance', true);
      this.vehicularAttendance.allAttendances = [...this.vehicularAttendance.allAttendances, this.model];
      this.vehicularAttendance.numberWorkers = this.vehicularAttendance.allAttendances.length;
      await this.storageService.set('VehicularAttendance', JSON.stringify(this.vehicularAttendance));
    }
    this.loadingController.dismiss();
  }

  private async openAlert() {
    const modal = await this.modalController.create({
      component: FailedAlertComponent,
      cssClass: 'modal-alert',
      backdropDismiss: false,
      swipeToClose: false,
      keyboardClose: false,
    });
    modal.present();
  }

  private async errorAlert(
    text: string,
    handler: (value?: any) => boolean | void | { [key: string]: any }
  ) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: text,
      mode: 'ios',
      buttons: [
        {
          text: 'OK',
          handler,
        },
        {
          text: await this.translate.get('cancel').toPromise(),
        },
      ],
    });
    await alert.present();
  }

  private async workerRestriction(dniWorker: string): Promise<boolean> {
    const restrictions: SimpleScheduleDto[] = await this.storageService.get('Restrictions', true);
    if (restrictions) {
      if (restrictions.length) {
        return restrictions.some(r => r.worker.identificationNumber === dniWorker && moment(r.date).isSame(moment(new Date()), 'day'));
      }
    }
    return false;
  }

  private workerExist(dniWorker: string): SimpleWorkerDto {
    if (this.workers) {
      return this.workers.find((w: SimpleWorkerDto) => w.identificationNumber === dniWorker);
    }
  }
}
