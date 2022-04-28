export class LocationType implements ILocationType {
    id: string;
    name: string;
    type: 'crop' | 'control-point';
    farmId: string;
    farmName: string;

    constructor(data?: ILocationType) {
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.type = data.type;
            this.farmId = data.farmId;
            this.farmName = data.farmName;
        }
    }
}

interface ILocationType {
    id: string;
    name: string;
    type: 'crop' | 'control-point';
    farmId: string;
    farmName: string;
}