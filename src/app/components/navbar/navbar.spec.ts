import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Navbar } from './navbar';

// SE AGREGÓ provideRouter([]) A LOS PROVIDERS DE ESTE TEST PORQUE NAVBAR.HTML USA LAS
// DIRECTIVAS routerLink Y routerLinkActive, LAS CUALES NECESITAN QUE EXISTA UN ActivatedRoute
// EN EL INYECTOR DE DEPENDENCIAS. SIN ESTO, EL TEST FALLABA CON EL ERROR "NG0201: No provider
// found for ActivatedRoute" AL INTENTAR CREAR EL COMPONENTE.
describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
