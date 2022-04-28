/* eslint-disable max-len */
/* eslint-disable @angular-eslint/contextual-lifecycle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { CreateAttendanceDto, CreateVehicleEntranceDto, EntranceDto, FarmDto } from '../service-proxies/service-proxies';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private defaultLang: BehaviorSubject<string> = new BehaviorSubject('es'); // starting app default as 'es'
  private country: BehaviorSubject<string> = new BehaviorSubject('CL'); // starting app default as 'CL'
  private isRegister: BehaviorSubject<boolean> = new BehaviorSubject(undefined); // starting app default as 'false'
  private geolocation: BehaviorSubject<any> = new BehaviorSubject(null); // starting app default as 'null'
  private farm: BehaviorSubject<FarmDto> = new BehaviorSubject(null); // starting app default as 'null'
  private entrance: BehaviorSubject<EntranceDto> = new BehaviorSubject(null); // starting app default as 'null'
  private locationId: BehaviorSubject<string> = new BehaviorSubject(null); // starting app default as 'null'
  private typeAccess: BehaviorSubject<number> = new BehaviorSubject(null); // starting app default as 'null'
  private syncP: BehaviorSubject<boolean> = new BehaviorSubject(false); // starting app default as 'undefined'
  private syncV: BehaviorSubject<boolean> = new BehaviorSubject(false); // starting app default as 'undefined'
  private check: BehaviorSubject<boolean> = new BehaviorSubject(true); // starting app default as 'undefined'
  private fullscreen: BehaviorSubject<boolean> = new BehaviorSubject(false); // starting app default as 'undefined'
  private syncPedestrian: BehaviorSubject<CreateAttendanceDto[] | null> = new BehaviorSubject(null); // starting app default as 'undefined'
  private syncVehicular: BehaviorSubject<CreateVehicleEntranceDto[] | null> = new BehaviorSubject(null); // starting app default as 'undefined'

  constructor(private platform: Platform, private storage: Storage) {
    this.platform.ready().then(async () => {
      await this.storage.create();
      const lang = await this.findDefaultLang();
      this.defaultLang.next(lang);
      const isRegister = await this.get('IsRegister');
      this.isRegister.next(isRegister === 'true');
      const geolocation = await this.get('Geolocation', true);
      this.geolocation.next(geolocation ? geolocation : null);
      const farm = await this.get('Farm');
      this.farm.next(farm);
      const country = await this.get('Country');
      this.country.next(country);
      const entrance = await this.get('Entrance');
      this.entrance.next(entrance);
      const locationId = await this.get('LocationId');
      this.locationId.next(locationId);
      const typeAccess = await this.get('TypeAccess');
      this.typeAccess.next(typeAccess);
      const fullscreen = await this.get('FullScreen');
      this.fullscreen.next(fullscreen);
      const check = await this.get('Check');
      this.check.next(check);
      const syncPedestrian = await this.get('SyncPedestrian', true);
      this.syncPedestrian.next(syncPedestrian);
      const syncVehicular = await this.get('SyncVehicular', true);
      this.syncVehicular.next(syncVehicular);
    });
  }

  private async findDefaultLang() {
    try {
      const lang = await this.get('DefaultLang');
      if (!lang) {
        await this.setDefaultLang('es');
        return await this.findDefaultLang();
      }
      return lang;
    } catch (error) {
      console.log('Error StorageService findDefaultLang ', error);
      return null;
    }
  }

  getDefaultLang(): Observable<string> {
    return this.defaultLang.asObservable();
  }

  getIsRegister(): Observable<boolean> {
    return this.isRegister.asObservable();
  }

  getGeolocation(): Observable<{ lat: number; lng: number }> {
    return this.geolocation.asObservable();
  }

  getFarm(): Observable<FarmDto> {
    return this.farm.asObservable();
  }

  getEntrance(): Observable<EntranceDto> {
    return this.entrance.asObservable();
  }

  getLocationId(): Observable<string> {
    return this.locationId.asObservable();
  }

  getTypeAccess(): Observable<number> {
    return this.typeAccess.asObservable();
  }

  getSyncP(): Observable<boolean> {
    return this.syncP.asObservable();
  }

  getSyncV(): Observable<boolean> {
    return this.syncV.asObservable();
  }

  getFullScreen(): Observable<boolean> {
    return this.fullscreen.asObservable();
  }
  getCheck(): Observable<boolean> {
    return this.check.asObservable();
  }

  getCountry(): Observable<string> {
    return this.country.asObservable();
  }

  getSyncPedestrian(): Observable<CreateAttendanceDto[] | null> {
    return this.syncPedestrian.asObservable();
  }

  getSyncVehicular(): Observable<CreateVehicleEntranceDto[] | null> {
    return this.syncVehicular.asObservable();
  }

  async setDefaultLang(lang: string) {
    try {
      await this.set('DefaultLang', lang);
      this.defaultLang.next(lang);
    } catch (error) {
      console.log('Error StorageService setDefaultLang - ' + lang, error);
    }
  }

  async getTitle(): Promise<string> {
    let title = '';
    const typeAccess = await this.get('TypeAccess');
    switch (typeAccess) {
      case 1:
        title = 'pedestrian';
        break;
      case 2:
        title = 'vehicularIndividual';
        break;
      case 3:
        title = 'vehicularWorkers';
        break;
      case 4:
        title = 'vehicularManifest';
        break;
      default:
        break;
    }
    return title;
  }

  private activeObservables(key: string, value: any) {
    switch (key) {
      case 'IsRegister':
        const result = value === 'true';
        if (!result) {
          this.clear();
        }
        this.isRegister.next(value === 'true');
        break;
      case 'Geolocation':
        this.geolocation.next(JSON.parse(value));
        break;
      case 'Farm':
        this.farm.next(value);
        break;
      case 'Entrance':
        this.entrance.next(value);
        break;
      case 'Country':
        this.country.next(value);
        break;
      case 'LocationId':
        this.locationId.next(value);
        break;
      case 'TypeAccess':
        this.typeAccess.next(value);
        break;
      case 'Check':
        this.check.next(value);
        break;
      case 'SyncP':
        this.syncP.next(value === 'true');
        break;
      case 'SyncV':
        this.syncV.next(value === 'true');
        break;
      case 'SyncPedestrian':
        this.syncPedestrian.next(JSON.parse(value));
        break;
      case 'SyncVehicular':
        this.syncVehicular.next(JSON.parse(value));
        break;
    }
  }

  async set(key: string, value: any) {
    await this.storage.set(key, value);
    this.activeObservables(key, value);
  }

  async get(key: string, isJSON = false): Promise<any> {
    const value = await this.storage.get(key);
    return isJSON && value ? JSON.parse(value) : value;
  }

  async remove(key: string) {
    await this.storage.remove(key);
  }

  async clear() {
    await this.storage.clear();
  }
}
