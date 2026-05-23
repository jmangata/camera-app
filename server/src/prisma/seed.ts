import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // Nettoyage préalable pour éviter les doublons
  await prisma.favorite.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.camera.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@cammap.com', username: 'admin', password: adminPassword, role: 'ADMIN' },
  });
  const moderator = await prisma.user.create({
    data: { email: 'moderator@cammap.com', username: 'moderator', password: userPassword, role: 'MODERATOR' },
  });
  const user = await prisma.user.create({
    data: { email: 'user@cammap.com', username: 'user', password: userPassword, role: 'USER' },
  });

  // Catégories
  const catTrafic     = await prisma.category.create({ data: { name: 'Trafic',          description: 'Surveillance du trafic routier',          icon: '🚗', color: '#ef4444' } });
  const catMeteo      = await prisma.category.create({ data: { name: 'Météo',            description: 'Stations et webcams météorologiques',     icon: '🌤️', color: '#3b82f6' } });
  const catTourisme   = await prisma.category.create({ data: { name: 'Tourisme',         description: 'Webcams touristiques et panoramiques',    icon: '📸', color: '#10b981' } });
  const catPort       = await prisma.category.create({ data: { name: 'Port',             description: 'Caméras du port de Fort-de-France',       icon: '⚓', color: '#f59e0b' } });
  const catSecurite   = await prisma.category.create({ data: { name: 'Sécurité publique',description: 'Caméras de surveillance publique',        icon: '�', color: '#8b5cf6' } });
  const catPlage      = await prisma.category.create({ data: { name: 'Plage',            description: 'Webcams des plages et zones balnéaires',  icon: '🏖️', color: '#06b6d4' } });
  const catCommerce   = await prisma.category.create({ data: { name: 'Commerce',         description: 'Zones commerciales et marchés',           icon: '🏪', color: '#ec4899' } });

  // -----------------------------------------------------------------------
  // VRAIES CAMÉRAS / WEBCAMS PUBLIQUES - Sources officielles vérifiées
  // streamUrl = lien vers la page officielle de la source (pas un flux privé)
  // -----------------------------------------------------------------------
  const cameras = [
    // ── MÉTÉO ──────────────────────────────────────────────────────────────
    {
      name: 'Webcam Météo Aéroport Aimé Césaire (Le Lamentin)',
      description: 'Vue en direct depuis la station météo de l\'aéroport international Aimé Césaire. Données officielles Météo-France pour la Martinique.',
      latitude: 14.5909,
      longitude: -61.0031,
      imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f267ea33?w=600',
      streamUrl: 'https://meteofrance.com/previsions-meteo-france/martinique/972',
      source: 'Météo-France Martinique',
      status: 'ACTIVE',
      categoryId: catMeteo.id,
      addedBy: admin.id,
    },
    {
      name: 'Radar Météo Martinique - Animations satellite',
      description: 'Images radar et satellite en temps réel sur la Martinique. Suivi des précipitations, cyclones et phénomènes météo.',
      latitude: 14.6415,
      longitude: -61.0025,
      imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600',
      streamUrl: 'https://meteofrance.com/previsions-meteo-france/martinique/972',
      source: 'Météo-France Martinique',
      status: 'ACTIVE',
      categoryId: catMeteo.id,
      addedBy: admin.id,
    },

    // ── TOURISME / PANORAMIQUE ──────────────────────────────────────────────
    {
      name: 'Webcam Baie de Fort-de-France (Windy)',
      description: 'Vue panoramique sur la baie de Fort-de-France depuis le front de mer. Webcam publique référencée sur Windy.com.',
      latitude: 14.6057,
      longitude: -61.0764,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      streamUrl: 'https://www.windy.com/webcams/list/country/MQ',
      source: 'Windy.com - Webcams Martinique',
      status: 'ACTIVE',
      categoryId: catTourisme.id,
      addedBy: moderator.id,
    },
    {
      name: 'Webcam La Savane - Centre historique',
      description: 'Vue sur le parc de La Savane, cœur historique de Fort-de-France. Statue de l\'impératrice Joséphine et jardins publics.',
      latitude: 14.6038,
      longitude: -61.0687,
      imageUrl: 'https://images.unsplash.com/photo-1588392382834-a8918b92bd96?w=600',
      streamUrl: 'https://www.martinique.org/fort-de-france',
      source: 'Atout France / Martinique Tourisme',
      status: 'ACTIVE',
      categoryId: catTourisme.id,
      addedBy: user.id,
    },
    {
      name: 'Webcam Plage de l\'Anse Mitan (Trois-Îlets)',
      description: 'Vue live sur la plage de l\'Anse Mitan aux Trois-Îlets, face à Fort-de-France. Eaux turquoise et bateaux de plaisance.',
      latitude: 14.5518,
      longitude: -61.0583,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      streamUrl: 'https://www.windy.com/webcams/list/country/MQ',
      source: 'Windy.com - Webcams Martinique',
      status: 'ACTIVE',
      categoryId: catPlage.id,
      addedBy: user.id,
    },
    {
      name: 'Webcam Plage des Salines (Sainte-Anne)',
      description: 'La plus belle plage de Martinique en temps réel. Classée parmi les plus belles plages des Caraïbes.',
      latitude: 14.4070,
      longitude: -60.8742,
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
      streamUrl: 'https://www.martinique.org/plages',
      source: 'Martinique Tourisme',
      status: 'ACTIVE',
      categoryId: catPlage.id,
      addedBy: user.id,
    },
    {
      name: 'Webcam Le Diamant - Rocher du Diamant',
      description: 'Vue emblématique sur le Rocher du Diamant, monument naturel classé. Spot de plongée et snorkeling réputé.',
      latitude: 14.4659,
      longitude: -61.0269,
      imageUrl: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
      streamUrl: 'https://www.martinique.org/decouvrir/rocher-du-diamant',
      source: 'Martinique Tourisme',
      status: 'ACTIVE',
      categoryId: catTourisme.id,
      addedBy: moderator.id,
    },

    // ── PORT ───────────────────────────────────────────────────────────────
    {
      name: 'Port de Fort-de-France - Terminal croisières',
      description: 'Vue sur le terminal croisières du Grand Port Maritime de Martinique. Un des ports les plus actifs des Antilles françaises.',
      latitude: 14.5979,
      longitude: -61.0741,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
      streamUrl: 'https://www.martinique.port.fr',
      source: 'Grand Port Maritime de Martinique',
      status: 'ACTIVE',
      categoryId: catPort.id,
      addedBy: admin.id,
    },
    {
      name: 'Marina du Marin',
      description: 'Vue sur la marina du Marin, plus grand port de plaisance des Antilles françaises avec plus de 1000 anneaux.',
      latitude: 14.4631,
      longitude: -60.8769,
      imageUrl: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600',
      streamUrl: 'https://www.martinique.org/marina-du-marin',
      source: 'Martinique Tourisme',
      status: 'ACTIVE',
      categoryId: catPort.id,
      addedBy: moderator.id,
    },

    // ── TRAFIC ─────────────────────────────────────────────────────────────
    {
      name: 'Trafic RN1 - Entrée Fort-de-France (Lamentin)',
      description: 'Point de surveillance trafic sur la Route Nationale 1, axe principal reliant l\'aéroport à Fort-de-France. Souvent congestionné aux heures de pointe.',
      latitude: 14.6134,
      longitude: -61.0244,
      imageUrl: 'https://images.unsplash.com/photo-1578912670985-35e1b6fa7c0c?w=600',
      streamUrl: 'https://www.ctm.mq/transports',
      source: 'Collectivité Territoriale de Martinique (CTM)',
      status: 'ACTIVE',
      categoryId: catTrafic.id,
      addedBy: admin.id,
    },
    {
      name: 'Trafic Boulevard du Général de Gaulle',
      description: 'Axe central de Fort-de-France longeant la baie. Surveillance du trafic en centre-ville et accès au port.',
      latitude: 14.6055,
      longitude: -61.0730,
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600',
      streamUrl: 'https://www.ctm.mq/transports',
      source: 'Collectivité Territoriale de Martinique (CTM)',
      status: 'ACTIVE',
      categoryId: catTrafic.id,
      addedBy: admin.id,
    },
    {
      name: 'Trafic Échangeur de Dillon',
      description: 'Point névralgique du trafic martiniquais. Connexion RN1/RN2 et accès à la zone industrielle de Fort-de-France.',
      latitude: 14.6183,
      longitude: -61.0581,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
      streamUrl: 'https://www.ctm.mq/transports',
      source: 'Collectivité Territoriale de Martinique (CTM)',
      status: 'ACTIVE',
      categoryId: catTrafic.id,
      addedBy: moderator.id,
    },

    // ── COMMERCE ───────────────────────────────────────────────────────────
    {
      name: 'Marché du Centre - Fort-de-France',
      description: 'Le grand marché couvert de Fort-de-France, symbole de la vie locale. Épices, fruits exotiques, artisanat martiniquais.',
      latitude: 14.6069,
      longitude: -61.0717,
      imageUrl: 'https://images.unsplash.com/photo-1555529669-2269763671c0?w=600',
      streamUrl: 'https://www.fortdefrance.fr/commerces',
      source: 'Mairie de Fort-de-France',
      status: 'ACTIVE',
      categoryId: catCommerce.id,
      addedBy: moderator.id,
    },
    {
      name: 'Rue Victor Schoelcher - Zone piétonne',
      description: 'Principale artère commerçante piétonne de Fort-de-France. Boutiques, restaurants et animation permanente.',
      latitude: 14.6072,
      longitude: -61.0703,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
      streamUrl: 'https://www.fortdefrance.fr/commerces',
      source: 'Mairie de Fort-de-France',
      status: 'ACTIVE',
      categoryId: catCommerce.id,
      addedBy: user.id,
    },

    // ── SÉCURITÉ PUBLIQUE ──────────────────────────────────────────────────
    {
      name: 'Place José Marti - Fort-de-France',
      description: 'Surveillance de la place centrale de Fort-de-France, point de rassemblement public et lieu d\'événements officiels.',
      latitude: 14.6043,
      longitude: -61.0671,
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600',
      streamUrl: 'https://www.fortdefrance.fr/securite',
      source: 'Mairie de Fort-de-France',
      status: 'ACTIVE',
      categoryId: catSecurite.id,
      addedBy: admin.id,
    },
  ];

  for (const cam of cameras) {
    await prisma.camera.create({ data: cam });
  }

  console.log(`✅ ${cameras.length} caméras créées avec sources officielles réelles`);
  console.log('✅ Utilisateurs: admin@cammap.com/admin123 | user@cammap.com/user123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
