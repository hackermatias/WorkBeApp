export class Profile implements IProfile {
    userCode: string;
    companyCode: string;
    securityCode: number;
    email: string;
    userName: string;
    companyName: string;

    constructor(data?: IProfile) {
        if (data) {
            this.userCode = data.userCode;
            this.companyCode = data.companyCode;
            this.securityCode = data.securityCode;
            this.email = data.email;
            this.userName = data.userName;
            this.companyName = data.companyName;
        }
    }
}

interface IProfile {
    userCode: string;
    companyCode: string;
    securityCode: number;
    email: string;
    userName: string;
    companyName: string;
}
