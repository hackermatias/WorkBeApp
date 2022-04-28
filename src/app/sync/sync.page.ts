/* eslint-disable max-len */
import { Component, Injector, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../shared/app-component-base';
import {
  CreateAttendanceDto,
  EntranceDtoPagedResultDto,
  EntranceServiceProxy,
  FarmDto,
  FarmDtoPagedResultDto,
  FarmServiceProxy,
  ScheduleServiceProxy,
  SimpleScheduleDtoListResultDto,
  SimpleWorkerDtoListResultDto,
  WorkerServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { SyncService } from '../../shared/services/sync.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.page.html',
  styleUrls: ['./sync.page.scss'],
})
export class SyncPage extends AppComponentBase implements OnInit {
  farm: FarmDto;
  pendingsP = 0;
  pendingsV = 0;
  success = true;

  keyword = '';
  sorting = '';
  skipCount = 0;
  maxResultCount = 9999;

  constructor(
    injector: Injector,
    private entranceService: EntranceServiceProxy,
    private farmService: FarmServiceProxy,
    private scheduleService: ScheduleServiceProxy,
    private workerService: WorkerServiceProxy,
    private syncService: SyncService,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
    super(injector);
    this.calcPendings();
  }

  async ngOnInit() {
    this.farm = await this.storageService.get('Farm');
  }

  async calcPendings() {
    const attendancesP = await this.storageService.get('Attendances', true);
    const attendancesV = await this.storageService.get('VehicularAttendances', true);
    const syncPedestrian = await this.storageService.get('SyncPedestrian', true);
    const syncVehicular = await this.storageService.get('SyncVehicular', true);
    if (attendancesP && attendancesP.length) {
      if (syncPedestrian && syncPedestrian.length) {
        this.pendingsP = Math.abs(attendancesP.length - syncPedestrian.length);
      } else {
        this.pendingsP = attendancesP.length;
      }
    }
    if (attendancesV && attendancesV.length) {
      let vehicularSingles: CreateAttendanceDto[] = [];
      for (const s of attendancesV) {
        vehicularSingles = [...vehicularSingles, ...s.allAttendances];
      }
      if (syncVehicular && syncVehicular.length) {
        let syncVehicularSingles: CreateAttendanceDto[] = [];
        for (const s of syncVehicular) {
          syncVehicularSingles = [...syncVehicularSingles, ...s.allAttendances];
        }
        this.pendingsV = Math.abs(vehicularSingles.length - syncVehicularSingles.length);
      } else {
        this.pendingsV = vehicularSingles.length;
      }
    }
  }

