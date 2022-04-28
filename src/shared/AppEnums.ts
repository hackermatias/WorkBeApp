/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { TenantAvailabilityState } from '../shared/service-proxies/service-proxies';


export class AppTenantAvailabilityState {
    static Available: number = TenantAvailabilityState._1;
    static InActive: number = TenantAvailabilityState._2;
    static NotFound: number = TenantAvailabilityState._3;
}
