
export class LanguagesDto implements ILanguageDto {
  displayName: string;
  icon: string;
  isDefault: boolean;
  isDisabled: boolean;
  isRightToLeft: boolean;
  name: string;
  /**
   *
   */
  constructor(data?: ILanguageDto) {
    if (data) {
      this.displayName = data.displayName;
      this.icon = data.icon;
      this.isDefault = data.isDefault;
      this.isDisabled = data.isDisabled;
      this.isRightToLeft = data.isRightToLeft;
      this.name = data.name;
    }
  }
}
interface ILanguageDto {
  displayName: string;
  icon: string;
  isDefault: boolean;
  isDisabled: boolean;
  isRightToLeft: boolean;
  name: string;
}
