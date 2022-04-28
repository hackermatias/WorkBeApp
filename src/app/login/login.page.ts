import { Component, Injector, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppComponentBase } from '../../shared/app-component-base';
import { AppAuthService } from '../../shared/auth/app-auth.service';
import {
  AccountServiceProxy,
  IsTenantAvailableInput,
} from '../../shared/service-proxies/service-proxies';
import { AppTenantAvailabilityState } from '../../shared/AppEnums';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends AppComponentBase implements OnInit {
  fg: FormGroup;
  version = '';

  submitting = false;
  tenancyName = '';

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    public authService: AppAuthService,
    private accountService: AccountServiceProxy,
    private appVersion: AppVersion,
  ) {
    super(injector);
    this.storageService.getDefaultLang().subscribe((lang: string) => {
      this.translate.setDefaultLang(lang);
    });
    this.fg = this.fb.group({
      tenancyName: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.appVersion
      .getVersionNumber()
      .then((value) => (this.version = value))
      .catch(() => (this.version = 'dev'));
  }

  async login() {
    const { tenancyName, username, password } = this.fg.value;
    this.authService.authenticateModel.userNameOrEmailAddress = username;
    this.authService.authenticateModel.password = password;
    this.authService.authenticateModel.rememberClient = true;
    try {
      const input = new IsTenantAvailableInput();
      input.tenancyName = tenancyName;

      const result = await this.accountService
        .isTenantAvailable(input)
        .toPromise();

      switch (result.state) {
        case AppTenantAvailabilityState.Available:
          abp.multiTenancy.setTenantIdCookie(result.tenantId);
          this.authService.authenticate(() => {});
          return;
        case AppTenantAvailabilityState.InActive:
        case AppTenantAvailabilityState.NotFound:
          this.showError('loginErrorMsg');
          return;
      }
    } catch (error) {
      console.log('loginError', error);
      this.showError(error.message);
    }
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
