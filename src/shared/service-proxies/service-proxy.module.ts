import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AbpHttpInterceptor } from 'abp-ng2-module';
import * as ApiServiceProxies from './service-proxies';

@NgModule({
    providers: [
        ApiServiceProxies.RoleServiceProxy,
        ApiServiceProxies.SessionServiceProxy,
        ApiServiceProxies.TenantServiceProxy,
        ApiServiceProxies.UserServiceProxy,
        ApiServiceProxies.TokenAuthServiceProxy,
        ApiServiceProxies.AccountServiceProxy,
        ApiServiceProxies.ConfigurationServiceProxy,
        ApiServiceProxies.BusinessAreaServiceProxy,
        ApiServiceProxies.EconomicActivityServiceProxy,
        ApiServiceProxies.CurrencyServiceProxy,
        ApiServiceProxies.CompanyServiceProxy,
        ApiServiceProxies.MainProductServiceProxy,
        ApiServiceProxies.AddressServiceProxy,
        ApiServiceProxies.FarmServiceProxy,
        ApiServiceProxies.AppProductServiceProxy,
        ApiServiceProxies.ContractorServiceProxy,
        ApiServiceProxies.WorkerServiceProxy,
        ApiServiceProxies.WorkShiftServiceProxy,
        ApiServiceProxies.BreakServiceProxy,
        ApiServiceProxies.AttendanceServiceProxy,
        ApiServiceProxies.AbsenceServiceProxy,
        ApiServiceProxies.ScheduleServiceProxy,
        ApiServiceProxies.CountryServiceProxy,
        ApiServiceProxies.IdentificationTypeServiceProxy,
        ApiServiceProxies.JobTitleServiceProxy,
        ApiServiceProxies.MaritalStatusServiceProxy,
        ApiServiceProxies.GenreServiceProxy,
        ApiServiceProxies.DepartmentServiceProxy,
        ApiServiceProxies.TransportServiceProxy,
        ApiServiceProxies.AcademicDegreeServiceProxy,
        ApiServiceProxies.PaymentMethodServiceProxy,
        ApiServiceProxies.CostCenterServiceProxy,
        ApiServiceProxies.ActionTypeServiceProxy,
        ApiServiceProxies.EntranceServiceProxy,
        ApiServiceProxies.RouteServiceProxy,
        ApiServiceProxies.TransportServiceProxy,
        ApiServiceProxies.TransportTypeServiceProxy,
        ApiServiceProxies.TransportClassificationServiceProxy,

        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class ServiceProxyModule { }
