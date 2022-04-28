/* eslint-disable max-len */
import { Injector, ElementRef } from '@angular/core';
import { AppConsts } from '../shared/AppConsts';
import {
    LocalizationService,
    PermissionCheckerService,
    FeatureCheckerService,
    NotifyService,
    SettingService,
    MessageService,
    AbpMultiTenancyService
} from 'abp-ng2-module';

import { AppSessionService } from '../shared/session/app-session.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../shared/services/storage.service';

export abstract class AppComponentBase {

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;

    localization: LocalizationService;
    permission: PermissionCheckerService;
    feature: FeatureCheckerService;
    notify: NotifyService;
    setting: SettingService;
    message: MessageService;
    multiTenancy: AbpMultiTenancyService;
    appSession: AppSessionService;
    elementRef: ElementRef;
    translate: TranslateService;
    storageService: StorageService;

    constructor(injector: Injector) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.feature = injector.get(FeatureCheckerService);
        this.notify = injector.get(NotifyService);
        this.setting = injector.get(SettingService);
        this.message = injector.get(MessageService);
        this.multiTenancy = injector.get(AbpMultiTenancyService);
        this.appSession = injector.get(AppSessionService);
        this.translate = injector.get(TranslateService);
        this.storageService = injector.get(StorageService);
        this.elementRef = injector.get(ElementRef);
        this.storageService.getDefaultLang().subscribe((lang: string) => {
            this.translate.setDefaultLang(lang);
        });

        // this.primengConfig.setTranslation({
        //     "startsWith": "Starts with",
        // "contains": "Contains",
        // "notContains": "Not contains",
        // "endsWith": "Ends with",
        // "equals": "Equals",
        // "notEquals": "Not equals",
        // "noFilter": "No Filter",
        // "lt": "Less than",
        // "lte": "Less than or equal to",
        // "gt": "Greater than",
        // "gte": "Great then or equals",
        // "is": "Is",
        // "isNot": "Is not",
        // "before": "Before",
        // "after": "After",
        // "clear": "Clear",
        // "apply": "Apply",
        // "matchAll": "Match All",
        // "matchAny": "Match Any",
        // "addRule": "Add Rule",
        // "removeRule": "Remove Rule",
        // "accept": "Yes",
        // "reject": "No",
        // "choose": "Choose",
        // "upload": "Upload",
        // "cancel": "Cancel",
        // "dayNames": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        // "dayNamesShort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        // "dayNamesMin": ["Su","Mo","Tu","We","Th","Fr","Sa"],
        // "monthNames": ["January","February","March","April","May","June","July","August","September","October","November","December"],
        // "monthNamesShort": ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        // "today": "Today",
        // "weekHeader": "Wk"
        // });
    }

    async l(key: string, args: any): Promise<string> {
        let localizedText = await this.translate.get(key, args).toPromise();

        if (!localizedText) {
            localizedText = key;
        }

        return localizedText;
    }

    // isGranted(permissionName: string): boolean {
    //     return this.permission.isGranted(permissionName);
    // }
}
