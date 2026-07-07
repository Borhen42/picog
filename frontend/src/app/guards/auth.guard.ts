import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Allows the route only when the user is authenticated.
 * If not logged in, redirects to the Keycloak login page.
 */
export const authGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);

  if (keycloakService.isLoggedIn()) {
    return true;
  }

  keycloakService.login();
  return false;
};
