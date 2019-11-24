import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyForm, FormlyModule } from '@ngx-formly/core';
import { of } from 'rxjs';
import { createGenericTestComponent } from '../../../core/src/lib/test-utils';
import { FormlyFieldSearchSelect } from './search-select.type';

interface User {
  key: number;
  email: string;
  name: string;
  company: string;
}

const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

let testComponentInputs;
let overlayContainerElement: HTMLElement;

describe('ui-material: FormlyFieldSearchSelect Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, FormlyFieldSearchSelect],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        MatAutocompleteModule,
        FormlyModule.forRoot({
          types: [
            {
              name: 'search-select',
              component: FormlyFieldSearchSelect,
            },
          ],
        }),
      ],
    }).compileComponents();
  });


  describe('object options', () => {
    beforeEach(() => {
      testComponentInputs = {
        form: new FormGroup({}),
        options: {},
        model: {},
      };

      const users: User[] = [
        {
          key: 1,
          email: 'tester1@test.com',
          name: 'Tester1 User',
          company: 'company1',
        },
        {
          key: 2,
          email: 'tester2@test.com',
          name: 'Tester2 User',
          company: 'company1',
        },
        {
          key: 3,
          email: 'some3@test.com',
          name: 'Some Tester3',
          company: 'company2',
        },
      ];

      testComponentInputs.fields = [{
        key: 'userObject',
        type: 'search-select',
        templateOptions: {
          label: 'User',
          placeholder: 'Input email, name or company to match users',
          description: 'Description',
          required: true,
          options: of(users),
          filter: {
            // fields to match the input
            fields: ['email', 'name', 'company'],
            caseSensitive: false,
            // match the options which start with the input
            startWith: true,
            // show all options when input value is blank
            showAllForBlankInput: true,
          },

          getValue: (option: User) => option,
          getLabel: (option: User) =>
            option ? (option.name ? option.name + ' (' + option.email + ')' : option.email || '') : '',
        },
      }];
    });

    it('should show the existing model as the initial value', () => {
      testComponentInputs.model = {
        'userObject': {
          key: 2,
          email: 'tester2@test.com',
          name: 'Tester2 User',
          company: 'company1',
        }
      };
      const fixture = createTestComponent('<formly-form [form]="form" [fields]="fields" [model]="model" [options]="options"></formly-form>');

      fixture.detectChanges();

      const selectedOption = fixture.debugElement.queryAll(By.css('mat-chip'));

      expect(selectedOption.length).toEqual(1);
      expect(selectedOption[0].nativeElement.innerHTML).toContain('Tester2 User');
      expect(selectedOption[0].nativeElement.innerHTML).toContain('tester2@test.com');

      // After clicking delete button in the selectedOption
      const deleteButton = selectedOption[0].nativeNode.childNodes[1];
      deleteButton.click();
      fixture.detectChanges();

      expect(testComponentInputs.form.get('userObject').value).toBeNull();
    });

    it('should show the matched options', () => {
      testComponentInputs.model = {};
      const fixture = createTestComponent('<formly-form [form]="form" [fields]="fields" [model]="model" [options]="options"></formly-form>');

      fixture.detectChanges();

      inject([OverlayContainer], (oc: OverlayContainer) => {
        overlayContainerElement = oc.getContainerElement();
      })();

      // Get the input element, and input string "T"
      const chipList = fixture.debugElement.queryAll(By.css('mat-chip-list'));
      const inputElement = chipList[0].nativeNode.childNodes[0].childNodes[1];
      inputElement.dispatchEvent(new Event('focusin'));
      inputElement.value = 'T';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const matOptions = overlayContainerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
      expect(matOptions.length).toBe(2, 'Expect to have the options listed out.');
    });
  });

});

@Component({ selector: 'formly-form-test', template: '', entryComponents: [] })
class TestComponent {
  @ViewChild(FormlyForm) formlyForm: FormlyForm;

  fields = testComponentInputs.fields;
  form: FormGroup = testComponentInputs.form;
  model = testComponentInputs.model || {};
  options = testComponentInputs.options;
};