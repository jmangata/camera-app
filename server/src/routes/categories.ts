import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { cameras: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        cameras: {
          include: {
            addedByUser: {
              select: { username: true }
            },
            _count: {
              select: {
                reports: true,
                favorites: true
              }
            }
          }
        },
        _count: {
          select: { cameras: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;