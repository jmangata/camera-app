import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { reportSchema, reportStatusSchema } from '../validators/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authenticateToken, requireRole(['MODERATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const reports = await prisma.report.findMany({
      where: { ...(status && { status: status as any }) },
      include: {
        camera: { include: { category: true } },
        user: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = reportSchema.parse(req.body);

    const existingReport = await prisma.report.findFirst({
      where: {
        cameraId: data.cameraId,
        userId: req.user!.userId,
        status: 'PENDING',
      },
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You already reported this camera' });
    }

    const report = await prisma.report.create({
      data: {
        reason: data.reason,
        camera: { connect: { id: data.cameraId } },
        user: { connect: { id: req.user!.userId } },
      },
      include: {
        camera: { include: { category: true } },
        user: { select: { username: true } },
      },
    });

    res.status(201).json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', authenticateToken, requireRole(['MODERATOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const status = reportStatusSchema.parse(req.body.status);

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        camera: { include: { category: true } },
        user: { select: { username: true } },
      },
    });

    if (status === 'RESOLVED') {
      await prisma.camera.update({
        where: { id: report.cameraId },
        data: { status: 'ACTIVE' },
      });
    }

    res.json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
