// NOT a real cryptographic hash. This project uses a mock backend (per the
// coursework's "mock server for prototyping" option) instead of a real
// authentication provider, so there is nothing sensitive to protect here -
// this only needs to be deterministic enough to compare passwords locally.
// Do not reuse this approach for a real authentication system.
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 31 + password.charCodeAt(i)) >>> 0;
  }
  return `h${hash.toString(36)}_${password.length}`;
}
