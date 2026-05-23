import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { io } from '../index';

const router = Router();

// GET comments for a camera
router.get('/cameras/:cameraId/comments', async (req: AuthRequest, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { cameraId: req.params.cameraId },
      include: { user: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST add comment
router.post('/cameras/:cameraId/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas être vide' });
    }
    if (content.length > 500) {
      return res.status(400).json({ error: 'Commentaire trop long (max 500 caractères)' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        camera: { connect: { id: req.params.cameraId } },
        user: { connect: { id: req.user!.userId } },
      },
      include: { user: { select: { username: true, role: true } } },
    });

    // Emit real-time event
    io.to(`camera-${req.params.cameraId}`).emit('new-comment', comment);

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE comment (own or admin)
router.delete('/cameras/:cameraId/comments/:commentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' });

    if (comment.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.comment.delete({ where: { id: req.params.commentId } });
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
