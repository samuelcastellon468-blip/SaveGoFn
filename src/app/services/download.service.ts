import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, from } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';
import { Filesystem, Directory } from '@capacitor/filesystem';

export type TipoMedia = 'video' | 'image';

const NOMBRE_ALBUM = 'SaveGo';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private readonly http = inject(HttpClient);

  // Se guarda en memoria una vez obtenido, para no crear/consultar el álbum
  // en cada descarga.
  private albumIdCache: string | null = null;

  obtenerArchivo(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(() => throwError(() =>
        new Error('No se pudo descargar el archivo. Inténtalo de nuevo.')
      ))
    );
  }

  guardarBlob(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
  }

  guardarEnGaleria(blob: Blob, tipo: TipoMedia, nombreArchivo: string): Observable<void> {
    if (!Capacitor.isNativePlatform()) {
      this.guardarBlob(blob, nombreArchivo);
      return from(Promise.resolve());
    }

    const promesa = this.blobABase64(blob).then(async (base64) => {
      const path = `data:${blob.type};base64,${base64}`;

      const albumIdentifier = await this.obtenerIdDelAlbum();

      if (tipo === 'video') {
        await Media.saveVideo({ path, albumIdentifier });
      } else {
        await Media.savePhoto({ path, albumIdentifier });
      }
    });

    return from(promesa);
  }

  // NUEVO: usado cuando el usuario apaga el switch "Guardar directo a galería"
  // en Ajustes. En vez de guardar en la Galería del sistema (visible para otras
  // apps), copia el archivo al almacenamiento PRIVADO de la app (solo esta app
  // puede leerlo). Recibe el base64 ya leído del archivo original y el nombre
  // deseado, y devuelve el URI interno del archivo guardado (usado luego con
  // Capacitor.convertFileSrc() para poder mostrarlo en pantalla).
  async guardarSoloEnLibreria(base64: string, nombreArchivo: string): Promise<string> {
    const resultado = await Filesystem.writeFile({
      path: `SaveGo/${nombreArchivo}`,
      data: base64,
      directory: Directory.Data,
      recursive: true
    });
    return resultado.uri;
  }

  private async obtenerIdDelAlbum(): Promise<string> {
    if (this.albumIdCache) {
      return this.albumIdCache;
    }

    const resultado = await Media.getAlbums();
    const existente = resultado.albums.find((a) => a.name === NOMBRE_ALBUM);

    if (existente) {
      this.albumIdCache = existente.identifier;
      return existente.identifier;
    }

    await Media.createAlbum({ name: NOMBRE_ALBUM });
    const resultadoActualizado = await Media.getAlbums();
    const nuevoAlbum = resultadoActualizado.albums.find((a) => a.name === NOMBRE_ALBUM);

    if (!nuevoAlbum) {
      throw new Error('No se pudo crear el álbum de destino.');
    }

    this.albumIdCache = nuevoAlbum.identifier;
    return nuevoAlbum.identifier;
  }

  private blobABase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultado = reader.result as string;
        resolve(resultado.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
