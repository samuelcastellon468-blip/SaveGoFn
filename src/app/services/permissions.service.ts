import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';

// Definimos la forma de nuestro plugin nativo personalizado (AllFilesAccessPlugin.java)
export interface AllFilesAccessPlugin {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ opened: boolean }>;
}

const AllFilesAccess = registerPlugin<AllFilesAccessPlugin>('AllFilesAccess');

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly storageKey = 'savego_permisos_solicitados';

  // Se llama una sola vez, apenas arranca la app.
  //
  // NOTA sobre @capacitor-community/media: este plugin maneja sus propios permisos
  // de galería de forma automática e interna. No expone un método requestPermissions();
  // el diálogo del sistema aparece solo la primera vez que se llama a savePhoto()/saveVideo(),
  // así que aquí NO hace falta (ni se puede) pedirlo por adelantado.
  //
  // Lo único que sí pedimos por adelantado aquí es el permiso especial de
  // "Acceso a todos los archivos", necesario para leer los estados de WhatsApp.
  async solicitarTodosLosPermisos(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return; // En navegador web no aplica nada de esto.
    }

    const yaSolicitados = localStorage.getItem(this.storageKey);
    if (yaSolicitados) {
      return;
    }

    try {
      const estado = await AllFilesAccess.checkPermission();
      if (!estado.granted) {
        await AllFilesAccess.requestPermission();
      }
    } catch {
      // Evita romper el arranque de la app si algo falla aquí.
    }

    localStorage.setItem(this.storageKey, 'true');
  }
}