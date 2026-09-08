/* import { Injectable, signal } from '@angular/core';
import { SavedItem } from '../models/saved.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageKey = 'savego_history';
  savedItems = signal<SavedItem[]>(this.cargarItems());

  private cargarItems(): SavedItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  agregarItem(item: Omit<SavedItem, 'date'>): void {
    const newItem: SavedItem = {
      ...item,
      date: new Date().toLocaleDateString()
    };
    const actualizados = [newItem, ...this.savedItems()];
    this.savedItems.set(actualizados);
    localStorage.setItem(this.storageKey, JSON.stringify(actualizados));
  }
} */
/*
import { Injectable, signal } from '@angular/core';
import { SavedItem } from '../models/saved.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageKey = 'savego_history';
  savedItems = signal<SavedItem[]>(this.cargarItems());

  private cargarItems(): SavedItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  agregarItem(item: Omit<SavedItem, 'date'>): void {
    const newItem: SavedItem = {
      ...item,
      date: new Date().toLocaleDateString()
    };
    const actualizados = [newItem, ...this.savedItems()];
    this.savedItems.set(actualizados);
    localStorage.setItem(this.storageKey, JSON.stringify(actualizados));
  }
} */

  // SE AGREGÓ isPlatformBrowser Y SE VALIDA QUE EL CÓDIGO CORRA EN EL NAVEGADOR ANTES DE TOCAR
// "localStorage". ESTE SERVICIO NO SE EJECUTABA ANTES PORQUE LA RUTA "/saved" NUNCA ERA
// ALCANZABLE (FALTABA EL <ROUTER-OUTLET> EN APP.HTML). AL CORREGIR ESO, EL BUILD CON SSR
// (SERVER-SIDE RENDERING / PRERENDER) EMPEZÓ A FALLAR CON "ReferenceError: localStorage is
// not defined" PORQUE EL SERVIDOR DE NODE NO TIENE "localStorage". CON ESTA GUARDA, EN EL
// SERVIDOR SIMPLEMENTE SE DEVUELVE UNA LISTA VACÍA Y NO SE INTENTA GUARDAR NADA.
// TAMBIÉN SE ELIMINÓ EL BLOQUE DE CÓDIGO COMENTADO DUPLICADO QUE HABÍA QUEDADO EN EL ARCHIVO.
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SavedItem } from '../models/saved.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private storageKey = 'savego_history';
  savedItems = signal<SavedItem[]>(this.cargarItems());

  private cargarItems(): SavedItem[] {
    if (!this.esNavegador) {
      return [];
    }
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  agregarItem(item: Omit<SavedItem, 'date'>): void {
    const newItem: SavedItem = {
      ...item,
      date: new Date().toLocaleDateString()
    };
    const actualizados = [newItem, ...this.savedItems()];
    this.savedItems.set(actualizados);
    if (this.esNavegador) {
      localStorage.setItem(this.storageKey, JSON.stringify(actualizados));
    }
  }
}
