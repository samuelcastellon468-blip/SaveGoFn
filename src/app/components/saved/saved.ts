import { Component, computed, inject, signal } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { SavedItem } from '../../models/saved.model';

// SE AGREGÓ "standalone: true" EXPLÍCITAMENTE PARA MANTENER CONSISTENCIA CON EL RESTO DE
// COMPONENTES DE LA APP (TIKTOK, WHATSAPP, NAVBAR), QUE SÍ LO DECLARAN DE FORMA EXPLÍCITA.
//
// CORRECCIÓN: este componente estaba vacío y "saved.html" era un placeholder estático.
// Por eso "Guardados" nunca mostraba nada, ni lo descargado de TikTok ni lo de WhatsApp,
// aunque ambos componentes SÍ llamaban correctamente a storageService.agregarItem().
// Ahora se inyecta StorageService y se expone la lista real (con filtro opcional por origen).
type Filtro = 'todos' | 'tiktok' | 'whatsapp';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [],
  templateUrl: './saved.html',
  styleUrl: './saved.css',
})
export class Saved {
  private readonly storageService = inject(StorageService);

  filtro = signal<Filtro>('todos');

  itemsFiltrados = computed<SavedItem[]>(() => {
    const items = this.storageService.savedItems();
    const filtro = this.filtro();
    if (filtro === 'todos') return items;
    return items.filter((item) => item.type === filtro);
  });

  hayItems = computed(() => this.itemsFiltrados().length > 0);

  cambiarFiltro(filtro: Filtro): void {
    this.filtro.set(filtro);
  }

  // Mismo fix que en whatsapp.ts: fuerza al WebView a pintar el primer cuadro
  // del video como miniatura en vez de dejarlo en negro.
  mostrarPrimerCuadro(event: Event): void {
    const video = event.target as HTMLVideoElement;
    try {
      video.currentTime = 0.1;
    } catch (err) {
      console.error('ERROR AQUÍ:', err);
    }
  }
}
