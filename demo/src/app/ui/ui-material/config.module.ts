import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { ExamplesRouterViewerComponent } from '../../shared';
import { CommonExampleComponents, CommonExampleConfigs, CommonModule, debugFields } from '../common';
import { AutocompleteAppComponent, AutocompleteAppModule, AutocompleteExampleConfig } from './autocomplete';
import { DatepickerAppComponent, DatepickerAppModule, DatepickerExampleConfig } from './datepicker';
import { NativeSelectAppComponent, NativeSelectAppModule, NativeSelectExampleConfig } from './native-select';
import { SearchSelectAppComponent, SearchSelectAppModule, SearchSelectExampleConfig } from './search-select';
import { SliderAppComponent, SliderAppModule, SliderExampleConfig } from './slider';
import { ToggleAppComponent, ToggleAppModule, ToggleExampleConfig } from './toggle';

@NgModule({
  imports: [
    CommonModule,
    FormlyMaterialModule,
    NativeSelectAppModule,
    SearchSelectAppModule,
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
            SearchSelectExampleConfig,
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
    SearchSelectAppComponent,
    DatepickerAppComponent,
    ToggleAppComponent,
    SliderAppComponent,
    AutocompleteAppComponent,
  ],
})
export class ConfigModule { }
