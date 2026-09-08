import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TiktokResponse } from '../../models/tiktok.model';

@Injectable({
  providedIn: 'root'
})
export class TiktokService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://www.tikwm.com/api/';

  buscar(enlace: string): Observable<TiktokResponse> {
    const url = `${this.apiUrl}?url=${encodeURIComponent(enlace)}&hd=1`;

    return this.http.get<TiktokResponse>(url).pipe(
      catchError(() =>
        throwError(() => new Error(
          'No se pudo conectar con el servicio. Verifica tu conexión e inténtalo de nuevo.'
        ))
      )
    );
  }
}
