export class MenuItem implements IMenuItem {
  id?: number;
  parentId?: number;
  label?: string;
  route?: string;
  icon?: string;
  permissionName?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  children?: MenuItem[];
  type: 'section' | 'separator' | 'menu';

  constructor(data?: IMenuItem) {
    if (data) {
      this.id = data.id;
      this.parentId = data.parentId;
      this.label = data.label;
      this.route = data.route;
      this.icon = data.icon;
      this.permissionName = data.permissionName;
      this.isActive = data.isActive;
      this.isCollapsed = data.isCollapsed;
      this.children = data.children;
      this.type = data.type;
    }
  }
}


interface IMenuItem {
  id?: number;
  parentId?: number;
  label?: string;
  route?: string;
  icon?: string;
  permissionName?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  children?: MenuItem[];
  type: 'section' | 'separator' | 'menu';
}
