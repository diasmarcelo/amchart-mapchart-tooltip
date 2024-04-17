import * as am5 from '@amcharts/amcharts5';
import * as worldLow from '@amcharts/amcharts5-geodata/worldLow';
import { AbstractDataVizChartV5Instance } from './abstract-data-viz-chart-v5-instance';
import { DataVizMapProduction } from './tooltip-defect-map/tooltip-defect-map.component';
import { ChartBinderUtils } from './charts-binder-utils';
import { MapPolygonSeries } from '@amcharts/amcharts5/map';
import { AmCharts5ImportedModules } from './am-charts-v5.service';
import { getAbbreviations } from './countries-abbreviations.model';

export enum MapProductionDataLevel {
  REGION = 'REGION',
  SUBREGION = 'SUBREGION',
  MARKET = 'MARKET',
}

export const MAX_MOBILE_PORTRAIT_WIDTH = 666;
export const MIN_TABLET_WIDTH = 768;


export const IPHONE_XR_LANDSCAPE_WIDTH = 896;
export const MAX_TABLET_LANDSCAPE_WIDTH = 1300;


export const isMobile = (): boolean =>
  (window.innerWidth <= MAX_MOBILE_PORTRAIT_WIDTH && isPortrait()) ||
  (window.innerWidth <= IPHONE_XR_LANDSCAPE_WIDTH && !isPortrait());

export const isPortrait = (): boolean => window.innerWidth < window.innerHeight;

export const isLandscape = (): boolean =>
  window.innerWidth > window.innerHeight;

export const isTablet = (): boolean =>
  window.innerWidth <= MAX_TABLET_LANDSCAPE_WIDTH &&
  ((window.innerWidth >= MIN_TABLET_WIDTH && isPortrait()) ||
    (window.innerWidth > IPHONE_XR_LANDSCAPE_WIDTH && !isPortrait()));

export const createDeepKey = (mapDeepKey, region) => {
  if (mapDeepKey) {
    if (mapDeepKey.indexOf(region.name) === -1) {
      const KEYS = mapDeepKey.split('$');
      if (KEYS.length >= 2) {
        return `${KEYS[0]}$${region.name}`;
      } else {
        return `${mapDeepKey}$${region.name}`;
      }
    } else {
      return mapDeepKey;
    }
  } else {
    return `${region.name}`;
  }
};

export const getFontSizeFromCss = (variable: string): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value.slice(0, value.length - 2);
};

export const getLegendFontSize = (): number =>
  +getFontSizeFromCss('--font-size-accessory');

