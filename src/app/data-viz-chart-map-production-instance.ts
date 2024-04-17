import { DataVizMapProduction } from './tooltip-defect-map/tooltip-defect-map.component';
import { AmCharts5ImportedModules } from './am-charts-v5.service';
import { DataVizMapAbstractInstance, MapProductionDataLevel } from './data-viz-map-abstract-instance';

export class DataVizChartMapProductionInstance extends DataVizMapAbstractInstance {
  constructor(
    readonly amCharts: AmCharts5ImportedModules,
    readonly data: DataVizMapProduction,
    readonly chartId: string,
  ) {
    super(amCharts, data, chartId);
  }

  updateActiveSeriesStatus() {}

  onLegendToggled(bulletSeries, ev, regionAction) {}

  drillUpAction(regionAction, polygonSeries, legend, regionBubble) {}

  getMapDeepKeyInDrillUpLevel(level: string, key: string) {
    let newKey = key;
    if (level.toUpperCase() === 'SUBREGION') {
      newKey = key.includes('$') ? key.split('$')[0] : key;
    } else if (level.toUpperCase() === 'MARKET') {
      newKey = key.includes('$') ? key.split('$')[1] : key;
    }
    return newKey;
  }

  getTooltipHTML(region, currentLevel) {
    const regionName =
      currentLevel === MapProductionDataLevel.MARKET ? region.name.toLowerCase() : region.name;
    let tooltipHTML = `<div style="color:white;">
                        <strong style="text-transform: capitalize;">${regionName}`;

    if (currentLevel !== MapProductionDataLevel.MARKET) {
      // eslint-disable-next-line quotes
      tooltipHTML += ` - {name}`;
    }
    // eslint-disable-next-line quotes
    tooltipHTML += `</strong><div>`;
    return tooltipHTML;
  }

  onDataValidatedPerRegion(polygonSeries, region, regionAction, legend, CURRENT_LEVEL, regionBubble) {
    super.onDataValidatedPerRegion(polygonSeries, region, regionAction, legend, CURRENT_LEVEL, regionBubble);

    if (CURRENT_LEVEL === MapProductionDataLevel.REGION) {
      legend.data.push(regionAction[`${region.name}`].chartAction);
    }
  }

  pushColorGroupToLegend(legend, regionAction, CURRENT_LEVEL) {
    if (CURRENT_LEVEL === MapProductionDataLevel.SUBREGION) {
      legend.data.push(regionAction);
    }
  }

  getIsDrillDownAvailable(regionLevel) {
    return regionLevel !== MapProductionDataLevel.MARKET;
  }

  handleActivateDrillUpBtn(chartBinderUtils, regionLevel) {
    if (regionLevel === MapProductionDataLevel.SUBREGION) {
      try {
        const activateDrillUpBtn = chartBinderUtils.getReference('activateDrillUpBtn');
        activateDrillUpBtn(false);
      } catch (unused) {}
    }
  }

  beforeChartInit() {
    this.isMapBullets = false;
  }
}
