import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataVizHeatmapEntry } from '../tooltip-defect/tooltip-defect.component';
import { MapPolygon } from '@amcharts/amcharts5/map';
import { AbstractDataVizChartV5Instance } from '../abstract-data-viz-chart-v5-instance';
import { AmCharts5Service } from '../am-charts-v5.service';
import { DataVizChartMapProductionInstance } from '../data-viz-chart-map-production-instance';
import * as data from './data.json';
export interface Legend {
  label: string;
  color: string;
}

export interface DataVizMapProduction {
  mapData: {
    include: string[];
    name: string;
    color: string;
    value: number;
    latitude?: number;
    longitude?: number;
    level?: string;
    data?: any[];
    percentage?: string;
  }[];
  mapZoom?: {
    latitude?: number;
    longitude?: number;
  };
  mapDeepKey?: string;
  legend?: Legend[];
  countriesPerCategory?: { [key: string]: string[] };
  selectedSeries?: DataVizHeatmapEntry;
  seriesData?: DataVizHeatmapEntry[];
  polygonToZoom?: MapPolygon;
}

@Component({
  selector: 'app-tooltip-defect-map',
  templateUrl: './tooltip-defect-map.component.html',
  styleUrls: ['./tooltip-defect-map.component.scss']
})
export class TooltipDefectMapComponent implements OnDestroy, OnInit {
  chartId = 'test-chart';
  chartInstance!: AbstractDataVizChartV5Instance<any>;

  constructor(private amChartsService: AmCharts5Service) {}

  ngOnInit() {
   this.amChartsService.modulesV5.subscribe(modulesV5 => {
      this.chartInstance = new DataVizChartMapProductionInstance(
        modulesV5,
        data as DataVizMapProduction,
        this.chartId,
      );
    });
  }

  ngOnDestroy(): void {
    this.chartInstance.dispose();
  }
}