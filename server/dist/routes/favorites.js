"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// GET user favorites
router.get('/favorites', auth_1.authenticateToken, async (req, res) => {
    try {
        const favorites = await prisma_1.prisma.favorite.findMany({
            where: { userId: req.user.userId },
            include: {
                camera: {
                    include: {
                        category: true,
                        addedByUser: { select: { username: true } },
                        _count: { select: { reports: true, comments: true, favorites: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(favorites.map(f => f.camera));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST toggle favorite
router.post('/cameras/:cameraId/favorite', auth_1.authenticateToken, async (req, res) => {
    try {
        const existing = await prisma_1.prisma.favorite.findFirst({
            where: { cameraId: req.params.cameraId, userId: req.user.userId },
        });
        if (existing) {
            await prisma_1.prisma.favorite.delete({ where: { id: existing.id } });
            return res.json({ favorited: false });
        }
        await prisma_1.prisma.favorite.create({
            data: {
                camera: { connect: { id: req.params.cameraId } },
                user: { connect: { id: req.user.userId } },
            },
        });
        res.json({ favorited: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// GET check if camera is favorited
router.get('/cameras/:cameraId/favorite', auth_1.authenticateToken, async (req, res) => {
    try {
        const existing = await prisma_1.prisma.favorite.findFirst({
            where: { cameraId: req.params.cameraId, userId: req.user.userId },
        });
        res.json({ favorited: !!existing });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=favorites.js.map