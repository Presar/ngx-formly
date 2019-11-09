import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyFieldTreeSelect } from './tree-select.type';


@NgModule({
  declarations: [FormlyFieldTreeSelect],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCheckboxModule,
    MatTreeModule,

    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'tree-select',
          component: FormlyFieldTreeSelect,
          wrappers: ['form-field'],
        },
      ],
    }),
  ],
})
export class FormlyMatTreeSelectModule { }
