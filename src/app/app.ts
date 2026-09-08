// SE REEMPLAZÓ TODA LA LÓGICA DE DESCARGA DE TIKTOK QUE ESTABA DUPLICADA AQUÍ (EN EL COMPONENTE RAÍZ)
// PORQUE ESO IMPEDÍA QUE LA APLICACIÓN USARA EL SISTEMA DE RUTAS: EL COMPONENTE APP-ROOT DEBE SER
// SOLO UNA "CARCASA" QUE MUESTRE EL NAVBAR Y EL <ROUTER-OUTLET>, DONDE ANGULAR RENDERIZA CADA PÁGINA
// (TIKTOK, WHATSAPP, GUARDADOS) SEGÚN LA RUTA ACTIVA. LA LÓGICA REAL YA EXISTE Y FUNCIONA
// CORRECTAMENTE EN src/app/components/tiktok/tiktok.ts, POR LO QUE NO SE PERDIÓ NINGUNA FUNCIONALIDAD.
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // SE AGREGARON ROUTEROUTLET Y NAVBAR A LOS IMPORTS DEL COMPONENTE PARA QUE EL TEMPLATE
  // PUEDA USAR <ROUTER-OUTLET> Y <APP-NAVBAR>, YA QUE ANTES NO ESTABAN DECLARADOS Y EL
  // ENRUTAMIENTO NUNCA SE RENDERIZABA EN PANTALLA.
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly permissionsService = inject(PermissionsService);

  constructor() {
    // Se dispara una sola vez al arrancar la app (la propia función internamente
    // evita repetirlo en aperturas futuras, usando localStorage como bandera).
    this.permissionsService.solicitarTodosLosPermisos();
  }
}