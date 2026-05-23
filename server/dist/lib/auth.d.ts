export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
export declare class AuthService {
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(payload: JWTPayload): string;
    static verifyToken(token: string): JWTPayload;
    static createUser(data: {
        email: string;
        username: string;
        password: string;
        role?: 'USER' | 'MODERATOR' | 'ADMIN';
    }): Promise<{
        id: string;
        email: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    static authenticateUser(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
}
//# sourceMappingURL=auth.d.ts.map