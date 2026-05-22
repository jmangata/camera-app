import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cammap.com' },
    update: {},
    create: {
      email: 'admin@cammap.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@cammap.com' },
    update: {},
    create: {
      email: 'moderator@cammap.com',
      username: 'moderator',
      password: userPassword,
      role: 'MODERATOR',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@cammap.com' },
    update: {},
    create: {
      email: 'user@cammap.com',
      username: 'user',
      password: userPassword,
      role: 'USER',
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Trafic' },
      update: {},
      create: {
        name: 'Trafic',
        description: 'Caméras de surveillance du trafic routier',
        icon: '🚗',
        color: '#ef4444',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Météo' },
      update: {},
      create: {
        name: 'Météo',
        description: 'Caméras météorologiques',
        icon: '🌤️',
        color: '#3b82f6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Tourisme' },
      update: {},
      create: {
        name: 'Tourisme',
        description: 'Caméras touristiques et panoramiques',
        icon: '📸',
        color: '#10b981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Port' },
      update: {},
      create: {
        name: 'Port',
        description: 'Caméras du port de Fort-de-France',
        icon: '⚓',
        color: '#f59e0b',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Sécurité' },
      update: {},
      create: {
        name: 'Sécurité publique',
        description: 'Caméras de surveillance publique',
        icon: '👮',
        color: '#8b5cf6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Plage' },
      update: {},
      create: {
        name: 'Plage',
        description: 'Caméras des plages et zones balnéaires',
        icon: '🏖️',
        color: '#06b6d4',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Commerce' },
      update: {},
      create: {
        name: 'Commerce',
        description: 'Caméras des zones commerciales',
        icon: '🏪',
        color: '#ec4899',
      },
    }),
  ]);

  const cameras = [
    {
      name: 'Caméra Trafic Centre-Ville',
      description: 'Surveillance du trafic au centre-ville de Fort-de-France',
      latitude: 14.6065,
      longitude: -61.0719,
      imageUrl: 'https://images.unsplash.com/photo-1578912670985-35e1b6fa7c0c?w=400',
      streamUrl: 'https://example.com/stream1.m3u8',
      source: 'Mairie de Fort-de-France',
      categoryId: categories[0].id,
      addedBy: admin.id,
    },
    {
      name: 'Webcam La Savane',
      description: 'Vue panoramique sur le parc La Savane',
      latitude: 14.6038,
      longitude: -61.0687,
      imageUrl: 'https://images.unsplash.com/photo-1588392382834-a8918b92bd96?w=400',
      streamUrl: 'https://example.com/stream2.m3u8',
      source: 'Office de Tourisme',
      categoryId: categories[2].id,
      addedBy: user.id,
    },
    {
      name: 'Caméra Port de Fort-de-France',
      description: 'Vue sur les activités du port',
      latitude: 14.5979,
      longitude: -61.0741,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      streamUrl: 'https://example.com/stream3.m3u8',
      source: 'Port Autonome',
      categoryId: categories[3].id,
      addedBy: moderator.id,
    },
    {
      name: 'Webcam Plage de l\'Anse Mitan',
      description: 'Vue sur la plage et la baie',
      latitude: 14.5809,
      longitude: -61.0396,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      streamUrl: 'https://example.com/stream4.m3u8',
      source: 'Office de Tourisme',
      categoryId: categories[5].id,
      addedBy: user.id,
    },
    {
      name: 'Caméra Météo Fort-de-France',
      description: 'Station météorologique avec vue sur la ville',
      latitude: 14.6102,
      longitude: -61.0696,
      imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f267ea33?w=400',
      streamUrl: 'https://example.com/stream5.m3u8',
      source: 'Météo France',
      categoryId: categories[1].id,
      addedBy: admin.id,
    },
    {
      name: 'Caméra Commerce Rue Victor Schoelcher',
      description: 'Zone commerciale principale',
      latitude: 14.6071,
      longitude: -61.0699,
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      streamUrl: 'https://example.com/stream6.m3u8',
      source: 'Chambre de Commerce',
      categoryId: categories[6].id,
      addedBy: moderator.id,
    },
  ];

  for (const cameraData of cameras) {
    await prisma.camera.create({
      data: cameraData,
    });
  }

  console.log('Seeding terminé!');
  console.log('Utilisateurs créés:');
  console.log('- Admin: admin@cammap.com / admin123');
  console.log('- Moderator: moderator@cammap.com / user123');
  console.log('- User: user@cammap.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });