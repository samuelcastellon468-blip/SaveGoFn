import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// NUEVO SERVICIO: centraliza los ajustes de la app que antes vivían sueltos (por ejemplo,
// el switch "Guardar directo a galería" que estaba como signal local dentro de whatsapp.ts
// y se perdía al cerrar la app). Ahora se persiste en localStorage, igual que StorageService,
// y cualquier pantalla (WhatsApp, Settings) puede leer/escribir el mismo valor.
interface AppSettings {
  guardarDirectoGaleria: boolean;
}

const CLAVE = 'savego_settings';
const VALORES_POR_DEFECTO: AppSettings = {
  guardarDirectoGaleria: true
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private readonly ajustes = signal<AppSettings>(this.cargar());

  guardarDirectoGaleria = computed(() => this.ajustes().guardarDirectoGaleria);

  // Solo informativo por ahora: dejar que el usuario elija una carpeta propia requeriría
  // el selector nativo de Android (Storage Access Framework - SAF), que todavía no está
  // implementado. Por eso acá se muestra dónde termina quedando el archivo según el switch,
  // en vez de un valor editable como en la maqueta de referencia.
  storageRoute = computed(() =>
    this.guardarDirectoGaleria()
      ? 'Galería del sistema / Álbum "SaveGo"'
      : 'Almacenamiento interno de la app / SaveGo'
  );

  alternarGuardarDirectoGaleria(): void {
    this.persistir({
      ...this.ajustes(),
      guardarDirectoGaleria: !this.ajustes().guardarDirectoGaleria
    });
  }

  private cargar(): AppSettings {
    if (!this.esNavegador) {
      return VALORES_POR_DEFECTO;
    }
    const data = localStorage.getItem(CLAVE);
    if (!data) {
      return VALORES_POR_DEFECTO;
    }
    try {
      return { ...VALORES_POR_DEFECTO, ...JSON.parse(data) };
    } catch (err) {
      console.error('ERROR AQUÍ:', err);
      return VALORES_POR_DEFECTO;
    }
  }

  private persistir(valores: AppSettings): void {
    this.ajustes.set(valores);
    if (this.esNavegador) {
      localStorage.setItem(CLAVE, JSON.stringify(valores));
    }
  }
}
