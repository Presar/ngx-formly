import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-app-example',
  templateUrl: './app.component.html',
})
export class AppComponent {
  form = new FormGroup({});
  model: any = {'Permissions': {
    'user': ['manage'],
    'company': ['manage']
  }};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'Permissions',
      type: 'tree-select',
      templateOptions: {
        label: 'Group Permissions',
        placeholder: 'Placeholder',
        description: 'Description',
        options: [{
          'user': ['manage', 'group'],
          'company': ['manage', 'list'],
          'project': {
            'manage': [],
            'schedule': ['manage', 'print']
          },
          'salary': {
            'change': ['increase', 'decrease'],
            'access': ['read', 'print']
          }
        }],
      },
    },
  ];
}
