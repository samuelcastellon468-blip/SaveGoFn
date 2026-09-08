import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

// SE CORRIGIÓ ESTE TEST: BUSCABA EL TEXTO "Hello, status-saver-ios" QUE NUNCA EXISTIÓ EN LA APP
// (ERA EL TEXTO POR DEFECTO GENERADO POR EL CLI DE ANGULAR Y NUNCA SE ACTUALIZÓ). AHORA SE
// VERIFICA QUE EL COMPONENTE RAÍZ RENDERIZA EL NAVBAR CON EL TÍTULO REAL "SaveGo" Y QUE EL
// ROUTER ESTÁ DISPONIBLE (SE AGREGA provideRouter PORQUE APP.TS AHORA USA <ROUTER-OUTLET>).
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the SaveGo navbar title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('SaveGo');
  });
});