  async updateFarms() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('syncFarms').toPromise(),
    });
    await loading.present();
    this.getFarms()
      .pipe(
        finalize(async () => {
          await loading.dismiss();
          this.showNotification(this.success);
        })
      )
      .subscribe(async (value: FarmDtoPagedResultDto) => {
        if (value.items && value.items.length) {
          await this.storageService.set('Farms', JSON.stringify(value.items));
        } else {
          await this.storageService.clear();
          location.reload();
        }
      },
        async (error) => {
          this.success = false;
        });
  }

  async updateEntrances() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('syncEntrances').toPromise(),
    });
    await loading.present();
    this.getEntrances()
      .pipe(
        finalize(async () => {
          await loading.dismiss();
          this.showNotification(this.success);
        })
      )
      .subscribe(async (value: EntranceDtoPagedResultDto) => {
        if (value.items && value.items.length) {
          await this.storageService.set('Entrances', JSON.stringify(value.items));
        } else {
          await this.storageService.clear();
          location.reload();
        }
      },
        async (error) => {
          this.success = false;
        });
  }

  async updateWorkers() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('syncWorkers').toPromise(),
    });
    await loading.present();
    this.getWorkers()
      .pipe(
        finalize(async () => {
          await loading.dismiss();
          this.showNotification(this.success);
        })
      )
      .subscribe(async (value: SimpleWorkerDtoListResultDto) => {
        if (value.items && value.items.length) {
          await this.storageService.set('Workers', JSON.stringify(value.items));
        } else {
          await this.storageService.set('Workers', JSON.stringify([]));
        }
        this.success = true;
      },
        async (error) => {
          this.success = false;
        });
  }

  async updateSchedules() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('syncSchedules').toPromise(),
    });
    await loading.present();
    this.getSchedules()
      .pipe(
        finalize(async () => {
          await loading.dismiss();
          this.showNotification(this.success);
        })
      )
      .subscribe(async (value: SimpleScheduleDtoListResultDto) => {
        if (value.items && value.items.length) {
          await this.storageService.set('Schedules', JSON.stringify(value.items));
        } else {
          await this.storageService.set('Schedules', JSON.stringify([]));
        }
        this.success = true;
      },
        async (error) => {
          this.success = false;
        });
  }

  async uploadPedestrian() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('sendingdPedestrian').toPromise(),
    });
    await loading.present();
    try {
      await this.storageService.set('SyncP', 'true');
      this.storageService.getSyncP().subscribe(async (syncP) => {
        if (!syncP) {
          await loading.dismiss();
          await this.calcPendings();
          this.showNotification(true);
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.showNotification(false);
    }
  }

  async uploadVehicular() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('sendingVehicular').toPromise(),
    });
    await loading.present();
    try {
      await this.storageService.set('SyncV', 'true');
      this.storageService.getSyncV().subscribe(async (syncV) => {
        if (!syncV) {
          await loading.dismiss();
          await this.calcPendings();
          this.showNotification(true);
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.showNotification(false);
    }
  }

  async getAllData() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('syncAll').toPromise(),
    });
    await loading.present();
    this.getFarms()
      .subscribe(async (farms: FarmDtoPagedResultDto) => {
        if (farms.items && farms.items.length) {
          await this.storageService.set('Farms', JSON.stringify(farms.items));
          this.getEntrances()
            .subscribe(async (entrances: EntranceDtoPagedResultDto) => {
              if (entrances.items && entrances.items.length) {
                await this.storageService.set('Entrances', JSON.stringify(entrances.items));
                this.getWorkers()
                  .subscribe(async (workers: SimpleWorkerDtoListResultDto) => {
                    if (workers && workers.items) {
                      await this.storageService.set('Workers', JSON.stringify(workers.items));
                      this.getSchedules()
                        .pipe(
                          finalize(async () => {
                            await loading.dismiss();
                            this.showNotification(true);
                          })
                        )
                        .subscribe(async (schedules: SimpleScheduleDtoListResultDto) => {
                          if (schedules && schedules.items) {
                            await this.storageService.set('Schedules', JSON.stringify(schedules.items));
                          } else {
                            await loading.dismiss();
                            this.showNotification(false);
                          }
                        },
                          async (error) => {
                            await loading.dismiss();
                            this.showNotification(false);
                          });
                    } else {
                      await this.storageService.set('Workers', JSON.stringify([]));
                    }
                  },
                    async (error) => {
                      await loading.dismiss();
                      this.showNotification(false);
                    });
              } else {
                await this.storageService.clear();
                location.reload();
              }
            },
              async (error) => {
                await loading.dismiss();
                this.showNotification(false);
              });
        } else {
          await this.storageService.clear();
          location.reload();
        }
      },
        async (error) => {
          await loading.dismiss();
          this.showNotification(false);
        });
  }

  async uploadAll() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('sendingAll').toPromise(),
    });
    await loading.present();
    try {
      await this.storageService.set('SyncP', 'true');
      await this.storageService.set('SyncV', 'true');
      this.storageService.getSyncP().subscribe(async (syncP) => {
        this.storageService.getSyncV().subscribe(async (syncV) => {
          if (!syncP && !syncV) {
            await loading.dismiss();
            await this.calcPendings();
            this.showNotification(true);
          }
        });
      });
    } catch (error) {
      await loading.dismiss();
      this.showNotification(false);
    }
  }

  async showNotification(success: boolean) {
    let message = 'successProcess';
    let color = 'success';
    if (!success) {
      message = 'internetError';
      color = 'danger';
    }
    const toast = await this.toastController.create({
      color,
      duration: 2000,
      message: await this.translate.get(message).toPromise(),
      mode: 'ios'
    });
    await toast.present();
  };

  private getFarms(): Observable<FarmDtoPagedResultDto> {
    return this.farmService
      .getAllByUserId(this.appSession.userId);
  }
  private getEntrances(): Observable<EntranceDtoPagedResultDto> {
    return this.entranceService
      .getAll(this.farm.id, this.keyword, this.sorting, this.skipCount, this.maxResultCount);
  }
  private getWorkers(): Observable<SimpleWorkerDtoListResultDto> {
    return this.workerService.getAllSimpleWorkersByFarm(this.farm.id);
  }
  private getSchedules(): Observable<SimpleScheduleDtoListResultDto> {
    return this.scheduleService.getSimpleScheduleByDateFarm(this.farm.id, moment(new Date()));
  }
}
