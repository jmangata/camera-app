import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/stats', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalCameras,
      activeCameras,
      totalUsers,
      totalReports,
      pendingReports,
      totalCategories
    ] = await Promise.all([
      prisma.camera.count(),
      prisma.camera.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.category.count()
    ]);

    const recentCameras = await prisma.camera.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        addedByUser: {
          select: { username: true }
        }
      }
    });

    const camerasByCategory = await prisma.category.findMany({
      include: {
        _count: {
          select: { cameras: true }
        }
      }
    });

    res.json({
      overview: {
        totalCameras,
        activeCameras,
        totalUsers,
        totalReports,
        pendingReports,
        totalCategories
      },
      recentCameras,
      camerasByCategory
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            cameras: true,
            reports: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id/role', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;