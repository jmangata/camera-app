"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../validators/auth");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['MODERATOR', 'ADMIN']), async (req, res) => {
    try {
        const { status } = req.query;
        const reports = await prisma_1.prisma.report.findMany({
            where: { ...(status && { status: status }) },
            include: {
                camera: { include: { category: true } },
                user: { select: { username: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const data = auth_2.reportSchema.parse(req.body);
        const existingReport = await prisma_1.prisma.report.findFirst({
            where: {
                cameraId: data.cameraId,
                userId: req.user.userId,
                status: 'PENDING',
            },
        });
        if (existingReport) {
            return res.status(400).json({ error: 'You already reported this camera' });
        }
        const report = await prisma_1.prisma.report.create({
            data: {
                reason: data.reason,
                camera: { connect: { id: data.cameraId } },
                user: { connect: { id: req.user.userId } },
            },
            include: {
                camera: { include: { category: true } },
                user: { select: { username: true } },
            },
        });
        res.status(201).json(report);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/:id/status', auth_1.authenticateToken, (0, auth_1.requireRole)(['MODERATOR', 'ADMIN']), async (req, res) => {
    try {
        const { status } = req.body;
        const report = await prisma_1.prisma.report.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                camera: { include: { category: true } },
                user: { select: { username: true } },
            },
        });
        if (status === 'RESOLVED') {
            await prisma_1.prisma.camera.update({
                where: { id: report.cameraId },
                data: { status: 'ACTIVE' },
            });
        }
        res.json(report);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map