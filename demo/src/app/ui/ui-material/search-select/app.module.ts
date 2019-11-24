import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { FormlyMatSearchSelectModule } from '@ngx-formly/material/search-select';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
    }),

    FormlyMatSearchSelectModule,
  ],
  declarations: [
    AppComponent,
  ],
})
export class AppModule { }
