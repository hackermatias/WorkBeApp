export class TagFolio implements ITagFolio {
    number: string;
    units: number;

    constructor(data?: ITagFolio) {
        if (data) {
            this.number = data.number;
            this.units = data.units;
        }
    }
}

interface ITagFolio {
    number: string;
    units: number;
}