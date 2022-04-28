import { Component, Injector, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '../../shared/app-component-base';
import { FarmDto, FarmDtoPagedResultDto, FarmServiceProxy } from '../../shared/service-proxies/service-proxies';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-farms',
  templateUrl: './farms.page.html',
  styleUrls: ['./farms.page.scss'],
})
export class FarmsPage extends AppComponentBase implements OnInit {
  farms: FarmDto[];
  searchValue: string;

  keyword = '';
  sorting = '';
  isActive = true;
  skipCount = 0;
  maxResultCount = 9999;

  constructor(
    injector: Injector,
    private location: Location,
    private farmService: FarmServiceProxy,
    private loadingController: LoadingController,
    private router: Router
  ) {
    super(injector);
  }

  ngOnInit() {
    this.loadFarms();
  }

  async loadFarms() {
    const loading = await this.loadingController.create({
      backdropDismiss: false,
      keyboardClose: false,
      message: await this.translate.get('loading').toPromise(),
    });
    await loading.present();
    this.farmService
      .getAllByUserId(this.appSession.userId)
      .pipe(
        finalize(async () => {
          await loading.dismiss();
        })
      )
      .subscribe(async (value: FarmDtoPagedResultDto) => {
        await this.storageService.set('Farms', JSON.stringify(value.items));
        this.farms = value.items;
        if (!this.farms || !this.farms.length) {
          this.farms = await this.storageService.get('Farms', true);
          if (!this.farms || !this.farms.length) {
            await this.storageService.clear();
            location.reload();
          }
        }
      },
        async (error) => {
          this.farms = await this.storageService.get('Farms', true);
          if (!this.farms || !this.farms.length) {
            await this.storageService.clear();
            location.reload();
          }
        });
  }

  back() {
    this.location.back();
  }

  filteredSearch(): FarmDto[] {
    if (this.searchValue) {
      return this.farms.filter(f => this.formatName(f.name).includes(this.formatName(this.searchValue)));
    }
    return this.farms;
  }

  formatName(name: string) {
    return name.trim().toLocaleLowerCase();
  }

  async doRefresh(event) {
    console.log(event);
    this.farmService
      .getAllByUserId(this.appSession.userId)
      .pipe(
        finalize(async () => {
          event.target.complete();
        })
      )
      .subscribe(async (value: FarmDtoPagedResultDto) => {
        await this.storageService.set('Farms', JSON.stringify(value.items));
        this.farms = value.items;
      },
        async (error) => {
          this.farms = await this.storageService.get('Farms', true);
          event.target.complete();
        });
  }

  async selectLocation(farm: FarmDto) {
    await this.storageService.set('Farm', farm);
    this.router.navigate(['location', farm.id], { replaceUrl: true });
  }
}
