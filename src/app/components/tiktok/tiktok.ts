/* import { Component } from '@angular/core';

@Component({
  selector: 'app-tiktok',
  imports: [],
  templateUrl: './tiktok.html',
  styleUrl: './tiktok.css',
})
export class Tiktok {
}  */

import { Component, signal, computed, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TiktokService } from '../../services/tiktok.service';
import { DownloadService } from '../../services/download.service';
import { StorageService } from '../../services/storage.service';
import { TiktokVideoData } from '../../../models/tiktok.model';

type EstadoBusqueda =
  | { fase: 'inactivo' }
  | { fase: 'buscando' }
  | { fase: 'encontrado'; video: TiktokVideoData }
  | { fase: 'error'; mensaje: string };

type EstadoDescarga = 'inactivo' | 'descargando' | 'completada' | 'error';

@Component({
  selector: 'app-tiktok',
  standalone: true,
  templateUrl: './tiktok.html',
  styleUrl: './tiktok.css'
})
export class Tiktok {
  private readonly tiktokService = inject(TiktokService);
  private readonly downloadService = inject(DownloadService);
  private readonly storageService = inject(StorageService);

  private busquedaSub?: Subscription;
  private descargaSub?: Subscription;

  estadoBusqueda = signal<EstadoBusqueda>({ fase: 'inactivo' });
  estadoDescarga = signal<EstadoDescarga>('inactivo');

  buscando = computed(() => this.estadoBusqueda().fase === 'buscando');

  video = computed(() => {
    const estado = this.estadoBusqueda();
    return estado.fase === 'encontrado' ? estado.video : null;
  });

  mensajeError = computed(() => {
    const estado = this.estadoBusqueda();
    return estado.fase === 'error' ? estado.mensaje : null;
  });

  descargando = computed(() => this.estadoDescarga() === 'descargando');
  descargaCompletada = computed(() => this.estadoDescarga() === 'completada');

  buscarVideo(enlaceCrudo: string): void {
    const enlace = enlaceCrudo.trim();

    if (!enlace) {
      this.estadoBusqueda.set({ fase: 'error', mensaje: 'Por favor, pega un enlace.' });
      return;
    }

    if (!this.esEnlaceDeTiktok(enlace)) {
      this.estadoBusqueda.set({
        fase: 'error',
        mensaje: 'El enlace no parece ser de TikTok. Verifícalo e inténtalo de nuevo.'
      });
      return;
    }

    this.busquedaSub?.unsubscribe();

    this.estadoDescarga.set('inactivo');
    this.estadoBusqueda.set({ fase: 'buscando' });

    this.busquedaSub = this.tiktokService.buscar(enlace).subscribe({
      next: (respuesta) => {
        if (respuesta.code === 0 && respuesta.data?.play) {
          this.estadoBusqueda.set({ fase: 'encontrado', video: respuesta.data });
        } else {
          this.estadoBusqueda.set({
            fase: 'error',
            mensaje: 'No pudimos obtener el video. Verifica el enlace e inténtalo nuevamente.'
          });
        }
      },
      error: (err: Error) => {
        this.estadoBusqueda.set({ fase: 'error', mensaje: err.message });
      }
    });
  }

  descargarArchivo(): void {
    const video = this.video();
    if (!video) return;

    this.descargaSub?.unsubscribe();
    this.estadoDescarga.set('descargando');

    this.descargaSub = this.downloadService.obtenerArchivo(video.play).subscribe({
      next: (blob) => {
        // SE CAMBIÓ guardarBlob() POR guardarEnGaleria() PARA QUE EL VIDEO QUEDE DIRECTO EN LA
        // GALERÍA DEL TELÉFONO EN LA APP NATIVA ANDROID (Y COMO DESCARGA NORMAL SI SE PRUEBA EN NAVEGADOR).
        this.downloadService.guardarEnGaleria(blob, 'video', `tiktok-${video.id}.mp4`).subscribe({
          next: () => {
            this.estadoDescarga.set('completada');
            // "GUARDADOS" ES SOLO UNA PANTALLA DE CONSULTA: AQUÍ SE REGISTRA EL TÍTULO/MINIATURA/FECHA
            // PARA PODER VERLO EN LA APP, PERO EL ARCHIVO REAL YA QUEDÓ GUARDADO EN LA GALERÍA ARRIBA.
            this.storageService.agregarItem({
              id: video.id,
              title: video.title || 'Video de TikTok',
              type: 'tiktok',
              mediaType: 'video',
              url: video.play,
              thumbnail: video.cover
            });
          },
          error: () => {
            this.estadoDescarga.set('error');
          }
        });
      },
      error: () => {
        this.estadoDescarga.set('error');
      }
    });
  }

  formatearDuracion(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const resto = Math.floor(segundos % 60).toString().padStart(2, '0');
    return `${minutos}:${resto}`;
  }

  private esEnlaceDeTiktok(enlace: string): boolean {
    return /tiktok\.com/i.test(enlace);
  }
}
