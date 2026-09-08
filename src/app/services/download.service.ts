/* import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private readonly http = inject(HttpClient);

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
} */

  // SE REESCRIBIÓ ESTE SERVICIO PARA QUE, EN LA APP NATIVA (ANDROID), EL ARCHIVO SE GUARDE
// DIRECTAMENTE EN LA GALERÍA DEL SISTEMA USANDO @capacitor-community/media, EN LUGAR DE SOLO
// DESCARGARLO COMO BLOB EN EL NAVEGADOR (LO CUAL NO GUARDA NADA EN LA GALERÍA DE UN TELÉFONO REAL).
// SE MANTIENE EL COMPORTAMIENTO ANTERIOR (BLOB + ENLACE) SOLO COMO RESPALDO CUANDO SE EJECUTA
// EN NAVEGADOR WEB (Capacitor.isNativePlatform() === false), YA QUE AHÍ NO EXISTE GALERÍA DE SISTEMA.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, from } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';

export type TipoMedia = 'video' | 'image';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private readonly http = inject(HttpClient);

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

  // NUEVO MÉTODO: guarda el archivo directamente en la Galería del sistema cuando la app
  // corre como app nativa Android. En navegador web, cae de vuelta al método anterior (descarga normal).
  guardarEnGaleria(blob: Blob, tipo: TipoMedia, nombreArchivo: string): Observable<void> {
    if (!Capacitor.isNativePlatform()) {
      this.guardarBlob(blob, nombreArchivo);
      return from(Promise.resolve());
    }

    const promesa = this.blobABase64(blob).then(async (base64) => {
      const path = `data:${blob.type};base64,${base64}`;
      if (tipo === 'video') {
        await Media.saveVideo({ path });
      } else {
        await Media.savePhoto({ path });
      }
    });

    return from(promesa);
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
