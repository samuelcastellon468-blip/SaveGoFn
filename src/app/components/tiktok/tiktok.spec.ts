import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tiktok } from './tiktok';

describe('Tiktok', () => {
  let component: Tiktok;
  let fixture: ComponentFixture<Tiktok>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tiktok]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tiktok);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
