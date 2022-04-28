import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../shared/app-component-base';
import {
  EntranceDto,
  EntranceDtoPagedResultDto,
  EntranceServiceProxy,
  FarmDto,
  FarmServiceProxy,
  ScheduleServiceProxy,
  SimpleScheduleDto,
  SimpleScheduleDtoListResultDto,
  SimpleWorkerDtoListResultDto,
  WorkerServiceProxy
}
  from '../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage extends AppComponentBase implements OnInit {
  entrances: EntranceDto[];
  restrictions: SimpleScheduleDto[];
  farm: FarmDto;
  farmId = '';
  searchValue: string;

  keyword = '';
  sorting = '';
  skipCount = 0;
  maxResultCount = 9999;

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private router: Router,
    private entranceService: EntranceServiceProxy,
    private farmService: FarmServiceProxy,
    private workerService: WorkerServiceProxy,
    private scheduleService: ScheduleServiceProxy,
    private loadingController: LoadingController,
  ) {
    super(injector);
    this.restrictions = [];
  }

  ngOnInit() {
    this.farmId = this.route.snapshot.paramMap.get('id');
    this.getFarm();
  }

  async loadEntrances(farmId: string) {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('loading').toPromise()
    });
    await loading.present();
    this.entranceService
      .getAll(farmId, this.keyword, this.sorting, this.skipCount, this.maxResultCount)
      .pipe(
        finalize(async () => {
          await loading.dismiss();
        })
      )
      .subscribe(async (value: EntranceDtoPagedResultDto) => {
        await this.storageService.set('Entrances', JSON.stringify(this.entrances));
        this.entrances = value.items;
        if (!this.entrances || !this.entrances.length) {
          this.entrances = await this.storageService.get('Entrances', true);
          if (!this.entrances || !this.entrances.length) {
            await this.storageService.clear();
            location.reload();
          }
        }
      },
        async (error) => {
          this.entrances = await this.storageService.get('Entrances', true);
          if (!this.entrances || !this.entrances.length) {
            await this.storageService.clear();
            location.reload();
          }
        });
  }

  async getFarm() {
    this.farmService.get(this.farmId)
      .subscribe((value: FarmDto) => {
        this.farm = value;
      },
        async (error) => {
          this.farm = await this.storageService.get('Farm');
        });
    this.loadEntrances(this.farmId);
  }

  loadWorkersByFarm() {
    this.workerService.getAllSimpleWorkersByFarm(this.farmId)
      .pipe(
        finalize(() => {
          this.loadSchedules();
        })
      )
      .subscribe(async (value: SimpleWorkerDtoListResultDto) => {
        await this.storageService.set('Workers', JSON.stringify(value.items));
      });
  }

  loadSchedules() {
    this.scheduleService.getSimpleScheduleByDateFarm(this.farmId, moment(new Date()))
      .pipe(
        finalize(() => {
          this.findRestrictions();
        })
      )
      .subscribe(async (value: SimpleScheduleDtoListResultDto) => {
        await this.storageService.set('Schedules', JSON.stringify(value.items));
      });
  }

  async findRestrictions() {
    const schedules: SimpleScheduleDto[] = await this.storageService.get('Schedules', true);
    if (schedules) {
      for (const s of schedules) {
        if (s.absenceId) {
          this.restrictions = [...this.restrictions, s];
        }
      }
    }
    await this.storageService.set('Restrictions', JSON.stringify(this.restrictions));
  }

  async goHome(entrance: EntranceDto) {
    await this.storageService.set('Entrance', entrance);
    this.loadWorkersByFarm();
    this.loadSchedules();
    this.router.navigate(['home'], { replaceUrl: true });
  }

  filteredSearch(): EntranceDto[] {
    if (this.searchValue) {
      return this.entrances.filter(e => this.formatName(e.name).includes(this.formatName(this.searchValue)));
    }
    return this.entrances;
  }

  async doRefresh(event) {
    this.entranceService
      .getAll(this.farmId, this.keyword, this.sorting, this.skipCount, this.maxResultCount)
      .pipe(
        finalize(async () => {
          event.target.complete();
        })
      )
      .subscribe(async (value: EntranceDtoPagedResultDto) => {
        await this.storageService.set('Entrances', JSON.stringify(this.entrances));
        this.entrances = value.items;
      },
        async (error) => {
          this.entrances = await this.storageService.get('Entrances', true);
          event.target.complete();
        });
  }

  formatName(name: string) {
    return name.trim().toLocaleLowerCase();
  }

  async back() {
    this.router.navigate(['farms'], { replaceUrl: true });
  }

}
