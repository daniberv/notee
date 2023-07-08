import {
    Menu,
    BrowserWindow,
    MenuItemConstructorOptions,
  } from 'electron';
  
  interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
    selector?: string;
    submenu?: DarwinMenuItemConstructorOptions[] | Menu;
  }
  
  export default class MenuBuilder {
    mainWindow: BrowserWindow;
  
    constructor(mainWindow: BrowserWindow) {
      this.mainWindow = mainWindow;
    }
  
    buildMenu(): Menu {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
      ) {
        this.setupDevelopmentEnvironment();
      }
  
      const template =
        process.platform === 'darwin'
          ? this.buildDarwinTemplate()
          : this.buildDefaultTemplate();
  
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
  
      return menu;
    }
  
    setupDevelopmentEnvironment(): void {
      this.mainWindow.webContents.on('context-menu', (_, props) => {
        const { x, y } = props;
  
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click: () => {
              this.mainWindow.webContents.inspectElement(x, y);
            },
          },
        ]).popup({ window: this.mainWindow });
      });
    }
  
    buildDarwinTemplate(): MenuItemConstructorOptions[] {
      const subMenuAbout: DarwinMenuItemConstructorOptions = {};
      const subMenuEdit: DarwinMenuItemConstructorOptions = {};
      const subMenuViewDev: MenuItemConstructorOptions = {};
      const subMenuViewProd: MenuItemConstructorOptions = {};
      const subMenuWindow: DarwinMenuItemConstructorOptions = {};
      const subMenuHelp: MenuItemConstructorOptions = {};
  
      const subMenuView =
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
          ? subMenuViewDev
          : subMenuViewProd;
  
      return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
    }
  
    buildDefaultTemplate() {
      const templateDefault: never[] = [
      ];
  
      return templateDefault;
    }
  }
  