export const getColorFromCss = (variable: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

export interface AmChartOptions {
  projection?: Function;
  // 'any' here represent a Percent Obj from AmChart5
  radius?: any;
  panX?: boolean | string;
  panY?: boolean | string;
  wheelY?: boolean | string;
  wheelX?: boolean | string;
  pinchZoom?: boolean;
  maxPanOut?: number;
  minPanOut?: number;
}

export const getDataByLevel = (zoomKey, data) => {
  if (!zoomKey) {
    return data;
  }
  let dataToFind = data;
  let isFound = false;
  let idx = 0;
  const levelZoom = zoomKey.split('$');
  while (!isFound && idx < levelZoom.length) {
    const LEVEL = levelZoom[idx];
    dataToFind = dataToFind.find((el) => el.name === LEVEL);
    if (idx < levelZoom.length) {
      try {
        if (dataToFind?.data) {
          dataToFind = dataToFind.data;
        }
      } catch (error) {
        isFound = true;
      }
    }
    idx++;
  }
  return dataToFind;
};

export const chartTooltipDrilldonwID = 'chart-tooltip-drilldown-id';

export abstract class DataVizMapAbstractInstance extends AbstractDataVizChartV5Instance<DataVizMapProduction> {
  chart?: import('@amcharts/amcharts5/map').MapChart;
  legend?: am5.Legend;

  colors = {
    black: am5.color(getColorFromCss('--black')),
    white: am5.color(getColorFromCss('--white')),
    mapFill: am5.color(getColorFromCss('--map-fill-color')),
    mapStroke: am5.color(getColorFromCss('--map-stroke-color')),
  };

  bmwFontFamily = 'bmw-group-cond';
  fontColor = getColorFromCss('--font-color');

  chartBinderUtils = new ChartBinderUtils();
  zoomLevel: Map<string, number> = new Map<string, number>([
    //regions
    ['C1', 4],
    ['C3', 1.5],
    ['C4', 1.5],
    ['C5', 3],
    ['C1$', 6],
    ['C3$', 2],
    ['C4$', 2],
    ['C5$', 6],
    //subregions
    ['AF/EAST. EUROPE', 4],
    ['ASIA/PACIFIC', 6],
    ['AT/CEE', 8],
    ['AU/NZ', 4],
    ['BE/LU', 28],
    ['ES/PT', 17],
    ['LA', 2],
    ['NORTH. EUROPE', 11],
    ['TW/HK', 28],
    ['UK/IE', 18],
    ['ZA/SUBSAH', 15],
    //countries
    ['HR/GR/CZ/SK/LV/LT/DK/DE/FR/FI', 17],
    ['SE/NO/MY/PH/IT/PL', 11],
    ['HU/BG/SI/CY/NL/SG/IL/TH/IS', 18],
    ['RO/ID/IN/TR', 8],
    ['MT/CH/EE', 28],
    ['CA/CL/MX/AR/CN/US', 4],
    ['BR', 2],
  ]);
  eventHandler: Map<string, () => void>;
  protected rootElement: am5.Root;
  backGroundMapSeries: MapPolygonSeries;
  legendItems;

  isShowOnlySelectedSeriesWithColor = false;
  isMapInteractive = true;
  isMapBullets = false;
  isLargeTooltips = false;
  isCustomLegend = false;

  abstract beforeChartInit(): void;

  abstract drillUpAction(
    regionAction,
    polygonSeries,
    legend,
    regionBubble
  ): void;
  abstract getIsDrillDownAvailable(regionLevel): boolean;

  abstract handleActivateDrillUpBtn(chartBinderUtils, regionLevel): void;

  abstract updateActiveSeriesStatus(): void;

  constructor(
    readonly amCharts: AmCharts5ImportedModules,
    readonly data: DataVizMapProduction,
    readonly chartId: string
  ) {
    super();

    this.beforeChartInit();

    const extraOptions: AmChartOptions = this.getExtraOptions();

    this.initializeChart(
      this.amCharts.am5maps.MapChart,
      this.chartId,
      undefined,
      extraOptions
    );
    if (this.chart) {
      this.initializeLocale();
      this.initializeBackgroundMap();
      this.initializeWheelEvent();
      this.waitForChartReadyEvent();
    }
  }

  onChartReady(): void {
    this.updateActiveSeriesStatus();
  }

  dispose(): void {
    this.chart?.dispose();
  }

  getExtraOptions(): AmChartOptions {
    return {
      projection: this.amCharts.am5maps.geoNaturalEarth1(),
    };
  }

  initializeBackgroundMap(): void {
    const polygonSeries = this.chart.series.push(
      this.amCharts.am5maps.MapPolygonSeries.new(this.rootElement, {
        geoJSON: worldLow.default,
        // Exclude Frozen Antarctica
        exclude: ['AQ'],
        fill: am5.color(getColorFromCss('--map-base-color')),
      })
    );
    polygonSeries.hide();
    this.createColoredRegions(polygonSeries);

    const DEEP_LEVEL_KEY = this.data.mapDeepKey;
    const FILTER_DATA = getDataByLevel(DEEP_LEVEL_KEY, this.data.mapData);

    if (FILTER_DATA[0].level === MapProductionDataLevel.REGION) {
      polygonSeries.show();
      this.initializeZoomControl();
    }

    this.backGroundMapSeries = polygonSeries;
  }

  getDataForColoredRegions() {
    const DEEP_LEVEL_KEY = this.data.mapDeepKey;
    let FILTER_DATA = getDataByLevel(DEEP_LEVEL_KEY, this.data.mapData);

    // workaround to show only selected area with color in heatmap market drill down
    if (this.isShowOnlySelectedSeriesWithColor) {
      FILTER_DATA = FILTER_DATA.filter(
        (elem) => elem.name === this.data.selectedSeries.yCategory
      );
    }
    return FILTER_DATA;
  }

  private createColoredRegions(polygonSeries): void {
    const regionData = this.getDataForColoredRegions();
    const regionAction = {};

    const legend = this.createLegend();
    this.legend = legend;

    this.createMapSections(polygonSeries, legend, regionData, regionAction);

    this.handleLegendEvents(legend, regionAction);

    const CURRENT_LEVEL = regionData[0].level.toUpperCase();

    const regionBubble = this.isMapBullets
      ? this.createBubbleBullet(CURRENT_LEVEL)
      : null;

    this.handleDataValidation(
      polygonSeries,
      regionData,
      regionBubble,
      legend,
      regionAction,
      CURRENT_LEVEL
    );

    const drillUpAction = () =>
      this.drillUpAction(regionAction, polygonSeries, legend, regionBubble);

    this.chartBinderUtils.setReferenceObject(
      'drillUpActionMap',
      drillUpAction.bind(this)
    );
  }

  createMapSections(polygonSeries, legend, regionData, regionAction) {
    legend.children.clear();
    const CURRENT_LEVEL = regionData[0].level;
    const eventHandler: Map<string, () => void> = new Map();
    const values = {
      polygonSeries,
      regionData,
      regionAction,
      legend,
      eventHandler,
      CURRENT_LEVEL,
    };

    this.createColorGroup(values);

    this.eventHandler = eventHandler;
  }

  createColorGroup(values) {
    if (this.isCustomLegend) {
      this.createColorGroupByLegendSettings(values);
    } else {
      this.createColorGroupByMapDataSettings(values);
    }
  }

  createColorGroupByMapDataSettings(values) {
    const { regionData, legend, CURRENT_LEVEL } = values;
    let { regionAction } = values;

    for (const region of regionData) {
      this.hideRussia(region);

      regionAction = this.groupCountriesByColor(regionAction, region, values);

      const regionActions = regionAction[`${region.name}`].chartAction;
      this.pushColorGroupToLegend(legend, regionActions, CURRENT_LEVEL);
    }
    this.legendItems = regionAction;
  }

  createColorGroupByLegendSettings(values) {
    const { regionData, CURRENT_LEVEL, regionAction } = values;

    const legendData = this.data.legend;
    legendData.forEach((data) => {
      const region = regionData.filter((elem) => elem.color === data.color);

      let include = [];
      if (region) {
        include = [...new Set(region.flatMap((item) => item.include))];
      }

      regionAction[`${data.label}`] = {
        ...data,
        include,
        level: CURRENT_LEVEL,
      };

      regionAction[`${data.label}`].chartAction = this.chart.series.unshift(
        this.amCharts.am5maps.MapPolygonSeries.new(this.rootElement, {
          geoJSON: worldLow.default,
          include,
          exclude: ['AQ'],
          name: data.label,
          fill: am5.color(data.color),
        })
      );

      if (this.isMapInteractive) {
        regionAction[`${data.label}`].chartAction.mapPolygons.template.setAll({
          cursorOverStyle: 'pointer',
        });
      }

      if (region) {
        region.forEach((elem) =>
          this.groupCountriesByColor(regionAction, elem, values)
        );
      }
    });
    this.legendItems = regionAction;
  }

  pushColorGroupToLegend(legend, regionAction, CURRENT_LEVEL) {
    legend.data.push(regionAction);
  }

  handleDataValidation(
    polygonSeries,
    regionData,
    regionBubble,
    legend,
    regionAction,
    CURRENT_LEVEL
  ): void {
    polygonSeries.events.on('datavalidated', () => {
      this.onDataValidated(
        polygonSeries,
        regionData,
        regionBubble,
        legend,
        regionAction,
        CURRENT_LEVEL
      );
    });
  }

  onDataValidated(
    polygonSeries,
    regionData,
    regionBubble,
    legend,
    regionAction,
    CURRENT_LEVEL
  ) {
    regionData.forEach((region) => {
      this.onDataValidatedPerRegion(
        polygonSeries,
        region,
        regionAction,
        legend,
        CURRENT_LEVEL,
        regionBubble
      );
    });

    if (this.data.mapZoom) {
      const key = this.data.mapDeepKey.substring(0, 3);
      const deepKey = key.split('$')[0];
      const index = this.data.mapData.findIndex(
        (region) => region.name === deepKey
      );

      this.zoomToPoint(polygonSeries, deepKey, index, true);
    }
  }

  onDataValidatedPerRegion(
    polygonSeries,
    region,
    regionAction,
    legend,
    CURRENT_LEVEL,
    regionBubble
  ) {
    const { latitude, longitude } = this.regionMiddleCoord(
      polygonSeries,
      region.include
    );
    region.latitude = latitude;
    region.longitude = longitude;
    if (this.isMapBullets) {
      regionBubble?.data.push(region);
    }
  }

  zoomToPoint(
    polygonSeries,
    deepKey,
    index: number,
    mapZoom: boolean,
    secondaryDeepKey = undefined
  ) {
    const { latitude, longitude } = this.regionMiddleCoord(
      polygonSeries,
      this.data.mapData[index].include
    );
    if (
      mapZoom &&
      (this.data.mapZoom.latitude !== latitude ||
        this.data.mapZoom.longitude !== longitude)
    ) {
      this.data.mapZoom.latitude = latitude;
      this.data.mapZoom.longitude = longitude;
    }
    let ZOOM_LEVEL = this.zoomLevel.get(deepKey);
    if (secondaryDeepKey && this.zoomLevel.get(secondaryDeepKey)) {
      ZOOM_LEVEL = this.zoomLevel.get(secondaryDeepKey);
    }
    if (ZOOM_LEVEL === undefined) {
      const abbreviation = getAbbreviations([deepKey]);
      ZOOM_LEVEL = this.getZoomLevelByAbbreviation(abbreviation[0]);
    }
    this.chart.zoomToGeoPoint({ longitude, latitude }, ZOOM_LEVEL, true, 300);
  }

  getZoomLevelByAbbreviation(abbreviation) {
    let level;
    for (const [key, value] of this.zoomLevel) {
      if (key.includes(abbreviation)) {
        level = value;
        break;
      }
    }
    return level ? level : 8;
  }

  private createLegend() {
    const legend = this.chart.children.push(
      am5.Legend.new(this.rootElement, {
        x: this.getLegendLayoutXPosition(),
        layout: am5.GridLayout.new(this.rootElement, {
          maxColumns: 5,
          fixedWidthGrid: true,
        }),
        width: am5.percent(100),
        marginTop: 40,
      })
    );
    legend.labels.template.setAll({
      fontSize: getLegendFontSize(),
      fontFamily: this.bmwFontFamily,
      fill: am5.color(this.fontColor),
      maxWidth: 1,
      minWidth: this.getLegendLabelMinWidth(),
    });

    this.getLegendItemContainers(legend);
    this.getLegendMarkers(legend);

    return legend;
  }

  handleLegendEvents(legend, regionAction) {
    const legendEventHandler = (ev) => {
      const bulletSeries =
        this.chart.series.values[this.chart.series.values.length - 1];

      this.onLegendToggled(bulletSeries, ev, regionAction);
    };

    // eslint-disable-next-line no-underscore-dangle
    legend.itemContainers['_values'].forEach((container) => {
      container.events.on('click', legendEventHandler);
    });
    legend.itemContainers.template.events.on('click', legendEventHandler);
  }

  onLegendToggled(bulletSeries, ev, regionAction) {
    // eslint-disable-next-line no-underscore-dangle
    const targetName = ev.target.dataItem._settings['name'];
    if (this.isCustomLegend) {
      this.onCustomLegendClick(ev, targetName, regionAction);
    } else {
      this.toggleSeries(bulletSeries, targetName);
    }
  }

  onCustomLegendClick(ev, targetName, regionAction) {
    try {
      // eslint-disable-next-line no-underscore-dangle
      const legendColor = ev.target.dataItem.dataContext._settings.fill;
      for (const mapPolyMetadata in regionAction) {
        if (regionAction.hasOwnProperty(mapPolyMetadata)) {
          const mapPolyColor = regionAction[mapPolyMetadata].color;
          const amColor = am5.color(mapPolyColor);
          if (amColor.hex === legendColor.hex) {
            if (regionAction[mapPolyMetadata].chartAction.isHidden()) {
              regionAction[mapPolyMetadata].chartAction.show();
              regionAction[targetName].chartAction.hide();
            } else {
              regionAction[mapPolyMetadata].chartAction.hide();
              regionAction[targetName].chartAction.show();
            }
          }
        }
      }
    } catch (unused) {}
  }

  private createTooltip(tooltipSettings, backgroundSettings) {
    const tooltip = am5.Tooltip.new(this.rootElement, tooltipSettings);
    tooltip?.get('background')?.setAll(backgroundSettings);
    tooltip.adapters.add('bounds', () => {
      return this.chart.chartContainer.globalBounds();
    });
    return tooltip;
  }

  private initializeZoomControl(): void {
    const zoomControl = this.amCharts.am5maps.ZoomControl.new(
      this.rootElement,
      {}
    );
    const { minusButton, plusButton } = zoomControl;

    plusButton.setAll({
      paddingTop: 7,
      paddingRight: 7,
      paddingBottom: 5,
      paddingLeft: 7,
      width: 30,
      height: 30,
      background: am5.RoundedRectangle.new(this.rootElement, {
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        cornerRadiusBR: 4,
        cornerRadiusBL: 4,
        fill: am5.color(0xd9d9d9),
      }),
      icon: am5.Graphics.new(this.rootElement, {
        fill: am5.color(0x000),
        svgPath:
          'M9,0 L7,0 L7,7 L0,7 L0,9 L7,9 L7,16 L9,16 L9,9 L16,9 L16,7 L9,7 Z',
      }),
    });
    plusButton
      .get('background')
      .states.create('hover', {})
      .setAll({
        fill: am5.color(0xa3a3a3),
      });
    minusButton.setAll({
      paddingTop: 7,
      paddingRight: 7,
      paddingBottom: 5,
      paddingLeft: 7,
      width: 30,
      height: 30,
      background: am5.RoundedRectangle.new(this.rootElement, {
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        cornerRadiusBR: 4,
        cornerRadiusBL: 4,
        fill: am5.color(0xd9d9d9),
      }),
      icon: am5.Graphics.new(this.rootElement, {
        fill: am5.color(0x000),
        svgPath: 'M0,7 L0,9 L16,9 L16,7 Z',
      }),
    });
    minusButton
      .get('background')
      .states.create('hover', {})
      .setAll({
        fill: am5.color(0xa3a3a3),
      });
    const homeButton = this.amCharts.am5core.Button.new(this.rootElement, {
      paddingTop: 7,
      paddingRight: 7,
      paddingBottom: 5,
      paddingLeft: 7,
      width: 30,
      height: 30,
      background: am5.RoundedRectangle.new(this.rootElement, {
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        cornerRadiusBR: 4,
        cornerRadiusBL: 4,
        fill: am5.color(0xd9d9d9),
      }),
      icon: am5.Graphics.new(this.rootElement, {
        fill: am5.color(0x000),
        svgPath:
          'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8',
      }),
    });
    homeButton
      .get('background')
      .states.create('hover', {})
      .setAll({
        fill: am5.color(0xa3a3a3),
      });
    homeButton.events.on('click', () => this.chart.goHome());
    zoomControl.children.unshift(homeButton);
    this.chart.set('zoomControl', zoomControl);
  }

  getCountryCoord(polygonSeries, countryID) {
    try {
      const countryData = polygonSeries.getDataItemById(countryID);
      const countryPolygon = countryData.get('mapPolygon');
      return countryPolygon.geoCentroid();
    } catch (err) {
      return {
        longitude: 0,
        latitude: 0,
      };
    }
  }

  updateLongitudeLatitude(filterData, polygonSeries) {
    filterData.forEach((item) => {
      const { latitude, longitude } = this.regionMiddleCoord(
        polygonSeries,
        item.include
      );
      item.longitude = longitude;
      item.latitude = latitude;
    });

    return filterData;
  }

  //edge-case: handling the fact that the countryISO for UK is actually GB
  changeUKIDToGB(countryIDs: string[]) {
    const indexOfUK = countryIDs.indexOf('UK');
    if (indexOfUK !== -1) {
      countryIDs[indexOfUK] = 'GB';
    }
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  calculateCentralPoint(
    coordinates: { latitude: number; longitude: number }[]
  ) {
    const numCoordinates = coordinates.length;

    if (numCoordinates === 0) {
      return { latitude: 0, longitude: 0 };
    }

    let x = 0;
    let y = 0;
    let z = 0;

    for (const coord of coordinates) {
      const latRad = this.toRadians(coord.latitude);
      const lonRad = this.toRadians(coord.longitude);

      x += Math.cos(latRad) * Math.cos(lonRad);
      y += Math.cos(latRad) * Math.sin(lonRad);
      z += Math.sin(latRad);
    }

    x /= numCoordinates;
    y /= numCoordinates;
    z /= numCoordinates;

    const centralLon = Math.atan2(y, x);
    const centralSqrt = Math.sqrt(x * x + y * y);
    const centralLat = Math.atan2(z, centralSqrt);

    return {
      latitude: this.toDegrees(centralLat),
      longitude: this.toDegrees(centralLon),
    };
  }

  regionMiddleCoord(polygonSeries, countries) {
    const coordData = [];
    for (const element of countries) {
      coordData.push(this.getCountryCoord(polygonSeries, element));
    }
    return this.calculateCentralPoint(coordData);
  }

  getCountriesCoord(polygonSeries, countries) {
    const countriesCoordData = [];
    for (const element of countries) {
      countriesCoordData.push(this.getCountryCoord(polygonSeries, element));
    }
    return countriesCoordData;
  }

  getLightenColor(color, lighten) {
    const baseColor = am5.color(color);
    const lightenedColor = am5.Color.lighten(baseColor, lighten);
    return lightenedColor.toString();
  }

  groupCountriesByColor(groupedCountries, region, values) {
    this.changeUKIDToGB(region.include);
    const { polygonSeries, eventHandler, CURRENT_LEVEL } = values;

    groupedCountries[`${region.name}`] = {
      ...region,
    };

    groupedCountries[`${region.name}`].chartAction = this.chart.series.push(
      this.amCharts.am5maps.MapPolygonSeries.new(this.rootElement, {
        geoJSON: worldLow.default,
        include: region.include,
        name: region.name,
        fill: am5.color(region.color),
      })
    );

    if (this.isMapInteractive) {
      const HOVER_COLOR = this.getLightenColor(region.color, 0.3);
      groupedCountries[`${region.name}`].chartAction.mapPolygons.template.set(
        'interactive',
        true
      );
      groupedCountries[
        `${region.name}`
      ].chartAction.mapPolygons.template.states.create('hover', {
        fill: am5.color(HOVER_COLOR),
      });
      groupedCountries[
        `${region.name}`
      ].chartAction.mapPolygons.template.setAll({
        cursorOverStyle: 'pointer',
      });
      if (!this.getIsMobile() && !this.getIsTablet()) {
        this.fillTooltipCountries(
          HOVER_COLOR,
          region,
          CURRENT_LEVEL,
          groupedCountries,
          region.name
        );
      }
    }

    const eventFunction = (event) => {
      const { target } = event || {};
      const { dataItem } = target || {};

      this.funcOps(dataItem, polygonSeries, groupedCountries, region);
    };

    if (this.isMapInteractive) {
      this.addPointOverEventHandler(region.name, groupedCountries);
    }
    eventHandler.set(region.name, eventFunction);
    groupedCountries[
      `${region.name}`
    ].chartAction.mapPolygons.template.events.on('click', eventFunction);
    groupedCountries[
      `${region.name}`
    ].chartAction.mapPolygons.template.events.on(
      'pointerover',
      (regionHoverEvent) => {
        window.onclick = (clickEvent) => {
          if (clickEvent.target.id === chartTooltipDrilldonwID) {
            eventFunction(regionHoverEvent);
          }
        };
      }
    );

    return groupedCountries;
  }

  funcOps(polygonToZoom, polygonSeries, regionAction, region) {
    const regionLevel = regionAction[`${region.name}`].level;
    if (this.getIsDrillDownAvailable(regionLevel)) {
      const { latitude, longitude } = this.regionMiddleCoord(
        polygonSeries,
        region.include
      );
      const dataToShow = {
        mapData: this.data.mapData,
        mapZoom: {
          latitude,
          longitude,
        },
        mapDeepKey: createDeepKey(this.data.mapDeepKey, region),
        polygonToZoom,
      };
      const openDrillDown = this.chartBinderUtils.getReference('openDrillDown');
      openDrillDown(dataToShow);
    }
    this.handleActivateDrillUpBtn(this.chartBinderUtils, regionLevel);
  }

  hideRussia(region) {
    const russiaIndex = region.include.findIndex((iso) => iso === 'RU');
    if (russiaIndex > -1) {
      region.include.splice(russiaIndex, 1);
    }
  }

  addTooltipShift(ev, target): number | undefined {
    if (target && target.get('pointTo')?.x) {
      const CHART_WIDTH_MID = this.chart.innerWidth() / 2;
      const targetPoint = target.get('pointTo').x;
      if (targetPoint < CHART_WIDTH_MID) {
        return -8;
      } else {
        return 8;
      }
    } else {
      return ev;
    }
  }

  getTooltipSettings(HOVER_COLOR) {
    const tooltipSettings = {
      getFillFromSprite: false,
      pointerOrientation: 'vertical',
      autoTextColor: true,
      keepTargetHover: true,
    };

    const backgroundSettings = {
      fill: am5.color(HOVER_COLOR),
      fillOpacity: 1,
    };

    return { tooltipSettings, backgroundSettings };
  }

  getTooltipHTML(region, level) {
    return region.mapTooltip;
  }

  fillTooltipCountries(hoverColor, region, level, regionAction, name) {
    const { tooltipSettings, backgroundSettings } =
      this.getTooltipSettings(hoverColor);

    const tooltip = this.createTooltip(tooltipSettings, backgroundSettings);
    const tooltipHTML = this.getTooltipHTML(region, level);

    if (this.isLargeTooltips) {
      // this is needed to prevent the tooltip from flickering: https://atc.bmwgroup.net/jira/browse/DRS-5319
      tooltip.adapters.add('dx', (ev, target) =>
        this.addTooltipShift(ev, target)
      );
    }

    regionAction[`${name}`].chartAction.mapPolygons.template.set(
      'tooltipHTML',
      tooltipHTML
    );
    regionAction[`${name}`].chartAction.mapPolygons.template.set(
      'tooltip',
      tooltip
    );
  }

  addPointOverEventHandler(groupName: string, countriesGroupedByColor) {
    countriesGroupedByColor[
      `${groupName}`
    ].chartAction.mapPolygons.template.events.on('pointerover', (ev) => {
      countriesGroupedByColor[
        `${groupName}`
      ].chartAction.mapPolygons.values.forEach((item) => {
        if (
          countriesGroupedByColor[`${groupName}`].include
            .join(',')
            .indexOf(item['_dataItem'].dataContext.id) !== -1
        ) {
          item.hover();
          item.hideTooltip();
        }
      });
      document.body.style.cssText = 'cursor: pointer !important';
    });
    countriesGroupedByColor[
      `${groupName}`
    ].chartAction.mapPolygons.template.events.on('pointerout', (ev) => {
      countriesGroupedByColor[
        `${groupName}`
      ].chartAction.mapPolygons.values.forEach((item) => {
        item.unhover();
      });
    });
  }

  toggleSeries(series, serieToToggleName: string) {
    for (const bullet of series.dataItems) {
      if (bullet.dataContext['name'] === serieToToggleName) {
        if (bullet.isHidden()) {
          bullet.show();
        } else {
          bullet.hide();
        }
      }
    }
  }

  hideInactiveSeries(inactiveSeries: Set<string>) {
    Object.entries(this.legendItems).forEach(([key, value]) => {
      if (inactiveSeries.has(value['name'])) {
        value['chartAction'].hide();
      }
    });
    if (this.isMapBullets) {
      const bubbleSeries =
        this.chart.series.values[this.chart.series.values.length - 1];
      inactiveSeries.forEach((serieName) =>
        this.toggleSeries(bubbleSeries, serieName)
      );
    }
  }

  hideInactiveSeriesWhenCustomLegend(inactiveSeries: Set<string>) {
    const colorToHide = this.data.legend
      .filter((item) => inactiveSeries.has(item.label))
      .map((item) => item.color);
    Object.entries(this.legendItems).forEach(([key, value]) => {
      if (colorToHide.includes(value['color'])) {
        value['chartAction'].hide();
      }
    });
  }

  getLegendItemContainers(legend) {
    return;
  }

  getLegendLayoutXPosition() {
    return null;
  }

  getLegendLabelMinWidth() {
    return null;
  }

  getLegendMarkers(legend): void {
    legend.markers.template.setAll({
      width: 16,
      height: 16,
      marginTop: 30,
    });
  }

  getIsMobile() {
    return isMobile();
  }

  getIsTablet() {
    return isTablet();
  }

  // -- Logic to add circles with information to map -- //
  createBubbleBullet(level) {
    const circleTemplate: am5.Template<am5.Circle> = am5.Template.new({
      fill: am5.color(getColorFromCss('--black')),
      fillOpacity: 0.8,
      stroke: am5.color(getColorFromCss('--white')),
      strokeWidth: 1,
    });
    const bubbleSeries = this.chart.series.push(
      this.amCharts.am5maps.MapPointSeries.new(this.rootElement, {
        calculateAggregates: true,
        valueField: 'value',
        latitudeField: 'latitude',
        longitudeField: 'longitude',
      })
    );
    bubbleSeries.bullets.push(() => {
      const circle = am5.Circle.new(
        this.rootElement,
        {
          radius: 10,
          templateField: 'circleTemplate',
          // eslint-disable-next-line quotes
          tooltipText: `{name}: {percentage.formatNumber('#.')}% ({value})`,
          tooltipY: 10,
          cursorOverStyle: 'pointer',
        },
        circleTemplate
      );
      circle.events.on('click', (val) =>
        this.eventHandler.get(val.target.dataItem.dataContext['name'])()
      );
      return am5.Bullet.new(this.rootElement, {
        sprite: circle,
      });
    });

    const MIN_BUBBLE_RADIUS = this.getMinBubbleRadius(level);

    const MAX_BUBBLE_RADIUS = this.getMaxBubbleRadius();

    bubbleSeries.set('heatRules', [
      {
        target: circleTemplate,
        min: MIN_BUBBLE_RADIUS,
        max: MAX_BUBBLE_RADIUS,
        key: 'radius',
        dataField: 'value',
      },
    ]);

    bubbleSeries.bullets.push((root, series, dataItem) => {
      // eslint-disable-next-line quotes
      let text = `{name}: {percentage.formatNumber('#.')}%`;
      if (dataItem.dataContext) {
        const data = dataItem.dataContext;
        if (data['level'] === MapProductionDataLevel.MARKET) {
          // eslint-disable-next-line quotes
          text = `{percentage.formatNumber('#.')}%`;
        }
        if (
          data['level'] &&
          data['level'] === MapProductionDataLevel.SUBREGION
        ) {
          text = this.getBubbleText(data);
        }
      }

      return am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          text,
          fill: am5.color(getColorFromCss('--white')),
          fontSize: getLegendFontSize(),
          fontFamily: this.bmwFontFamily,
          populateText: true,
          centerX: am5.p50,
          centerY: am5.p50,
          textAlign: 'center',
        }),
        dynamic: true,
      });
    });

    return bubbleSeries;
  }

  getMinBubbleRadius(level) {
    if (this.getIsMobile() || this.getIsTablet()) {
      return 20;
    } else {
      if (level === MapProductionDataLevel.MARKET) {
        return 13;
      }
      return 30;
    }
  }

  getMaxBubbleRadius() {
    if (this.getIsMobile() || this.getIsTablet()) {
      return 20;
    } else {
      return 35;
    }
  }

  getBubbleText(data) {
    const MAX_STRING_LENGTH = 2;
    if (data['name'].length > MAX_STRING_LENGTH) {
      // eslint-disable-next-line quotes
      return `{percentage.formatNumber('#.')}%`;
    }
    if (this.getIsMobile() || this.getIsTablet()) {
      // eslint-disable-next-line quotes
      return `{name}:\n{percentage.formatNumber('#.')}%`;
    } else {
      // eslint-disable-next-line quotes
      return `{name}: {percentage.formatNumber('#.')}%`;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Radius of the Earth in kilometers
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  calculateZoomLevel(distance, minZoom, maxZoom) {
    const zoomLevel = maxZoom - distance / (maxZoom - minZoom);
    return Math.max(minZoom, Math.min(maxZoom, zoomLevel));
  }

  getZoomCalculatedValue(countriesCoord, screenValue) {
    const MIN_COUNTRIES_NUMBER = 1;
    const MAX_ZOOM_VALUE = 10;
    const MIN_ZOOM_VALUE = 1;
    if (countriesCoord.length >= MIN_COUNTRIES_NUMBER) {
      const maxLatitude = Math.max(...countriesCoord.map((el) => el.latitude));
      const minLatitude = Math.min(...countriesCoord.map((el) => el.latitude));
      const maxLongitude = Math.max(
        ...countriesCoord.map((el) => el.longitude)
      );
      const minLongitude = Math.min(
        ...countriesCoord.map((el) => el.longitude)
      );
      const longestDistance = this.calculateDistance(
        maxLatitude,
        maxLongitude,
        minLatitude,
        minLongitude
      );
      const SCREEN_DISTANCE_VALUE = longestDistance / screenValue;
      const zoomLevel = this.calculateZoomLevel(
        SCREEN_DISTANCE_VALUE,
        MIN_ZOOM_VALUE,
        MAX_ZOOM_VALUE
      ).toFixed(2);
      return Number(zoomLevel);
    } else {
      return 1;
    }
  }
}
