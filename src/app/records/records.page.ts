/* eslint-disable max-len */
import { AfterViewInit, ChangeDetectorRef, Component, DoCheck, Injector, OnDestroy, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppComponentBase } from '../../shared/app-component-base';
import * as moment from 'moment';
import { AttendanceDto, CreateAttendanceDto, CreateVehicleEntranceDto } from '../../shared/service-proxies/service-proxies';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-records',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss'],
})
export class RecordsPage extends AppComponentBase implements OnInit, OnDestroy {
  date = new Date();
  search = '';
  attendances: CreateAttendanceDto[] = [];
  vehicularAttendances: CreateAttendanceDto[] = [];
  allAttendances: CreateAttendanceDto[] = [];
  syncPedestrian: CreateAttendanceDto[] = [];
  syncVehicular: CreateVehicleEntranceDto[] = [];
  groupedAttendances = [];
  translateDay: string;
  translateMonth: string;
  ins = [];
  outs = [];
  total = 0;
  inTotal = 0;
  outTotal = 0;
  tab: 'all' | 'in' | 'out' = 'all';

  pedestrianSubscription: Subscription;
  vehicularSubscription: Subscription;

  constructor(
    injector: Injector,
    private loadingController: LoadingController
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
    this.attendances = await this.storageService.get('Attendances', true);
    const vehicularAtendancesSource = await this.storageService.get('VehicularAttendances', true);
    if (vehicularAtendancesSource && vehicularAtendancesSource.length) {
      for (const a of vehicularAtendancesSource) {
        this.vehicularAttendances = [...this.vehicularAttendances, ...a.allAttendances];
      }
    }
    this.pedestrianSubscription = this.storageService.getSyncPedestrian().subscribe(p => this.syncPedestrian = p);
    this.vehicularSubscription = this.storageService.getSyncVehicular().subscribe(v => this.syncVehicular = v);
    this.translateDay = await this.translate.get(moment(this.date).format('dddd')).toPromise();
    this.translateMonth = await this.translate.get(moment(this.date).format('MMMM')).toPromise();
    await this.attendancesFilter();
    this.groupByName();
    await loading.dismiss();
  }

  async doRefresh(event) {
    try {
      await this.storageService.set('SyncP', 'true');
      await this.storageService.set('SyncV', 'true');
      this.storageService.getSyncP().subscribe(async (syncP) => {
        if (!syncP) {
          this.syncPedestrian = await this.storageService.get('SyncPedestrian', true);
          this.storageService.getSyncV().subscribe(async syncV => {
            if (!syncV) {
              this.syncVehicular = await this.storageService.get('SyncVehicular', true);
            }
          });
          if (!this.syncPedestrian) {
            this.syncPedestrian = [];
          }
          if (!this.syncVehicular) {
            this.syncVehicular = [];
          }
          event.target.complete();
        }
      });
    } catch (error) {
      event.target.complete();
    }
  }

  async attendancesFilter() {
    this.allAttendances = [];
    this.ins = [];
    this.outs = [];
    if (this.attendances && this.attendances.length) {
      this.allAttendances = [...this.allAttendances, ...this.attendances];
    }
    if (this.vehicularAttendances && this.vehicularAttendances.length) {
      this.allAttendances = [...this.allAttendances, ...this.vehicularAttendances];
    }
    if (this.allAttendances && this.allAttendances.length) {
      this.allAttendances = this.allAttendances.filter((a: CreateAttendanceDto) => {
        if (moment(a.startDate).isSame(moment(this.date), 'day')) {
          if (a.actionTypeId === 1) {
            this.ins = [...this.ins, a];
          }
          if (a.actionTypeId === 6) {
            this.outs = [...this.outs, a];
          }
          return true;
        }
        return false;
      });
      this.total = this.allAttendances.length;
      this.inTotal = this.ins.length;
      this.outTotal = this.outs.length;
    }
  }

  checkSuccess(attendance: AttendanceDto) {
    return this.ins.some((a: AttendanceDto) => a.dniWorker === attendance.dniWorker && moment(a.startDate).isSame(attendance.startDate));
  }

  groupByName() {
    this.groupedAttendances = [];
    if (this.allAttendances && this.allAttendances.length) {
      for (const attendance of this.allAttendances) {
        const index = this.groupedAttendances.findIndex(a => a.dniWorker === attendance.dniWorker);
        if (index !== -1) {
          const finded = this.groupedAttendances[index];
          if (attendance.actionTypeId === 1) {
            if (finded.in) {
              this.groupedAttendances = [...this.groupedAttendances, {
                startDate: attendance.startDate,
                dniWorker: attendance.dniWorker,
                name: attendance.fullNameWorker,
                in: true,
                out: false
              }];
            } else {
              this.groupedAttendances[index].in = true;
            }
          }
          if (attendance.actionTypeId === 6) {
            if (finded.out) {
              this.groupedAttendances = [...this.groupedAttendances, {
                startDate: attendance.startDate,
                dniWorker: attendance.dniWorker,
                name: attendance.fullNameWorker,
                in: false,
                out: true
              }];
            } else {
              this.groupedAttendances[index].out = true;
            }
          }
        } else {
          this.groupedAttendances = [...this.groupedAttendances, {
            startDate: attendance.startDate,
            dniWorker: attendance.dniWorker,
            name: attendance.fullNameWorker,
            in: attendance.actionTypeId === 1 ? true : false,
            out: attendance.actionTypeId === 6 ? true : false
          }];
        }
      }
    }
  }

  async changeDate(amount: number) {
    const loading = await this.loadingController.create({
      message: await this.translate.get('searching').toPromise(),
    });
    await loading.present();
    try {
      this.date = moment(this.date).add(amount, 'day').toDate();
      await this.attendancesFilter();
      this.groupByName();
    } catch (error) {
      console.error(error);
    }
    await loading.dismiss();
  }

  findAttendances() {
    this.attendancesFilter();
    this.allAttendances = this.allAttendances.filter(a => this.formatName(a.fullNameWorker).includes(this.formatName(this.search)));
    this.ins = this.ins.filter(a => this.formatName(a.fullNameWorker).includes(this.formatName(this.search)));
    this.outs = this.outs.filter(a => this.formatName(a.fullNameWorker).includes(this.formatName(this.search)));
    this.total = this.allAttendances.length;
    this.inTotal = this.ins.length;
    this.outTotal = this.outs.length;
  }

  isAttendanceUpload(attendance): boolean {
    if (this.syncPedestrian && this.syncPedestrian.length) {
      if (this.syncPedestrian.some(a => a.dniWorker === attendance.dniWorker && moment(a.startDate).isSame(moment(attendance.startDate)))) {
        return true;
      }
    }
    if (this.syncVehicular && this.syncVehicular.length) {
      for (const v of this.syncVehicular) {
        if (v.allAttendances && v.allAttendances.length) {
          if (v.allAttendances.some(a => a.dniWorker === attendance.dniWorker && moment(a.startDate).isSame(moment(attendance.startDate)))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  formatTime(date): string {
    return moment(date).format('HH:mm');
  }

  get formatDate(): string {
    return this.translateDay + ' ' + moment(this.date).format('D') + ' ' +  this.translateMonth + ' ' + moment(this.date).format('YYYY');
  }

  ngOnDestroy() {
    this.pedestrianSubscription.unsubscribe();
    this.vehicularSubscription.unsubscribe();
  }

  private formatName(name: string) {
    return name.trim().toLocaleLowerCase();
  }
}
