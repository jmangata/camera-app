"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/users', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                _count: { select: { cameras: true, reports: true, comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put('/users/:id/role', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const { role } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, email: true, username: true, role: true, createdAt: true },
        });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// GET pending cameras for moderation
router.get('/cameras/pending', auth_1.authenticateToken, (0, auth_1.requireRole)(['MODERATOR', 'ADMIN']), async (req, res) => {
    try {
        const cameras = await prisma_1.prisma.camera.findMany({
            where: { status: 'PENDING' },
            include: {
                category: true,
                addedByUser: { select: { username: true, email: true } },
                _count: { select: { reports: true, comments: true, favorites: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(cameras);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH camera status
router.patch('/cameras/:id/status', auth_1.authenticateToken, (0, auth_1.requireRole)(['MODERATOR', 'ADMIN']), async (req, res) => {
    try {
        const { status } = req.body;
        const camera = await prisma_1.prisma.camera.update({
            where: { id: req.params.id },
            data: { status },
            include: { category: true, addedByUser: { select: { username: true } } },
        });
        res.json(camera);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE camera (admin)
router.delete('/cameras/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        await prisma_1.prisma.camera.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Stats accessible to MODERATOR too
router.get('/stats', auth_1.authenticateToken, (0, auth_1.requireRole)(['MODERATOR', 'ADMIN']), async (req, res) => {
    try {
        const [totalCameras, activeCameras, totalUsers, totalReports, pendingReports, totalCategories, pendingCameras] = await Promise.all([
            prisma_1.prisma.camera.count(),
            prisma_1.prisma.camera.count({ where: { status: 'ACTIVE' } }),
            prisma_1.prisma.user.count(),
            prisma_1.prisma.report.count(),
            prisma_1.prisma.report.count({ where: { status: 'PENDING' } }),
            prisma_1.prisma.category.count(),
            prisma_1.prisma.camera.count({ where: { status: 'PENDING' } }),
        ]);
        const recentCameras = await prisma_1.prisma.camera.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                addedByUser: { select: { username: true } },
            },
        });
        const camerasByCategory = await prisma_1.prisma.category.findMany({
            include: { _count: { select: { cameras: true } } },
        });
        res.json({
            overview: { totalCameras, activeCameras, totalUsers, totalReports, pendingReports, totalCategories, pendingCameras },
            recentCameras,
            camerasByCategory,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map