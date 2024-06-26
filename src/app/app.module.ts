import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SalesReachTooltipDefectComponent } from './chart-parent-component/sales-reach-tooltip-defect/sales-reach-tooltip-defect.component';
import { TooltipDefectComponent } from './tooltip-defect/tooltip-defect.component';
import { TooltipDefectMapComponent } from './tooltip-defect-map/tooltip-defect-map.component';

@NgModule({
  declarations: [
    AppComponent,
      TooltipDefectComponent,
      SalesReachTooltipDefectComponent,
      TooltipDefectMapComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
