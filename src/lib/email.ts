/**
 * Shared email normalization for auth. Postgres's unique constraint on
 * User.email is case-sensitive, and NextAuth's Credentials `authorize`
 * looks users up by exact string — without normalizing both write
 * (registration) and read (login) paths the same way, a user who signs up
 * as "Foo@Example.com" can fail to log back in with different casing or
 * incidental whitespace.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
