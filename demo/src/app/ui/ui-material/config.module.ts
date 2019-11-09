import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExamplesRouterViewerComponent } from '../../shared';
import { CommonModule, CommonExampleConfigs, CommonExampleComponents, debugFields } from '../common';
import { DatepickerAppModule, DatepickerExampleConfig, DatepickerAppComponent } from './datepicker';
import { NativeSelectAppModule, NativeSelectExampleConfig, NativeSelectAppComponent } from './native-select';
import { TreeSelectAppModule, TreeSelectExampleConfig, TreeSelectAppComponent } from './tree-select';
import { ToggleAppModule, ToggleExampleConfig, ToggleAppComponent } from './toggle';
import { SliderAppModule, SliderExampleConfig, SliderAppComponent } from './slider';
import { AutocompleteAppModule, AutocompleteExampleConfig, AutocompleteAppComponent } from './autocomplete';
import { FormlyMaterialModule } from '@ngx-formly/material';

@NgModule({
  imports: [
    CommonModule,
    FormlyMaterialModule,
    NativeSelectAppModule,
    TreeSelectAppModule,
    DatepickerAppModule,
    ToggleAppModule,
    SliderAppModule,
    AutocompleteAppModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExamplesRouterViewerComponent,
        data: {
          debugFields,
          examples: [
            ...CommonExampleConfigs,
            NativeSelectExampleConfig,
            TreeSelectExampleConfig,
            DatepickerExampleConfig,
            ToggleExampleConfig,
            SliderExampleConfig,
            AutocompleteExampleConfig,
          ],
        },
      },
    ]),
  ],
  entryComponents: [
    ...CommonExampleComponents,

    NativeSelectAppComponent,
    TreeSelectAppComponent,
    DatepickerAppComponent,
    ToggleAppComponent,
    SliderAppComponent,
    AutocompleteAppComponent,    
  ],
})
export class ConfigModule { }
