import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyTreeNodeData } from 'src/material/tree-select';
import { of } from 'rxjs';

@Component({
  selector: 'formly-app-example',
  templateUrl: './app.component.html',
})
export class AppComponent {
  getModelString() {
    return JSON.stringify(this.model);
  }

  form = new FormGroup({});
  // model is the nodes selected till the leaves
  model: FormlyTreeNodeData = {
    Groceries: {
      'Almond Meal flour': null,
      Fruits: {
        Apple: null,
        Berries: ['Blueberry']
      }
    },
    Reminders: [
      'Cook dinner'
    ]
  };
  treeOption: FormlyTreeNodeData = {
    Groceries: {
      'Almond Meal flour': null,
      'Organic eggs': null,
      'Protein Powder': null,
      Fruits: {
        Apple: null,
        Berries: ['Blueberry', 'Raspberry'],
        Orange: null
      }
    },
    Reminders: [
      'Cook dinner',
      'Read the Material Design spec',
      'Upgrade Application to Angular'
    ]
  };
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'TreeSelect',
      type: 'tree-select',
      templateOptions: {
        label: 'Tree Select',
        placeholder: 'Placeholder',
        description: 'Description',        
        // options can be of([this.treeOption]) or [this.treeOption]
        options: of([this.treeOption]),
      },
    },
  ];
}
