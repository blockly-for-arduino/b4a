import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibManagerComponent } from './lib-manager.component';

describe('LibManagerComponent', () => {
  let component: LibManagerComponent;
  let fixture: ComponentFixture<LibManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
