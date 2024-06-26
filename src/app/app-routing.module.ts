import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesReachTooltipDefectComponent } from './chart-parent-component/sales-reach-tooltip-defect/sales-reach-tooltip-defect.component';
import { TooltipDefectComponent } from './tooltip-defect/tooltip-defect.component';
import { TooltipDefectMapComponent } from './tooltip-defect-map/tooltip-defect-map.component';

const routes: Routes = [
  {
    path: 'sales-reach',
    pathMatch: 'full',
    component: SalesReachTooltipDefectComponent
  },
  {
    path: 'tooltip-flickering',
    pathMatch: 'full',
    component: TooltipDefectComponent
  },
  {
    path: 'tooltip-flickering-map',
    pathMatch: 'full',
    component: TooltipDefectMapComponent
  },
  { path: 'landing', pathMatch: 'full', redirectTo: 'tooltip-flickering' },
  { path: '**', pathMatch: 'full', redirectTo: 'tooltip-flickering' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
