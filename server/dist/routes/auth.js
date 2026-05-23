"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../lib/auth");
const auth_2 = require("../validators/auth");
const auth_3 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const data = auth_2.registerSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { username: data.username }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or username already used' });
        }
        const user = await auth_1.AuthService.createUser(data);
        const token = auth_1.AuthService.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const data = auth_2.loginSchema.parse(req.body);
        const result = await auth_1.AuthService.authenticateUser(data.email, data.password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message || 'Login failed' });
    }
});
router.get('/me', auth_3.authenticateToken, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map