import { Root } from '@amcharts/amcharts5';
import { AmCharts5ImportedModules } from './am-charts-v5.service';
import { AmChartOptions } from './data-viz-map-abstract-instance';
import { ILocaleDefault } from '@amcharts/amcharts5/.internal/core/util/Language';
import * as $utils from '@amcharts/amcharts5/.internal/core/util/Utils';

/**
 * Represents an amCharts5 chart instance used by a data viz component.
 */
export abstract class AbstractDataVizChartV5Instance<DataType> {
  protected abstract chart?: any;

  protected abstract amCharts: AmCharts5ImportedModules;
  protected abstract data: DataType;
  protected abstract chartId: string;
  protected abstract rootElement: Root;

  protected initializeChart(
    type: any = this.amCharts.am5charts?.XYChart,
    divId?: string,
    legendId?: string,
    extraOptions?: AmChartOptions
  ): void {
    const elementExists = !!document.getElementById(this.chartId);

    //Dispose of existing root.
    if (divId) {
      this.amCharts.am5core?.array.each(this.amCharts.am5core.registry.rootElements, (root) => {
        if (root?.dom.id === divId) {
          root.dispose();
        }
      });
    }
    //Dispose of existing root.
    if (legendId) {
      this.amCharts.am5core?.array.each(this.amCharts.am5core.registry.rootElements, (root) => {
        if (root?.dom.id === legendId) {
          root.dispose();
        }
      });
    }

    if (elementExists) {
      this.rootElement = this.amCharts.am5core?.Root.new(this.chartId, {
        useSafeResolution: false,
        ...type
      });
      this.chart = this.rootElement?.container.children.push(
        type.new(this.rootElement, {
          layout: this.rootElement?.verticalLayout,
          ...extraOptions
        })
      );
    }
  }

  abstract dispose(): void;

  protected initializeLocale(): void {
    this.rootElement.locale = this.amCharts.am5lang['en-US'] as Partial<ILocaleDefault>;
    this.rootElement.numberFormatter.set('numberFormat', {});
    this.rootElement.numberFormatter.set('intlLocales', 'en-US');
  }

  overrideDefaultAmChartWheelEventHandler() {
    //Fix For [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive
    //This code is a fix for MapChart._handleSetWheel in node_modules/@amcharts/amcharts5/.internal/charts/map/MapChart.js
    this.chart['_handleSetWheel'] = () => {
      const wheelX = this.chart.get('wheelX');
      const wheelY = this.chart.get('wheelY');
      const chartContainer = this.chart.chartContainer;
      // eslint-disable-next-line eqeqeq
      if (wheelX != 'none' || wheelY != 'none') {
        if (this.chart['_wheelDp']) {
          this.chart['_wheelDp'].dispose();
        }
        this.chart['_wheelDp'] = chartContainer.events.on('wheel', (event) => {
          const point = this.chart.chartContainer['_display'].toLocal(event.point);
          this.chartContainerWheelEventHandler(
            event,
            $utils.isLocalEvent(event.originalEvent, this.chart),
            wheelX,
            wheelY,
            point
          );
        });
        this.chart['_disposers'].push(this.chart['_wheelDp']);
      } else {
        if (this.chart['_wheelDp']) {
          this.chart['_wheelDp'].dispose();
        }
      }
    };
  }

  chartContainerWheelEventHandler(event, isLocalEvent, wheelX, wheelY, point) {
    const wheelEasing = this.chart.get('wheelEasing');
    const wheelSensitivity = this.chart.get('wheelSensitivity', 1);
    const wheelDuration = this.chart.get('wheelDuration', 0);
    const wheelStep = this.chart.get('wheelStep', 0.2);
    const wheelEvent = event.originalEvent;
    const shiftX = wheelEvent.deltaX / 100;
    const shiftY = wheelEvent.deltaY / 100;
    if (!isLocalEvent) {
      return;
    }
    if (wheelY === 'zoom') {
      this.chart['_handleWheelZoom'](wheelEvent.deltaY, point);
    } else if (wheelY === 'rotateY') {
      this.chart['_handleWheelRotateY'](
        (wheelEvent.deltaY / 5) * wheelSensitivity,
        wheelDuration,
        wheelEasing
      );
    } else if (wheelY === 'rotateX') {
      this.chart['_handleWheelRotateX'](
        (wheelEvent.deltaY / 5) * wheelSensitivity,
        wheelDuration,
        wheelEasing
      );
    }
    if (wheelX === 'zoom') {
      this.chart['_handleWheelZoom'](wheelEvent.deltaX, point);
    } else if (wheelX === 'rotateY') {
      this.chart['_handleWheelRotateY'](
        (wheelEvent.deltaX / 5) * wheelSensitivity,
        wheelDuration,
        wheelEasing
      );
    } else if (wheelX === 'rotateX') {
      this.chart['_handleWheelRotateX'](
        (wheelEvent.deltaX / 5) * wheelSensitivity,
        wheelDuration,
        wheelEasing
      );
    } else if (wheelX === 'panY' || wheelX === 'panXY' || wheelY === 'panY' || wheelY === 'panXY') {
      this.panYWheelEvent(shiftX, shiftY, wheelStep);
    }
  }

  panYWheelEvent(shiftX, shiftY, wheelStep): void {
    if (shiftX != 0) {
      this.chart.yAxes.each((axis) => {
        if (axis.get('panY')) {
          const start = axis.get('start');
          const end = axis.get('end');
          const delta = this.chart['_getWheelSign'](axis) * wheelStep * (end - start) * shiftX;
          let newStart = start + delta;
          let newEnd = end + delta;
          const se = this.chart['_fixWheel'](newStart, newEnd);
          newStart = se[0];
          newEnd = se[1];
          this.chart['_handleWheelAnimation'](axis.zoom(newStart, newEnd));
        }
      });
    } else if (shiftY != 0) {
      this.chart.yAxes.each((axis) => {
        if (axis.get('panY')) {
          const start = axis.get('start');
          const end = axis.get('end');
          const delta = this.chart['_getWheelSign'](axis) * wheelStep * (end - start) * shiftY;
          let newStart = start - delta;
          let newEnd = end - delta;
          const se = this.chart['_fixWheel'](newStart, newEnd);
          newStart = se[0];
          newEnd = se[1];
          this.chart['_handleWheelAnimation'](axis.zoom(newStart, newEnd));
        }
      });
    }
  }

  initializeWheelEvent() {
    this.overrideDefaultAmChartWheelEventHandler();
    this.rootElement.dom.addEventListener(
      'wheel',
      (event) => {
        this.wheelEventHandler(event, $utils.isLocalEvent(event, this.chart));
      },
      {
        capture: true,
        passive: false,
      }
    );
  }

  wheelEventHandler(event, isLocalEvent) {
    if (isLocalEvent) {
      event.preventDefault();
    }
  }

  waitForChartReadyEvent() {
    let timeout;

    this.rootElement.events.on('frameended', () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        this.rootElement.events.off('frameended');
        this.onChartReady();
      }, 100);
    });
  }

  onChartReady() {
    return;
  }

   updatePosition(currentPosition: any) {
    return currentPosition;
  }

  hideLabels() {
    return;
  }
}
