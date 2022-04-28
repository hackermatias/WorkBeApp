/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TokenService, LogService, UtilsService } from 'abp-ng2-module';
import { AppConsts } from '../../shared/AppConsts';
import { UrlHelper } from '../../shared/helpers/UrlHelper';
import {
    AuthenticateModel,
    AuthenticateResultModel,
    TokenAuthServiceProxy,
} from '../../shared/service-proxies/service-proxies';
import { StorageService } from '../services/storage.service';
import { timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';

@Injectable()
export class AppAuthService {
    authenticateModel: AuthenticateModel;
    authenticateResult: AuthenticateResultModel;
    rememberMe: boolean;

    constructor(
        private _tokenAuthService: TokenAuthServiceProxy,
        private _router: Router,
        private _utilsService: UtilsService,
        private _tokenService: TokenService,
        private _logService: LogService,
        private storageService: StorageService,
        private translate: TranslateService,
        private alertController: AlertController
    ) {
        this.clear();
    }

    logout(reload?: boolean): void {
        abp.auth.clearToken();
        abp.utils.setCookieValue(
            AppConsts.authorization.encryptedAuthTokenName,
            undefined,
            undefined,
            abp.appPath
        );
        if (reload !== false) {
            location.href = AppConsts.appBaseUrl;
        }
    }

    authenticate(finallyCallback?: () => void): void {
        finallyCallback = finallyCallback || (() => { });

        this._tokenAuthService
            .authenticate(this.authenticateModel)
            .pipe(
                finalize(() => {
                    finallyCallback();
                })
            )
            .subscribe(
                (result: AuthenticateResultModel) => {
                this.processAuthenticateResult(result);
            },
            (error => {
                console.log(error.message);
                this.showError('loginErrorMsg');
            }));
    }

    private processAuthenticateResult(
        authenticateResult: AuthenticateResultModel
    ) {
        this.authenticateResult = authenticateResult;
        console.log(this.authenticateResult);

        if (authenticateResult.accessToken) {
            // Successfully logged in
            this.login(
                authenticateResult.accessToken,
                authenticateResult.encryptedAccessToken,
                authenticateResult.expireInSeconds,
                this.rememberMe
            );
        } else {
            // Unexpected result!
            this._logService.warn('Unexpected authenticateResult!');
            this._router.navigate(['login']);
        }
    }

    private login(
        accessToken: string,
        encryptedAccessToken: string,
        expireInSeconds: number,
        rememberMe?: boolean
    ): void {
        const tokenExpireDate = rememberMe
            ? new Date(new Date().getTime() + 1000 * expireInSeconds)
            : undefined;

        this._tokenService.setToken(accessToken, tokenExpireDate);

        this._utilsService.setCookieValue(
            AppConsts.authorization.encryptedAuthTokenName,
            encryptedAccessToken,
            tokenExpireDate,
            abp.appPath
        );

        // let initialUrl = UrlHelper.initialUrl;
        // if (initialUrl.indexOf('/login') > 0) {
        //     initialUrl = AppConsts.appBaseUrl;
        // }

        // location.href = initialUrl;
        timer(1000).subscribe(async () => {
            await this.storageService.set('IsRegister', 'true');
            location.href = location.origin;
        });
    }

    private clear(): void {
        this.authenticateModel = new AuthenticateModel();
        this.authenticateModel.rememberClient = true;
        this.authenticateModel.isWeb = false;
        this.authenticateModel.clientName = 'WAC';
        this.authenticateResult = null;
        this.rememberMe = false;
    }

    private async showError(msg: string) {
        const alert = await this.alertController.create({
          header: await this.translate.get('error').toPromise(),
          message: await this.translate.get(msg).toPromise(),
          mode: 'ios',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
            },
          ],
        });
        await alert.present();
      }
}
