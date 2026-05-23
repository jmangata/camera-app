"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Début du seeding...');
    await prisma.favorite.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.report.deleteMany();
    await prisma.camera.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    const adminPassword = await bcryptjs_1.default.hash('admin123', 12);
    const userPassword = await bcryptjs_1.default.hash('user123', 12);
    const admin = await prisma.user.create({
        data: { email: 'admin@cammap.com', username: 'admin', password: adminPassword, role: 'ADMIN' },
    });
    const moderator = await prisma.user.create({
        data: { email: 'moderator@cammap.com', username: 'moderator', password: userPassword, role: 'MODERATOR' },
    });
    const userDemo = await prisma.user.create({
        data: { email: 'user@cammap.com', username: 'user', password: userPassword, role: 'USER' },
    });
    const catTrafic = await prisma.category.create({ data: { name: 'Trafic', description: 'Surveillance du trafic routier', icon: '🚗', color: '#ef4444' } });
    const catMeteo = await prisma.category.create({ data: { name: 'Météo', description: 'Stations et webcams météorologiques', icon: '🌤️', color: '#3b82f6' } });
    const catTourisme = await prisma.category.create({ data: { name: 'Tourisme', description: 'Webcams touristiques et panoramiques', icon: '📸', color: '#10b981' } });
    const catPort = await prisma.category.create({ data: { name: 'Port', description: 'Caméras du port de Fort-de-France', icon: '⚓', color: '#f59e0b' } });
    const catSecurite = await prisma.category.create({ data: { name: 'Sécurité publique', description: 'Caméras de surveillance publique', icon: '👮', color: '#8b5cf6' } });
    const catPlage = await prisma.category.create({ data: { name: 'Plage', description: 'Webcams des plages et zones balnéaires', icon: '🏖️', color: '#06b6d4' } });
    const catCommerce = await prisma.category.create({ data: { name: 'Commerce', description: 'Zones commerciales et marchés', icon: '🏪', color: '#ec4899' } });
    // Helpers
    const byAdmin = { connect: { id: admin.id } };
    const byModo = { connect: { id: moderator.id } };
    const byUser = { connect: { id: userDemo.id } };
    await prisma.camera.createMany({
        data: [
            // ── MÉTÉO ─────────────────────────────────────────────────────────────
            {
                name: 'Station Météo Aéroport Aimé Césaire',
                description: 'Station météorologique officielle de l\'aéroport international Aimé Césaire. Données en temps réel : température, vent, pression. Source Météo-France.',
                latitude: 14.5909, longitude: -61.0031,
                imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f267ea33?w=600',
                streamUrl: 'https://meteofrance.com/previsions-meteo-france/fort-de-france/97200',
                source: 'Météo-France Martinique',
                status: 'ACTIVE',
                categoryId: catMeteo.id, addedBy: admin.id,
            },
            {
                name: 'Radar Météo Martinique',
                description: 'Images radar et satellite en temps réel sur la Martinique. Suivi des précipitations, cyclones et phénomènes météorologiques. Service officiel Météo-France.',
                latitude: 14.6415, longitude: -61.0025,
                imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600',
                streamUrl: 'https://meteofrance.com/previsions-meteo-france/martinique/972',
                source: 'Météo-France Martinique',
                status: 'ACTIVE',
                categoryId: catMeteo.id, addedBy: admin.id,
            },
            // ── TOURISME ──────────────────────────────────────────────────────────
            {
                name: 'Webcam Baie de Fort-de-France',
                description: 'Vue panoramique sur la magnifique baie de Fort-de-France. Référencée publiquement sur Windy.com. Vue sur les bateaux et le front de mer.',
                latitude: 14.6057, longitude: -61.0764,
                imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
                streamUrl: 'https://www.windy.com/webcams/list/country/MQ',
                source: 'Windy.com - Webcams Martinique',
                status: 'ACTIVE',
                categoryId: catTourisme.id, addedBy: moderator.id,
            },
            {
                name: 'Parc de La Savane - Fort-de-France',
                description: 'Vue sur le parc de La Savane, cœur historique de Fort-de-France. Jardins publics, fontaines et statue de l\'impératrice Joséphine.',
                latitude: 14.6038, longitude: -61.0687,
                imageUrl: 'https://images.unsplash.com/photo-1588392382834-a8918b92bd96?w=600',
                streamUrl: 'https://www.martinique.org/fort-de-france',
                source: 'Martinique Tourisme',
                status: 'ACTIVE',
                categoryId: catTourisme.id, addedBy: userDemo.id,
            },
            {
                name: 'Rocher du Diamant',
                description: 'Vue emblématique sur le célèbre Rocher du Diamant, monument naturel classé et spot de plongée réputé des Caraïbes.',
                latitude: 14.4659, longitude: -61.0269,
                imageUrl: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
                streamUrl: 'https://www.martinique.org/decouvrir/sites-naturels',
                source: 'Martinique Tourisme',
                status: 'ACTIVE',
                categoryId: catTourisme.id, addedBy: moderator.id,
            },
            // ── PLAGE ─────────────────────────────────────────────────────────────
            {
                name: 'Plage de l\'Anse Mitan (Trois-Îlets)',
                description: 'Webcam sur la plage de l\'Anse Mitan, face à Fort-de-France. Eaux turquoise, bateaux de plaisance. Accessible depuis Fort-de-France en vedette.',
                latitude: 14.5518, longitude: -61.0583,
                imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
                streamUrl: 'https://www.windy.com/webcams/list/country/MQ',
                source: 'Windy.com - Webcams Martinique',
                status: 'ACTIVE',
                categoryId: catPlage.id, addedBy: userDemo.id,
            },
            {
                name: 'Plage des Salines (Sainte-Anne)',
                description: 'La plus belle plage de Martinique. Classée parmi les plus belles plages des Caraïbes. Eau cristalline, sable blanc, cocotiers.',
                latitude: 14.4070, longitude: -60.8742,
                imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
                streamUrl: 'https://www.martinique.org/plages-de-reve',
                source: 'Martinique Tourisme',
                status: 'ACTIVE',
                categoryId: catPlage.id, addedBy: userDemo.id,
            },
            {
                name: 'Plage de l\'Anse à l\'Ane (Trois-Îlets)',
                description: 'Plage calme et familiale face à la baie de Fort-de-France. Vue panoramique sur la ville depuis la plage.',
                latitude: 14.5433, longitude: -61.0686,
                imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600',
                streamUrl: 'https://www.martinique.org/plages-de-reve',
                source: 'Martinique Tourisme',
                status: 'ACTIVE',
                categoryId: catPlage.id, addedBy: moderator.id,
            },
            // ── PORT ──────────────────────────────────────────────────────────────
            {
                name: 'Port de Fort-de-France - Terminal croisières',
                description: 'Grand Port Maritime de Martinique. Terminal croisières accueillant plus de 500 000 passagers/an. Un des ports les plus actifs des Antilles.',
                latitude: 14.5979, longitude: -61.0741,
                imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
                streamUrl: 'https://www.martinique.port.fr',
                source: 'Grand Port Maritime de Martinique',
                status: 'ACTIVE',
                categoryId: catPort.id, addedBy: admin.id,
            },
            {
                name: 'Marina du Marin',
                description: 'Plus grand port de plaisance des Antilles françaises avec plus de 1 000 anneaux. Point de départ de nombreuses croisières en catamaran.',
                latitude: 14.4631, longitude: -60.8769,
                imageUrl: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600',
                streamUrl: 'https://www.marinedumarin.com',
                source: 'Marina du Marin',
                status: 'ACTIVE',
                categoryId: catPort.id, addedBy: moderator.id,
            },
            // ── TRAFIC ────────────────────────────────────────────────────────────
            {
                name: 'Trafic RN1 - Entrée Fort-de-France (Lamentin)',
                description: 'Point de surveillance trafic sur la Route Nationale 1, axe principal reliant l\'aéroport au centre-ville. Congestion fréquente aux heures de pointe.',
                latitude: 14.6134, longitude: -61.0244,
                imageUrl: 'https://images.unsplash.com/photo-1578912670985-35e1b6fa7c0c?w=600',
                streamUrl: 'https://www.ctm.mq',
                source: 'Collectivité Territoriale de Martinique (CTM)',
                status: 'ACTIVE',
                categoryId: catTrafic.id, addedBy: admin.id,
            },
            {
                name: 'Boulevard du Général de Gaulle - Fort-de-France',
                description: 'Axe central de Fort-de-France longeant la baie. Artère principale du centre-ville avec accès au port et au marché.',
                latitude: 14.6055, longitude: -61.0730,
                imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600',
                streamUrl: 'https://www.ctm.mq',
                source: 'Collectivité Territoriale de Martinique (CTM)',
                status: 'ACTIVE',
                categoryId: catTrafic.id, addedBy: admin.id,
            },
            {
                name: 'Échangeur de Dillon - Fort-de-France',
                description: 'Point névralgique du réseau routier martiniquais. Connexion RN1/RN2 et accès à la zone industrielle et commerciale.',
                latitude: 14.6183, longitude: -61.0581,
                imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
                streamUrl: 'https://www.ctm.mq',
                source: 'Collectivité Territoriale de Martinique (CTM)',
                status: 'ACTIVE',
                categoryId: catTrafic.id, addedBy: moderator.id,
            },
            // ── COMMERCE ──────────────────────────────────────────────────────────
            {
                name: 'Grand Marché de Fort-de-France',
                description: 'Le grand marché couvert emblématique de Fort-de-France. Épices créoles, fruits exotiques, légumes du pays et artisanat martiniquais. Ouvert tous les matins.',
                latitude: 14.6069, longitude: -61.0717,
                imageUrl: 'https://images.unsplash.com/photo-1555529669-2269763671c0?w=600',
                streamUrl: 'https://www.fortdefrance.fr',
                source: 'Mairie de Fort-de-France',
                status: 'ACTIVE',
                categoryId: catCommerce.id, addedBy: moderator.id,
            },
            {
                name: 'Rue Victor Schoelcher - Zone piétonne',
                description: 'Principale artère commerçante et piétonne de Fort-de-France. Boutiques de mode, restaurants, cafés et animation permanente.',
                latitude: 14.6072, longitude: -61.0703,
                imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
                streamUrl: 'https://www.fortdefrance.fr',
                source: 'Mairie de Fort-de-France',
                status: 'ACTIVE',
                categoryId: catCommerce.id, addedBy: userDemo.id,
            },
            // ── SÉCURITÉ PUBLIQUE ─────────────────────────────────────────────────
            {
                name: 'Place José Marti - Fort-de-France',
                description: 'Place centrale de Fort-de-France, point de rassemblement public. Lieu d\'événements culturels, manifestations officielles et vie citoyenne.',
                latitude: 14.6043, longitude: -61.0671,
                imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600',
                streamUrl: 'https://www.fortdefrance.fr',
                source: 'Mairie de Fort-de-France',
                status: 'ACTIVE',
                categoryId: catSecurite.id, addedBy: admin.id,
            },
        ],
    });
    const count = await prisma.camera.count();
    console.log(`✅ ${count} caméras créées avec sources officielles réelles`);
    console.log('✅ admin@cammap.com / admin123');
    console.log('✅ moderator@cammap.com / user123');
    console.log('✅ user@cammap.com / user123');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=seed.js.map