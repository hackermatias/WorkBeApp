/* eslint-disable no-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { PointDto } from '../../shared/service-proxies/service-proxies';

export class MapMethods {
    private readonly EARTH_RADIUS = 6378137;

    calculateArea(list: PointDto[]) {
        return Math.abs(this.computeSignedArea(list));
    }

    private computeSignedArea(path: PointDto[], radius = this.EARTH_RADIUS) {
        const size = path.length;
        if (size < 3) { return 0; }
        let total = 0;
        const prev = path[size - 1];
        let prevTanLat = Math.tan((Math.PI / 2 - this.toRadians(prev.latitude)) / 2);
        let prevLng = this.toRadians(prev.longitude);
        // For each edge, accumulate the signed area of the triangle formed by the North Pole
        // and that edge ("polar triangle").
        for (const point of path) {
            const tanLat = Math.tan((Math.PI / 2 - this.toRadians(point.latitude)) / 2);
            const lng = this.toRadians(point.longitude);
            total += this.polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
            prevTanLat = tanLat;
            prevLng = lng;
        }
        return total * (radius * radius);
    }

    private polarTriangleArea(tan1: number, lng1: number, tan2: number, lng2: number) {
        const deltaLng = lng1 - lng2;
        const t = tan1 * tan2;
        return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
    }

    private toRadians(input: number) {
        return input * Math.PI / 180;
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //:::                                                                         :::
    //:::  This routine calculates the distance between two points (given the     :::
    //:::  latitude/longitude of those points). It is being used to calculate     :::
    //:::  the distance between two locations using GeoDataSource(TM) products    :::
    //:::                                                                         :::
    //:::  Passed to function:                                                    :::
    //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
    //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
    //:::    unit = the unit you desire for results                               :::
    //:::           where: 'M' is statute miles (default)                         :::
    //:::                  'K' is kilometers                                      :::
    //:::                  'N' is nautical miles                                  :::
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    distanceTo(start: PointDto, dest: PointDto, unit: 'M' | 'K' | 'N') {
        const theta = start.longitude - dest.longitude;
        let dist = Math.sin(this.deg2rad(start.latitude)) * Math.sin(this.deg2rad(dest.latitude)) + Math.cos(this.deg2rad(start.latitude)) * Math.cos(this.deg2rad(dest.latitude)) * Math.cos(this.deg2rad(theta));
        dist = Math.acos(dist);
        dist = this.rad2deg(dist);
        dist = dist * 60 * 1.1515;
        if (unit == 'K') {
            dist = dist * 1.609344;
        }
        else if (unit == 'N') {
            dist = dist * 0.8684;
        }
        return (dist);
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //::  This function converts decimal degrees to radians             :::
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    private deg2rad(deg: number) {
        return (deg * Math.PI / 180.0);
    }
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    //::  This function converts radians to decimal degrees             :::
    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    private rad2deg(rad: number) {
        return (rad / Math.PI * 180.0);
    }

    calculatePerimeter(list: PointDto[], unit: 'M' | 'K' | 'N') {
        let total = 0;
        for (var i = 0; i < list.length - 1; i++) {
            total += this.distanceTo(list[i], list[i + 1], unit);
        }
        return total;
    }

    convertAreaFromM2To(total: number, UM: 'M2' | 'K2' | 'HA') {
        switch (UM) {
            case 'M2':
                return total;
            case 'K2':
                return (total / 1000);
            case 'HA':
                return (total / 10000);
            default:
                return total;
        }
    }

}