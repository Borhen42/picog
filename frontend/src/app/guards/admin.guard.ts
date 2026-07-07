import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Allows the route only for authenticated users who own the `admin` realm role.
 * - Not logged in  -> send to Keycloak login.
 * - Logged in, no admin role -> redirect to home.
 */
export const adminGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloakService.isLoggedIn()) {
    keycloakService.login();
    return false;
  }

  const roles = keycloakService.getUserRoles();
  if (roles.includes('admin')) {
    return true;
  }

  return router.createUrlTree(['/']);
};
