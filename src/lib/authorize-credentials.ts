/**
 * Credentials-login lookup logic, kept free of any next-auth import so it
 * can be unit tested directly — importing next-auth itself pulls in
 * next/server, which isn't available in the Vitest/jsdom environment.
 */
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { normalizeEmail } from './email';

export async function authorizeCredentials(
  credentials: Partial<Record<'email' | 'password', unknown>> | undefined,
) {
  if (
    typeof credentials?.email !== 'string' ||
    typeof credentials?.password !== 'string'
  ) {
    return null;
  }

  const normalizedEmail = normalizeEmail(credentials.email);

  // Case-insensitive lookup so accounts registered before email
  // normalization (potentially stored with mixed casing) can still log in.
  // If more than one row matches case-insensitively — a legacy data
  // anomaly the case-sensitive unique constraint didn't prevent — fail
  // closed rather than silently picking one account.
  const matches = await prisma.user.findMany({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });

  if (matches.length === 0) {
    return null;
  }
  if (matches.length > 1) {
    console.error(
      '[auth] multiple users matched email case-insensitively; refusing to pick one',
      { userIds: matches.map((u) => u.id) },
    );
    return null;
  }

  const [user] = matches;

  const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
