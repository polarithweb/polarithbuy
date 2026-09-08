// Shared administrator authentication module for all Polarith admin portals
// Books Hub, PC Builds, and Tech Accessories all share this master password.

export const ADMIN_MASTER_PASSWORD = 'PolarithWeb8825';
export const AUTH_STORAGE_KEY = 'polarith_admin_session_auth';

export function isUserAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function setAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  if (authenticated) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function verifyAdminPassword(candidate: string): boolean {
  return candidate.trim() === ADMIN_MASTER_PASSWORD;
}
