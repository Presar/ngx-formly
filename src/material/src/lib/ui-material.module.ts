import { NgModule } from '@angular/core';

import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyMatInputModule } from '@ngx-formly/material/input';
import { FormlyMatTextAreaModule } from '@ngx-formly/material/textarea';
import { FormlyMatRadioModule } from '@ngx-formly/material/radio';
import { FormlyMatCheckboxModule } from '@ngx-formly/material/checkbox';
import { FormlyMatMultiCheckboxModule } from '@ngx-formly/material/multicheckbox';
import { FormlyMatSelectModule } from '@ngx-formly/material/select';
import { FormlyMatTreeSelectModule } from '@ngx-formly/material/tree-select';

@NgModule({
  imports: [
    FormlyMatFormFieldModule,
    FormlyMatInputModule,
    FormlyMatTextAreaModule,
    FormlyMatRadioModule,
    FormlyMatCheckboxModule,
    FormlyMatMultiCheckboxModule,
    FormlyMatSelectModule,
    FormlyMatTreeSelectModule
  ],
})
export class FormlyMaterialModule {}
