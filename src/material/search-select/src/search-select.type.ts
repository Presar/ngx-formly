import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatAutocomplete, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { FieldType } from '@ngx-formly/material';
import { isObservable, Observable, of } from "rxjs";
import { map, startWith, switchMap } from "rxjs/operators";

@Component({
  selector: 'formly-field-mat-search-select',
  templateUrl: 'search-select.html',
  styleUrls: ['search-select.scss']
})
export class FormlyFieldSearchSelect extends FieldType implements OnInit {
  @ViewChild('optionInput') optionInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocomplete') autocomplete: MatAutocomplete;

  options$: Observable<any>;
  selectedOption: string = null;

  defaultOptions = {
    templateOptions: {
      placeholder: 'Input to get matched options',
      options: of([]),
      filter: {
        trim: true,                       // trim the input
        caseSensitive: false,
        startWith: true,                  // match the options which start with the input
        showAllForBlankInput: true        // show all options when input value is blank
      },
      getValue: (option: any) => option,  // the function to get the value to save to the form
      getText: (option: any) => option    // the function to get text to show as option text
    },
  };
   
  get type() {
    return this.to.type || 'search-select';
  }

  ngOnInit() {
    super.ngOnInit();

    this.options$ = this.formControl.valueChanges
      .pipe(
        startWith(''),
        switchMap(value => 
          this.filterOptions(value)),
      );
  }

  private matchString = (fieldValueString: string, inputString: string): boolean => {
    if (this.to.filter.caseSensitive) {
      fieldValueString = fieldValueString.toLowerCase();
      inputString = inputString.toLowerCase();
    }
    const index = fieldValueString.indexOf(inputString);
    return this.to.filter.startWith ? index === 0 : index >= 0;
  };

  private matchOption = (option: any, input: any): boolean => {
    if (typeof input !== 'string') {
      return option === input;
    }

    const fields: string[] = this.to.filter.fields;
    if (!fields || fields.length <= 0) {
      return this.matchString(option + '', input);
    }

    for (const field of fields) {
      const matchField = this.matchString(option[field] + '', input);
      if (matchField) {
        return true;
      }
    }
    return false;
  };

  private filterOptions(input: any): Observable<any[]> {
    if (input === undefined || input === null || input === '') {
      return of([]);
    }

    if (this.to.options &&　isObservable(this.to.options)) {
      return this.to.options.pipe(
        map(options => 
          options ? options.filter(option => this.matchOption(option, input)) : [])
      );
    } else {
      return of(this.to.options ? (this.to.options as any[]).filter(option => this.matchOption(option, input)) : []);
    }    
  };

  displayWith = (option: any) => {
    return option ? this.to.getText(option) : '';
  };

  clear(): void {
    this.optionInput.nativeElement.value = '';
    if (this.selectedOption === null) {
      this.formControl.setValue(null);
    }
  }

  remove(): void {
    this.selectedOption = null;
    this.formControl.setValue(null);
    this.optionInput.nativeElement.value = '';
    this.optionInput.nativeElement.focus();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedOption = event.option.viewValue;
    this.optionInput.nativeElement.value = '';
  }
}