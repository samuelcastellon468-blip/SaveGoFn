import { Component } from '@angular/core';

// SE AGREGÓ "standalone: true" EXPLÍCITAMENTE PARA MANTENER CONSISTENCIA CON EL RESTO DE
// COMPONENTES DE LA APP (TIKTOK, WHATSAPP, NAVBAR), QUE SÍ LO DECLARAN DE FORMA EXPLÍCITA.
@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [],
  templateUrl: './saved.html',
  styleUrl: './saved.css',
})
export class Saved {

}
