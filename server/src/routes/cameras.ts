import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { cameraSchema } from '../validators/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, lat, lng, radius } = req.query;

    const cameras = await prisma.camera.findMany({
      where: {
        ...(category && { categoryId: category as string }),
        ...(status && { status: status as any }),
      },
      include: {
        category: true,
        addedByUser: { select: { username: true } },
        _count: { select: { reports: true, comments: true, favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lat && lng && radius) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseFloat(radius as string);

      const filtered = cameras.filter((camera) => {
        const distance = calculateDistance(userLat, userLng, camera.latitude, camera.longitude);
        return distance <= searchRadius;
      });

      return res.json(filtered);
    }

    res.json(cameras);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const camera = await prisma.camera.findUnique({
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

    if (!camera) return res.status(404).json({ error: 'Camera not found' });

    res.json(camera);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = cameraSchema.parse(req.body);

    const camera = await prisma.camera.create({
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl,
        streamUrl: data.streamUrl,
        source: data.source,
        category: { connect: { id: data.categoryId } },
        addedByUser: { connect: { id: req.user!.userId } },
      },
      include: {
        category: true,
        addedByUser: { select: { username: true } },
      },
    });

    res.status(201).json(camera);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.camera.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Camera not found' });

    const isOwner = existing.addedBy === req.user!.userId;
    const isPrivileged = req.user!.role === 'ADMIN' || req.user!.role === 'MODERATOR';
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ error: 'Not authorized to update this camera' });
    }

    const data = cameraSchema.parse(req.body);

    const camera = await prisma.camera.update({
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.camera.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Camera not found' });

    const isOwner = existing.addedBy === req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this camera' });
    }

    await prisma.camera.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;
