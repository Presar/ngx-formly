import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormlyFieldSearchSelect } from './search-select.type';

describe('FormlyFieldSearchSelect', () => {
  let component: FormlyFieldSearchSelect;
  let fixture: ComponentFixture<FormlyFieldSearchSelect>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormlyFieldSearchSelect ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldSearchSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
