import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from './prisma';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: JWTPayload): string {
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign(payload as object, process.env.JWT_SECRET as string, options);
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
  }

  static async createUser(data: {
    email: string;
    username: string;
    password: string;
    role?: 'USER' | 'MODERATOR' | 'ADMIN';
  }) {
    const hashedPassword = await this.hashPassword(data.password);

    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        ...(data.role && { role: data.role }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('User not found');

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) throw new Error('Invalid password');

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
