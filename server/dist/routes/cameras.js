"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../validators/auth");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { category, status, lat, lng, radius } = req.query;
        const cameras = await prisma_1.prisma.camera.findMany({
            where: {
                ...(category && { categoryId: category }),
                ...(status && { status: status }),
            },
            include: {
                category: true,
                addedByUser: { select: { username: true } },
                _count: { select: { reports: true, comments: true, favorites: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (lat && lng && radius) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const searchRadius = parseFloat(radius);
            const filtered = cameras.filter((camera) => {
                const distance = calculateDistance(userLat, userLng, camera.latitude, camera.longitude);
                return distance <= searchRadius;
            });
            return res.json(filtered);
        }
        res.json(cameras);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const camera = await prisma_1.prisma.camera.findUnique({
            where: { id: req.params.id },
            include: {
                category: true,
                addedByUser: { select: { username: true } },
                comments: {
                    include: { user: { select: { username: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { reports: true, favorites: true } },
            },
        });
        if (!camera)
            return res.status(404).json({ error: 'Camera not found' });
        res.json(camera);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const data = auth_2.cameraSchema.parse(req.body);
        const camera = await prisma_1.prisma.camera.create({
            data: {
                name: data.name,
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                imageUrl: data.imageUrl,
                streamUrl: data.streamUrl,
                source: data.source,
                category: { connect: { id: data.categoryId } },
                addedByUser: { connect: { id: req.user.userId } },
            },
            include: {
                category: true,
                addedByUser: { select: { username: true } },
            },
        });
        res.status(201).json(camera);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const data = auth_2.cameraSchema.parse(req.body);
        const camera = await prisma_1.prisma.camera.update({
            where: { id: req.params.id },
            data: {
                name: data.name,
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                imageUrl: data.imageUrl,
                streamUrl: data.streamUrl,
                source: data.source,
                category: { connect: { id: data.categoryId } },
            },
            include: {
                category: true,
                addedByUser: { select: { username: true } },
            },
        });
        res.json(camera);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        await prisma_1.prisma.camera.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
exports.default = router;
//# sourceMappingURL=cameras.js.map