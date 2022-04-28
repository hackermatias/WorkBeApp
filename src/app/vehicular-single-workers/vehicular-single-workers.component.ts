import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Device } from '@ionic-native/device/ngx';
import { LoadingController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../shared/app-component-base';
import { CreateVehicleEntranceDto } from '../../shared/service-proxies/service-proxies';
import { DoneComponent } from '../done/done.component';
import { ValidateIdComponent } from '../validate-id/validate-id.component';

@Component({
  selector: 'app-vehicular-single-workers',
  templateUrl: './vehicular-single-workers.component.html',
  styleUrls: ['./vehicular-single-workers.component.scss'],
})
export class VehicularSingleWorkersComponent extends AppComponentBase implements OnInit {
  @Input() openedModals: string[];
  model: CreateVehicleEntranceDto;
  vehicularAttendances: CreateVehicleEntranceDto[];
  fg: FormGroup;
  today: moment.Moment;
  translateDay: string;
  translateMonth: string;
  title: string;
  check: boolean;
  from: number;
  counter = 0;

  country: string;

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private device: Device,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {
    super(injector);
    this.today = moment(new Date());
    this.fg = this.fb.group({
      plateNumber: ['', Validators.required],
      driverName: ['', Validators.required],
      driverDni: ['', [Validators.required, this.rutValidator()]],
      observations: [''],
    });
    this.storageService.getCheck().subscribe(value => this.check = value);
    this.storageService.getCountry().subscribe(value => this.country = value);
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
    this.vehicularAttendances = await this.storageService.get('VehicularAttendances', true);
    this.translateDay = await this.translate.get(this.today.format('dddd')).toPromise();
    this.translateMonth = await this.translate.get(this.today.format('MMMM')).toPromise();
    this.storageService.getTypeAccess()
      .pipe(
        finalize(async () => {
          await loading.dismiss();
        })
      )
      .subscribe(async (value) => {
        this.title = await this.storageService.getTitle();
        if (this.title === 'vehicularWorkers') {
          this.fg = this.fb.group({
            plateNumber: ['', Validators.required],
            driverName: ['', Validators.required],
            driverDni: ['', [Validators.required, this.rutValidator()]],
            observations: [''],
            numberWorkers: [0, [Validators.required, Validators.min(0)]]
          });
        }
        this.from = value;
        loading.dismiss();
      });
  }

  get formatTime(): string {
    return this.today.format('HH:mm');
  }
  get formatDate(): string {
    return this.translateDay + ' ' + this.today.format('D') + ' ' +  this.translateMonth + ' ' + this.today.format('YYYY');
  }

  add(): void {
    const counter = this.fg.controls.numberWorkers.value;
    this.fg.controls.numberWorkers.setValue(counter + 1);
  }

  subtract(): void {
    const counter = this.fg.controls.numberWorkers.value;
    if (counter !== 0) {
      this.fg.controls.numberWorkers.setValue(counter - 1);
    }
  }

  async back() {
    await this.storageService.set('VehicularAttendance', null);
    await this.modalController.dismiss();
  }

  async goHome() {
    await this.storageService.set('VehicularAttendance', JSON.stringify(null));
    if (this.openedModals.length) {
      for (const modal of this.openedModals) {
        await this.modalController.dismiss(null, null, modal);
      }
    }
  }

  onFocus() {
    if (this.from === 3) {
      if (this.fg.controls.numberWorkers.value === 0) {
        this.fg.controls.numberWorkers.setValue(null);
      }
    }
  }

  onBlur() {
    if (this.from === 3) {
      if (!this.fg.controls.numberWorkers.value) {
        this.fg.controls.numberWorkers.setValue(0);
      }
    }
  }

  async continue() {
    this.model = new CreateVehicleEntranceDto();
    this.model.startDate = moment(new Date());
    const entrance = await this.storageService.get('Entrance');
    this.model.entranceId = entrance.id;
    const check = await this.storageService.get('Check');
    this.model.actionTypeId = check ? 1 : 6;
    this.model.transportId = undefined;
    this.model.driverName = this.fg.controls.driverName.value;
    this.model.plateNumber = this.fg.controls.plateNumber.value;
    this.model.driverIdNumber = this.fg.controls.driverDni.value;
    this.model.observations = this.fg.controls.observations.value;
    this.model.numberWorkers = 0;
    this.model.origin = 'WA';
    this.model.deviceId = this.device.uuid;
    const currentPoint = await this.storageService.get('CurrentPoint');
    this.model.latitude = currentPoint ? currentPoint.latitude : 0;
    this.model.longitude = currentPoint ? currentPoint.longitude : 0;
    this.model.allAttendances = [];
    this.model.creationTime = moment(new Date());
    this.model.creatorUserId = this.appSession.userId;
    if (this.from === 2) {
      await this.storageService.set('VehicularAttendance', JSON.stringify(this.model));
      const modal = await this.modalController.create({
        component: ValidateIdComponent,
        componentProps: {
          openedModals: this.openedModals
        },
        showBackdrop: true,
        backdropDismiss: false,
        keyboardClose: false,
        swipeToClose: false,
      });
      modal.present();
    } else if (this.from === 3) {
      this.model.numberWorkers = this.fg.controls.numberWorkers.value;
      if (this.vehicularAttendances && this.vehicularAttendances.length) {
        this.vehicularAttendances = [...this.vehicularAttendances, this.model];
      } else {
        this.vehicularAttendances = [this.model];
      }
      await this.storageService.set('VehicularAttendances', JSON.stringify(this.vehicularAttendances));
      const modal = await this.modalController.create({
        component: DoneComponent,
        componentProps: {
          openedModals: this.openedModals
        },
        cssClass: 'modal-done',
        showBackdrop: true,
        backdropDismiss: false,
        keyboardClose: false,
        swipeToClose: false,
      });
      modal.present();
    }
  }

  private rutValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const country = this.country;
      if (country === 'CL') {
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

}
