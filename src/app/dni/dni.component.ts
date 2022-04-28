import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Device } from '@ionic-native/device/ngx';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AppComponentBase } from '../../shared/app-component-base';
import {
  CreateAttendanceDto,
  CreateVehicleEntranceDto,
  FarmDto,
  SimpleScheduleDto,
  SimpleWorkerDto,
  SimpleWorkerDtoListResultDto,
  WorkerServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { CardComponent } from '../card/card.component';
import { FailedAlertComponent } from '../failed-alert/failed-alert.component';
import { Camera } from '@ionic-native/camera/ngx';
import { OCR, OCRResult, OCRSourceType } from '@ionic-native/ocr/ngx';

@Component({
  selector: 'app-dni',
  templateUrl: './dni.component.html',
  styleUrls: ['./dni.component.scss'],
})
export class DniComponent extends AppComponentBase implements OnInit {
  @Input() dni: string;
  workers: SimpleWorkerDto[];
  farm: FarmDto;
  country: string;
  attendances: CreateAttendanceDto[];
  vehicularAttendance: CreateVehicleEntranceDto;
  fg: FormGroup;
  type: '1' | '2' = '1';
  from: number;
  check = true;

  model: CreateAttendanceDto;

  constructor(
    injector: Injector,
    private camera: Camera,
    private ocr: OCR,
    private device: Device,
    private workerService: WorkerServiceProxy,
    private fb: FormBuilder,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController

  ) {
    super(injector);
    this.fg = this.fb.group({
      name: ['', Validators.required],
      dni: [this.dni || '', [Validators.required, this.type === '1' ? this.rutValidator() : null]]
    });
    this.storageService.getFarm().subscribe((farm: FarmDto) => {
      this.farm = new FarmDto(farm);
      this.storageService.getCountry().subscribe(country => {
        this.country = country;
        this.storageService.getTypeAccess().subscribe((from: number) => {
          this.from = from;
          this.storageService.getCheck().subscribe((check: boolean) => {
            this.check = check;
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
    if (this.dni) {
      this.fg.controls.dni.setValue(this.dni);
    }
    this.attendances = await this.storageService.get('Attendances', true);
    this.attendances = this.attendances ? this.attendances : [];
    const farm = await this.storageService.get('Farm');
    this.workerService.getAllSimpleWorkersByFarm(farm.id)
      .subscribe(async (value: SimpleWorkerDtoListResultDto) => {
        await this.storageService.set('Workers', JSON.stringify(value.items));
        this.workers = value.items;
      },
        async (error) => {
          this.workers = await this.storageService.get('Workers', true);
        });
    this.vehicularAttendance = await this.storageService.get('VehicularAttendance', true);
    await loading.dismiss();
  }

  rutValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const country = this.country;
      if (country === 'CL' && this.type === '1') {
        let value = control.value;
        if (value) {
          value = value.replace('.', '').replace('.', '').replace('-', '');
          if (!/^(\d{1,3}(?:(\.?)\d{3}){2}(-?)[\dkK])$/.test(value)) {
            return {
              invalidBodyDni: true,
            };
          } else {
            // Aislar Cuerpo y Dígito Verificador
            const body = value.slice(0, -1).replace('-', '');
            let dv = value.slice(-1).toUpperCase();
            // Calcular Dígito Verificador
            let suma = 0;
            let multiplo = 2;
            // Para cada dígito del Cuerpo
            for (let i = 1; i <= body.length; i++) {
              // Obtener su Producto con el Múltiplo Correspondiente
              const index = multiplo * value.charAt(body.length - i);
              // Sumar al Contador General
              suma = suma + index;
              // Consolidar Múltiplo dentro del rango [2,7]
              if (multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
            }
            // Calcular Dígito Verificador en base al Módulo 11
            const result = 11 - (suma % 11);
            // Casos Especiales (0 y K)
            dv = (dv === 'K') ? '10' : dv;
            dv = (dv === '0') ? '11' : dv;
            // Validar que el Cuerpo coincide con su Dígito Verificador
            if (result.toString() !== dv) {
              return {
                invalidDvDni: true,
              };
            }
          }
        }
      }
      return null;
    };
  }

  onTypeChange() {
    this.fg.controls.name.setValue('');
    this.fg.controls.dni.setValue('');
  }

  async continue() {
    const dni = this.fg.controls.dni.value;
    const worker = this.workerExist(dni);
    if (worker) {
      const workerRestriction = await this.workerRestriction(dni);
      if (!workerRestriction) {
        await this.createModel(worker);
        this.modalController.dismiss();
        const modal = await this.modalController.create({
          component: CardComponent,
          componentProps: {
            model: this.model,
          },
          cssClass: 'modal-card'
        });
        modal.present();
      } else {
        this.openAlert();
      }
    } else {
      await this.createModel();
      this.modalController.dismiss();
      const modal = await this.modalController.create({
        component: CardComponent,
        componentProps: {
          model: this.model,
        },
        cssClass: 'modal-card'
      });
      modal.present();
      modal.onDidDismiss().then(() => {
        this.modalController.dismiss();
      });
    }
  }

  async readDni() {
    this.camera
      .getPicture({
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        cameraDirection: 1,
      })
      .then((imageData: string) => {
        this.ocr
          .recText(OCRSourceType.NORMFILEURL, imageData)
          .then((result: OCRResult) => {
            if (result && result.foundText) {
              let text = result.blocks.blocktext.join(' ');
              text = text.replace(new RegExp(/\n/, 'gm'), ' ');
              text = text.replace(new RegExp(/  /, 'gm'), ' ');
              text = text.toUpperCase();
              const lastnameIndex = text.indexOf('APELLIDOS');
              const namesIndex = text.indexOf('NOMBRES');
              const nationalityIndex = text.indexOf('NACIONALIDAD');
              const runIndex = text.indexOf(' RUN ');
              const lastname = text
                .substring(
                  lastnameIndex +
                  text.substring(lastnameIndex, text.length).indexOf(' '),
                  namesIndex
                )
                .trim();
              const names = text
                .substring(
                  namesIndex +
                  text.substring(namesIndex, text.length).indexOf(' '),
                  nationalityIndex
                )
                .trim();
              const run = text
                .substring(
                  runIndex + 5,
                  text.substring(runIndex, text.length).indexOf('-') + runIndex
                )
                .trim()
                .replace(new RegExp(/\./, 'gm'), '');
              const lastIndex =
                text.substring(runIndex, text.length).indexOf('-') +
                runIndex +
                1;
              const dv = text.substring(lastIndex, lastIndex + 1).trim();
              const dni = `${run}-${dv}`.toUpperCase();
              const name = `${names} ${lastname}`.toUpperCase();
              this.fg.controls.dni.setValue(dni);
              this.fg.controls.name.setValue(name);
            }
          })
          .catch((error: any) => console.error(error));
      })
      .catch((error: any) => console.error(error));
  }

  async close() {
    this.modalController.dismiss();
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

  private trimName(): string {
    const name: string = this.fg.controls.name.value;
    return name.trim();
  }

  private async createModel(worker?: SimpleWorkerDto) {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('loading').toPromise()
    });
    await loading.present();
    const check = await this.storageService.get('Check');
    this.model = new CreateAttendanceDto();
    this.model.startDate = moment(new Date());
    this.model.fullNameWorker = worker ? worker.fullName : this.trimName();
    this.model.dniWorker = this.fg.controls.dni.value;
    this.model.farmId = this.farm.id;
    const entrance = await this.storageService.get('Entrance');
    this.model.entranceId = entrance.id;
    this.model.origin = 'WAC';
    this.model.deviceId = this.device.uuid;
    const currentPoint = await this.storageService.get('CurrentPoint');
    this.model.longitude = currentPoint ? currentPoint.longitude : 0;
    this.model.latitude = currentPoint ? currentPoint.latitude : 0;
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
      this.vehicularAttendance.allAttendances = [...this.vehicularAttendance.allAttendances, this.model];
      this.vehicularAttendance.numberWorkers = this.vehicularAttendance.allAttendances.length;
      await this.storageService.set('VehicularAttendance', JSON.stringify(this.vehicularAttendance));
    }
    this.loadingController.dismiss();
    this.modalController.dismiss();
  }
}
