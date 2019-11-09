import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormlyFieldTreeSelect } from './tree-select.type';

describe('FormlyFieldTreeSelect', () => {
  let component: FormlyFieldTreeSelect;
  let fixture: ComponentFixture<FormlyFieldTreeSelect>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormlyFieldTreeSelect ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldTreeSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
