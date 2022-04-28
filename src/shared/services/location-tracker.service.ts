import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocationTracker {
  constructor(
    private geolocation: Geolocation,
    private storage: StorageService
  ) { }

  startWatchPosition() {
    this.geolocation
      .watchPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      })
      .subscribe(async (geoposition: Geoposition) => {
        if (geoposition && geoposition.coords) {
          await this.storage.set('CurrentPoint', {
            longitude: geoposition.coords.longitude,
            latitude: geoposition.coords.latitude
          });
        } else {
          await this.storage.set('CurrentPoint', {
            longitude: 0,
            latitude: 0
          });
        };
      });
  }
}
