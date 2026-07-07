import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}

  login(): void {
    this.keycloakService.login();
  }

  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }

  isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  getUsername(): string {
    return this.keycloakService.getUsername();
  }

  hasRole(role: string): boolean {
    return this.keycloakService.getUserRoles().includes(role);
  }

  /** Opens the Keycloak account management console in the current tab. */
  manageAccount(): void {
    this.keycloakService.getKeycloakInstance().accountManagement();
  }
}
