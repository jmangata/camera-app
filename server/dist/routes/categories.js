"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            include: {
                _count: {
                    select: { cameras: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const category = await prisma_1.prisma.category.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map