import { Component, inject, signal } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  readonly settingsService = inject(SettingsService);

  mostrarPrivacidad = signal(false);

  alternarPrivacidad(): void {
    this.mostrarPrivacidad.update((valor) => !valor);
  }
}
