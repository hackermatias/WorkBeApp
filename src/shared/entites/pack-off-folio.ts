import * as moment from 'moment';

export class PackOffFolio implements IPackOffFolio {
    guideNumber: string;
    folios: number;
    foliosNumber: string[];
    units: number;
    date: moment.Moment;

    constructor(data?: IPackOffFolio) {
        if (data) {
            this.guideNumber = data.guideNumber;
            this.folios = data.folios;
            this.foliosNumber = data.foliosNumber;
            this.units = data.units;
            this.date = data.date;
        }
    }
}

interface IPackOffFolio {
    guideNumber: string;
    folios: number;
    foliosNumber: string[];
    units: number;
    date: moment.Moment;
}