import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UbiIpv4InputComponent } from './ubi-ipv4-input.component';

describe('UbiIpv4InputComponent', () => {
  let component: UbiIpv4InputComponent;
  let fixture: ComponentFixture<UbiIpv4InputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UbiIpv4InputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbiIpv4InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
