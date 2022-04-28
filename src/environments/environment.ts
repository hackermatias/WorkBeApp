/* eslint-disable @typescript-eslint/naming-convention */
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appConfig: 'appconfig.json',
  appVersion: 'v711demo1',
  USERDATA_KEY: 'authf649fc9a5f55',
  apiUrl: 'api',
  // eslint-disable-next-line max-len
  azureSaSUrl: 'https://agroprime.blob.core.windows.net/access?sv=2020-04-08&st=1900-01-01T00%3A00%3A00Z&se=9999-12-31T23%3A59%3A00Z&sr=c&sp=racwdxlt&sig=%2BpugTUnT0Uy1CgAAgxnkGoaJCX4OMeCulD20SQDjTi8%3D'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
