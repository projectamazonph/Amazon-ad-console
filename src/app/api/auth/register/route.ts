import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeEmail } from '@/lib/email';
import { Prisma } from '@/generated/prisma/client';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Enter a valid email address' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Case-insensitive check so a legacy mixed-case row (from before email
    // normalization) still counts as a duplicate — the DB's unique
    // constraint is case-sensitive and wouldn't catch it on its own.
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // The findFirst check above and this create() aren't atomic, so a
    // concurrent registration with the same normalized email can still
    // slip past it and hit the DB's unique constraint here. Treat that
    // race the same as the check finding it first, rather than letting it
    // fall through to the generic 500 below.
    try {
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split('@')[0],
          passwordHash,
        },
      });

      return NextResponse.json(
        { message: 'User created', userId: user.id },
        { status: 201 }
      );
    } catch (createError) {
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
      throw createError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
