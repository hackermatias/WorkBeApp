import { Component, Injector, Input, OnInit } from '@angular/core';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { ModalController } from '@ionic/angular';
import { timer } from 'rxjs';
import { AppComponentBase } from '../../shared/app-component-base';
import { AttendanceDto } from '../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent extends AppComponentBase implements OnInit {
  @Input() model: AttendanceDto;
  from: number;
  strDate = '';
  defaultImage = '../../assets/imgs/profile-default-img.png';
  check: boolean;
  translateDay: string;
  translateMonth: string;

  constructor(
    injector: Injector,
    private tts: TextToSpeech,
    private modalController: ModalController
  ) {
    super(injector);
    this.storageService.getCheck().subscribe((value: boolean) => {
      this.check = value;
    });
    this.storageService.getTypeAccess().subscribe(value => this.from = value);
  }

  async ngOnInit() {
    this.translateDay = await this.translate.get(this.model.startDate.format('dddd')).toPromise();
    this.translateMonth = await this.translate.get(this.model.startDate.format('MMMM')).toPromise();
    const locale = this.translate.currentLang === 'en' ? 'en-GB' : 'es-CL';
    this.tts.speak({ text: this.model.fullNameWorker.toLowerCase(), locale }).then(() => {
      timer(1000).subscribe(() => {
        this.close();
      });
    });
  }

  async close() {
    await this.modalController.dismiss();
  }

  get formatTime(): string {
    return this.model.startDate.format('HH:mm');
  }

  get formatDate(): string {
    // eslint-disable-next-line max-len
    return this.translateDay + ' ' + this.model.startDate.format('D') + ' ' + this.translateMonth + ' ' + this.model.startDate.format('YYYY');
  }

  get fullNameWorker(): string {
    if (this.model.worker) {
      return `${this.model.worker.name} ${this.model.worker.middleName} ${this.model.worker.surName} ${this.model.worker.lastName}`;
    }
    return this.model.fullNameWorker;
  }

  get attendanceImage(): string {
    return this.model.photo ? `url(data:image/jpeg;base64, ${this.model.photo})` : `url(${this.defaultImage})`;
  }
}
