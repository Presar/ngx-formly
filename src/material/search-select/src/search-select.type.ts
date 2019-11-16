import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: 'formly-field-mat-search-select',
  templateUrl: 'search-select.html',
  styleUrls: ['search-select.scss']
})
export class FormlyFieldSearchSelect extends FieldType {
  defaultOptions = {
    templateOptions: {
      hideFieldUnderline: true,
      floatLabel: 'always',
      options: [],
      selectable: true
    },
  };
  
  get type() {
    return this.to.type || 'search-select';
  }


  constructor() {
    super();

  }
  
}