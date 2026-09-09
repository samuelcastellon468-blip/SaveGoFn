import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { DownloadService } from '../../services/download.service';
import { StorageService } from '../../services/storage.service';
import { MediaType } from '../../models/saved.model';

// Mismo plugin nativo que ya usamos en permissions.service.ts
interface AllFilesAccessPlugin {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ opened: boolean }>;
}
const AllFilesAccess = registerPlugin<AllFilesAccessPlugin>('AllFilesAccess');

interface EstadoWhatsapp {
  nombre: string;
  rutaCompleta: string;
  tipo: MediaType;
  urlVisualizacion: string;
}

type EstadoPermiso = 'verificando' | 'concedido' | 'denegado' | 'no-soportado';

// Rutas típicas donde Android/WhatsApp guarda los estados. Se revisan todas;
// las que no existan en el dispositivo (ej. no tiene WhatsApp Business) se ignoran.
const CARPETAS_CANDIDATAS = [
  '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses',
  '/storage/emulated/0/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses',
  '/storage/emulated/0/WhatsApp/Media/.Statuses',
  '/storage/emulated/0/WhatsApp Business/Media/.Statuses'
];

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  templateUrl: './whatsapp.html',
  styleUrl: './whatsapp.css'
})
export class Whatsapp implements OnInit {
  private readonly downloadService = inject(DownloadService);
  private readonly storageService = inject(StorageService);

  permiso = signal<EstadoPermiso>('verificando');
  cargando = signal(false);
  estados = signal<EstadoWhatsapp[]>([]);
  guardando = signal<string | null>(null);
  guardados = signal<Set<string>>(new Set());

  hayEstados = computed(() => this.estados().length > 0);

  async ngOnInit(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.permiso.set('no-soportado');
      return;
    }
    await this.verificarPermisoYCargar();
  }

  async verificarPermisoYCargar(): Promise<void> {
    this.permiso.set('verificando');
    try {
      const estado = await AllFilesAccess.checkPermission();
      if (estado.granted) {
        this.permiso.set('concedido');
        await this.cargarEstados();
      } else {
        this.permiso.set('denegado');
      }
    } catch (err) {
  console.error('ERROR AQUÍ:', err);
      this.permiso.set('no-soportado');
    }
  }

  async pedirPermiso(): Promise<void> {
    await AllFilesAccess.requestPermission();
    // El usuario será enviado a Ajustes. Cuando vuelva, debe presionar
    // el botón "Ya lo activé, verificar" para que revisemos otra vez.
  }

  async cargarEstados(): Promise<void> {
    this.cargando.set(true);
    const encontrados: EstadoWhatsapp[] = [];

    for (const carpeta of CARPETAS_CANDIDATAS) {
      try {
        const resultado = await Filesystem.readdir({ path: carpeta });
        for (const archivo of resultado.files) {
          if (archivo.type !== 'file') continue;
          const tipo = this.tipoDeArchivo(archivo.name);
          if (!tipo) continue;

          const rutaCompleta = `${carpeta}/${archivo.name}`;
          encontrados.push({
            nombre: archivo.name,
            rutaCompleta,
            tipo,
            urlVisualizacion: Capacitor.convertFileSrc(rutaCompleta)
          });
        }
      } catch(err) {
  console.error('ERROR AQUÍ:', err);
        // Esta carpeta no existe en este dispositivo. Se ignora sin romper nada.
      }
    }

    this.estados.set(encontrados);
    this.cargando.set(false);
  }

  // CAMBIO: antes usábamos fetch(estado.urlVisualizacion) para leer el archivo.
  // Eso dejó de funcionar al activar "CapacitorHttp: { enabled: true }" en
  // capacitor.config.ts (necesario para que TikTok evite el bloqueo de CORS),
  // porque esa opción intercepta TODAS las llamadas fetch() de la app, incluida
  // esta, que en realidad solo necesita leer un archivo local del teléfono
  // (no es una petición de red). Ahora usamos Filesystem.readFile(), que lee
  // el archivo directamente por su ruta y no pasa por fetch/CapacitorHttp.
  async guardar(estado: EstadoWhatsapp): Promise<void> {
    this.guardando.set(estado.nombre);
    try {
      const archivo = await Filesystem.readFile({ path: estado.rutaCompleta });
      const base64 = archivo.data as string;

      const mime = estado.tipo === 'image' ? 'image/jpeg' : 'video/mp4';
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });

      await new Promise<void>((resolve, reject) => {
        this.downloadService.guardarEnGaleria(blob, estado.tipo, estado.nombre).subscribe({
          next: () => resolve(),
          error: (err) => reject(err)
        });
      });

      this.storageService.agregarItem({
        id: estado.nombre,
        title: 'Estado de WhatsApp',
        type: 'whatsapp',
        mediaType: estado.tipo,
        url: estado.urlVisualizacion,
        thumbnail: estado.tipo === 'image' ? estado.urlVisualizacion : undefined
      });

      const nuevosGuardados = new Set(this.guardados());
      nuevosGuardados.add(estado.nombre);
      this.guardados.set(nuevosGuardados);
    } catch  (err) {
  console.error('ERROR AQUÍ:', err);
      // Se podría mostrar un mensaje de error aquí si se desea en el futuro.
    } finally {
      this.guardando.set(null);
    }
  }

  yaGuardado(nombre: string): boolean {
    return this.guardados().has(nombre);
  }

  private tipoDeArchivo(nombre: string): MediaType | null {
    const ext = nombre.toLowerCase().split('.').pop() ?? '';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    if (['mp4', '3gp', 'mkv'].includes(ext)) return 'video';
    return null;
  }
}
