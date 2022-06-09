import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingManagerComponent } from './setting-manager.component';

describe('SettingManagerComponent', () => {
  let component: SettingManagerComponent;
  let fixture: ComponentFixture<SettingManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
