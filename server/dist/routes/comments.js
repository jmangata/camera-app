"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET comments for a camera
router.get('/cameras/:cameraId/comments', async (req, res) => {
    try {
        const comments = await prisma_1.prisma.comment.findMany({
            where: { cameraId: req.params.cameraId },
            include: { user: { select: { username: true, role: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST add comment
router.post('/cameras/:cameraId/comments', auth_1.authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Le commentaire ne peut pas être vide' });
        }
        if (content.length > 500) {
            return res.status(400).json({ error: 'Commentaire trop long (max 500 caractères)' });
        }
        const comment = await prisma_1.prisma.comment.create({
            data: {
                content: content.trim(),
                camera: { connect: { id: req.params.cameraId } },
                user: { connect: { id: req.user.userId } },
            },
            include: { user: { select: { username: true, role: true } } },
        });
        // Emit real-time event
        index_1.io.to(`camera-${req.params.cameraId}`).emit('new-comment', comment);
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE comment (own or admin)
router.delete('/cameras/:cameraId/comments/:commentId', auth_1.authenticateToken, async (req, res) => {
    try {
        const comment = await prisma_1.prisma.comment.findUnique({ where: { id: req.params.commentId } });
        if (!comment)
            return res.status(404).json({ error: 'Commentaire introuvable' });
        if (comment.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        await prisma_1.prisma.comment.delete({ where: { id: req.params.commentId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=comments.js.map