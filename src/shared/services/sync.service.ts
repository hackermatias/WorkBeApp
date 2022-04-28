/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import {
  BlobServiceClient,
  BlobUploadCommonResponse,
} from '@azure/storage-blob';
import { environment } from '../../environments/environment';
import { CreateAttendanceDto, CreateVehicleEntranceDto, FarmDto } from '../service-proxies/service-proxies';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private savingP = false;
  private savingV = false;

  constructor(private storageService: StorageService) {
    this.storageService.getSyncP().subscribe(async (syncP) => {
      console.log('SyncP', syncP);
      if (syncP) {
        if (this.savingP) {
          return;
        }
        this.savingP = true;
      } else {
        this.savingP = false;
      }
      if (this.savingP && syncP) {
        console.log('Start Pedestrian Sync');
        await this.sendAttendancesP();
        await this.storageService.set('SyncP', 'false');
        console.log('End Pedestrian Sync');
      }
    });
    this.storageService.getSyncV().subscribe(async (syncV) => {
      console.log('SyncV', syncV);
      if (syncV) {
        if (this.savingV) {
          return;
        }
        this.savingV = true;
      } else {
        this.savingV = false;
      }
      if (this.savingV && syncV) {
        console.log('Start Vehicular Sync');
        await this.sendAttendancesV();
        await this.storageService.set('SyncV', 'false');
        console.log('End Vehicular Sync');
      }
    });
  }

  private async sendAttendancesP() {
    try {
      let syncPedestrian: CreateAttendanceDto[] = await this.storageService.get('SyncPedestrian', true);
      let attendances: CreateAttendanceDto[] = await this.storageService.get('Attendances', true);
      const farm: FarmDto = await this.storageService.get('Farm');
      if (!syncPedestrian) {
        syncPedestrian = [];
      }
      if (!attendances) {
        attendances = [];
      }
      const pendingP = attendances.filter((y) => syncPedestrian.findIndex(s => s.startDate === y.startDate && s.dniWorker === y.dniWorker) === -1);
      const blobServiceClient = new BlobServiceClient(environment.azureSaSUrl);
      const requestP: Promise<BlobUploadCommonResponse>[] = [];
      for (const p of pendingP) {
        const containerClient = blobServiceClient.getContainerClient(
          `${farm.tenantId}`
        );
        // eslint-disable-next-line max-len
        const blobname = `${moment(p.startDate).format('YYYY-MM-DD')}/${farm.id}/${p.entranceId}/${p.creatorUserId}/_p/${p.dniWorker}_${moment(p.creationTime).toDate().getTime()}.json`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobname);
        const fileJson = JSON.stringify(p);
        const byteNumbers = new Array(fileJson.length);
        for (let i = 0; i < fileJson.length; i++) {
          byteNumbers[i] = fileJson.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const BINARY_ARR = byteArray.buffer;
        requestP.push(blockBlobClient.uploadData(BINARY_ARR));
      }
      syncPedestrian = await this.storageService.get('SyncPedestrian', true);
      if (!syncPedestrian) {
        syncPedestrian = [];
      }
      let count = 0;
      while (requestP.length) {
        const results = await Promise.all(requestP.splice(0, 50));
        for (let i = 0; i < results.length; i++) {
          if (results[i]) {
            const pending = pendingP[i + count];
            syncPedestrian = [...syncPedestrian, pending];
          }
        }
        await this.storageService.set('SyncPedestrian', JSON.stringify(syncPedestrian));
        syncPedestrian = await this.storageService.get('SyncPedestrian', true);
        count += 50;
      }
    } catch (error) {
      console.error(error);
    }
  }
  private async sendAttendancesV() {
    try {
      let syncVehicular: CreateVehicleEntranceDto[] = await this.storageService.get('SyncVehicular', true);
      let vehicularAttendances: CreateVehicleEntranceDto[] = await this.storageService.get('VehicularAttendances', true);
      const farm: FarmDto = await this.storageService.get('Farm');
      if (!syncVehicular) {
        syncVehicular = [];
      }
      if (!vehicularAttendances) {
        vehicularAttendances = [];
      }
      const pendingV = vehicularAttendances.filter((y) => syncVehicular.findIndex(s => s.startDate === y.startDate && s.plateNumber === y.plateNumber) === -1);
      const blobServiceClient = new BlobServiceClient(environment.azureSaSUrl);
      const requestV: Promise<BlobUploadCommonResponse>[] = [];
      for (const v of pendingV) {
        const containerClient = blobServiceClient.getContainerClient(
          `${farm.tenantId}`
        );
        // eslint-disable-next-line max-len
        const blobname = `${moment(v.startDate).format('YYYY-MM-DD')}/${farm.id}/${v.entranceId}/${v.creatorUserId}/_v/${v.plateNumber}_${moment(v.creationTime).toDate().getTime()}.json`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobname);
        const fileJson = JSON.stringify(v);
        const byteNumbers = new Array(fileJson.length);
        for (let i = 0; i < fileJson.length; i++) {
          byteNumbers[i] = fileJson.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const BINARY_ARR = byteArray.buffer;
        requestV.push(blockBlobClient.uploadData(BINARY_ARR));
      }
      syncVehicular = await this.storageService.get('SyncVehicular', true);
      if (!syncVehicular) {
        syncVehicular = [];
      }
      let count = 0;
      while (requestV.length) {
        const results = await Promise.all(requestV.splice(0, 50));
        for (let i = 0; i < results.length; i++) {
          if (results[i]) {
            const pending = pendingV[i + count];
            syncVehicular = [...syncVehicular, pending];
          }
        }
        await this.storageService.set('SyncVehicular', JSON.stringify(syncVehicular));
        syncVehicular = await this.storageService.get('SyncVehicular', true);
        count += 50;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
