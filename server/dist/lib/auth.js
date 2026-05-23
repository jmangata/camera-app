"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("./prisma");
class AuthService {
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, 12);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    static generateToken(payload) {
        const options = { expiresIn: '7d' };
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, options);
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    static async createUser(data) {
        const hashedPassword = await this.hashPassword(data.password);
        return prisma_1.prisma.user.create({
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
    static async authenticateUser(email, password) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('User not found');
        const isValid = await this.comparePassword(password, user.password);
        if (!isValid)
            throw new Error('Invalid password');
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map