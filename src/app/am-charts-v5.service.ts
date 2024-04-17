import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export interface AmCharts5ImportedModules {
  am5core: typeof import('@amcharts/amcharts5');
  am5charts: typeof import('@amcharts/amcharts5/xy');
  am5maps: typeof import('@amcharts/amcharts5/map');
  am5lang: {
    'en-DE': typeof import('@amcharts/amcharts5/locales/de_DE');
    'en-UK': typeof import('@amcharts/amcharts5/locales/en');
    'en-US': typeof import('@amcharts/amcharts5/locales/en_US');
  };
  am5geodata_worldLow: typeof import('@amcharts/amcharts5-geodata/worldLow').default;
}

@Injectable({
  providedIn: 'root',
})
export class AmCharts5Service {
  public readonly modulesV5: Observable<AmCharts5ImportedModules>;
  private readonly modulesV5Subject: BehaviorSubject<AmCharts5ImportedModules | null>;

  constructor() {
    this.modulesV5Subject = new BehaviorSubject<AmCharts5ImportedModules | null>(null);
    this.modulesV5 = this.modulesV5Subject.asObservable().pipe(
      filter((m) => m !== null),
      take(1)
    );
    // dynamically import modules for greatly reduced initial build sized
    Promise.all([
      // webpack magic comments to create a dedicated chunk for am charts
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/xy'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/map'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/locales/en_US'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/locales/de_DE'),
      import(/* webpackChunkName: "amcharts" */ '@amcharts/amcharts5/locales/en'),
      import(/* webpackChunkName: "amcharts_geodata" */ '@amcharts/amcharts5-geodata/worldLow'),
    ])
      .then((modules) => {
        // extract amCharts modules from dynamic import
        const am5core = modules[0];
        am5core.disposeAllRootElements();
        am5core.addLicense('AM5C275830199'); // KEY CHARTS
        am5core.addLicense('AM5M275830199'); // KEY MAPS
        const am5charts = modules[1];
        const am5maps = modules[2];
        const am5locales_en_US = modules[3];
        const am5locales_de_DE = modules[4];
        const am5locales_en = modules[5];
        const am5geodata_worldLow = modules[6].default;

        // pack into typed interface
        const importedModules: AmCharts5ImportedModules = {
          am5core,
          am5charts,
          am5lang: {
            'en-DE': am5locales_de_DE,
            'en-UK': am5locales_en,
            'en-US': am5locales_en_US,
          },
          am5maps,
          am5geodata_worldLow,
        };
        // save imported modules
        this.modulesV5Subject.next(importedModules);
      })
      .catch((e) => {
        console.error('Error during amCharts dynamic import', e);
      });
  }
}
