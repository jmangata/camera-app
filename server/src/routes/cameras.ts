import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { cameraSchema } from '../validators/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, status, lat, lng, radius } = req.query;
    
    const cameras = await prisma.camera.findMany({
      where: {
        ...(category && { categoryId: category as string }),
        ...(status && { status: status as any }),
      },
      include: {
        category: true,
        addedByUser: {
          select: { username: true }
        },
        _count: {
          select: {
            reports: true,
            comments: true,
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (lat && lng && radius) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const searchRadius = parseFloat(radius as string);
      
      const filteredCameras = cameras.filter(camera => {
        const distance = calculateDistance(
          userLat, userLng, 
          camera.latitude, camera.longitude
        );
        return distance <= searchRadius;
      });
      
      return res.json(filteredCameras);
    }

    res.json(cameras);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const camera = await prisma.camera.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        addedByUser: {
          select: { username: true }
        },
        comments: {
          include: {
            user: {
              select: { username: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reports: true,
            favorites: true
          }
        }
      }
    });

    if (!camera) {
      return res.status(404).json({ error: 'Caméra non trouvée' });
    }

    res.json(camera);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = cameraSchema.parse(req.body);
    
    const camera = await prisma.camera.create({
      data: {
        ...data,
        addedBy: req.user!.userId,
      },
      include: {
        category: true,
        addedByUser: {
          select: { username: true }
        }
      }
    });

    res.status(201).json(camera);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = cameraSchema.parse(req.body);
    
    const camera = await prisma.camera.update({
      where: { id: req.params.id },
      data,
      include: {
        category: true,
        addedByUser: {
          select: { username: true }
        }
      }
    });

    res.json(camera);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.camera.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;