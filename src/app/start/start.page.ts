import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponentBase } from '../../shared/app-component-base';
import * as moment from 'moment';
import { timer } from 'rxjs';
import { CreateAttendanceDto, CreateVehicleEntranceDto } from '../../shared/service-proxies/service-proxies';
import { SyncService } from '../../shared/services/sync.service';


@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage extends AppComponentBase implements OnInit {
  fullScreen = true;

  constructor(
    injector: Injector,
    syncService: SyncService,
    private router: Router,
  ) {
    super(injector);
  }

  ngOnInit() {
    timer(3000).subscribe(async () => {
      await this.storageService.set('VehicularAttendance', null);
      this.storageService.getIsRegister().subscribe((isRegister: boolean) => {
        if (isRegister !== undefined) {
          if (isRegister) {
            this.storageService.getFarm().subscribe((farm) => {
              if (farm !== undefined) {
                if (farm) {
                  this.storageService.getEntrance().subscribe((entrance) => {
                    if (entrance) {
                      this.router.navigate(['home'], { replaceUrl: true });
                    } else {
                      this.router.navigate(['location', farm.id], { replaceUrl: true });
                    }
                  });
                } else {
                  this.router.navigate(['farms'], { replaceUrl: true });
                }
              }
            });
          } else {
            this.router.navigate(['login'], { replaceUrl: true });
          }
        } else {
          this.router.navigate(['login'], { replaceUrl: true });
        }
      });
    });
  }

  private async startSync() {
    await this.attendancesPDelete();
    await this.attendancesVDelete();
    timer(10000, 180000).subscribe(async () => {
      await this.storageService.set('SyncP', 'true');
    });
    timer(10000, 180000).subscribe(async () => {
      await this.storageService.set('SyncV', 'true');
    });
  }

  private async attendancesPDelete() {
    let syncPedestrian = await this.storageService.get('SyncPedestrian', true);
    let attendances = await this.storageService.get('Attendances', true);
    const compareDate = moment(new Date()).add(-7, 'days');
    if (attendances && attendances.length) {
      attendances = attendances.filter((a: CreateAttendanceDto) => moment(a.startDate).isAfter(compareDate, 'day'));
      await this.storageService.set('Attendances', JSON.stringify(attendances));
    }
    if (syncPedestrian && syncPedestrian.length) {
      syncPedestrian = syncPedestrian.filter((a: CreateAttendanceDto) => moment(a.startDate).isAfter(compareDate, 'day'));
      await this.storageService.set('SyncPedestrian', JSON.stringify(syncPedestrian));
    }
  }
  private async attendancesVDelete() {
    let syncVehicular = await this.storageService.get('SyncVehicular', true);
    let vehicularAttendances = await this.storageService.get('VehicularAttendances', true);
    const compareDate = moment(new Date()).add(-7, 'days');
    if (vehicularAttendances && vehicularAttendances.length) {
      vehicularAttendances = vehicularAttendances.filter((a: CreateVehicleEntranceDto) => moment(a.startDate).isAfter(compareDate, 'day'));
      await this.storageService.set('VehicularAttendances', JSON.stringify(vehicularAttendances));
    }
    if (syncVehicular && syncVehicular.length) {
      syncVehicular = syncVehicular.filter((a: CreateVehicleEntranceDto) => moment(a.startDate).isAfter(compareDate, 'day'));
      await this.storageService.set('SyncVehicular', JSON.stringify(syncVehicular));
    }
  }
}
