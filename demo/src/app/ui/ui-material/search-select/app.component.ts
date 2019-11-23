import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

interface User {
  key: number;
  email: string;
  name: string;
  company: string;
}

@Component({
  selector: 'formly-app-example',
  templateUrl: './app.component.html',
})
export class AppComponent {
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  users: User[] = [
    {
      key: 1,
      email: 'tester1@test.com',
      name: 'Tester1 User',
      company: 'company1'
    },
    {
      key: 2,
      email: 'tester2@test.com',
      name: 'Tester2 User',
      company: 'company1'
    },
    {
      key: 3,
      email: 'some3@test.com',
      name: 'Some Tester3',
      company: 'company2'
    }
  ];
  fields: FormlyFieldConfig[] = [
    {
      key: 'SearchSelect',
      type: 'search-select',
      templateOptions: {
        label: 'User',
        placeholder: 'Input email, name or company to match users',
        description: 'Description',
        required: true,
        options: of(this.users),
        filter: {
          fields: ['email', 'name', 'company'], // fields to match the input
          caseSensitive: false,
          startWith: true,                      // match the options which start with the input
          showAllForBlankInput: true            // show all options when input value is blank
        },
        crud: {
          detail: false,      // whether or not show detail when selecting option
          create: false,      // whether or not show "Add New" option
          update: false,      // show edit button in the detail
          fieldGroup: [],     // sub form
          save: (model: any) => {}
        },
        getValue: (option: User) => option.key,
        getText: (option: User) => 
          option ? (option.name ? option.name + " (" + option.email + ")" : option.email || '') : ''
      },
    },
  ];

  getModel() {
    return JSON.stringify(this.model);
  }
 
}
