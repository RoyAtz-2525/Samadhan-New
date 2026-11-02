/**
 * Citizen Reward Points Configuration
 * Configurable reward amounts and non-monetary civic redemption catalog.
 */

const REWARD_POINTS = {
  REPORT_APPROVED: parseInt(process.env.REWARD_POINTS_REPORT_APPROVED || '10', 10),
  ISSUE_RESOLVED: parseInt(process.env.REWARD_POINTS_ISSUE_RESOLVED || '10', 10),
};

const REWARD_CATALOG = [
  {
    id: 'civic_transit_pass',
    title: '1-Day Green City Transit Pass',
    category: 'Public Transport',
    pointsCost: 50,
    description: 'Complimentary full-day pass for all municipal bus and metro rapid transit lines.',
    terms: 'Valid for 30 days from redemption. Non-transferable and non-convertible to cash.',
    icon: 'Bus',
    badge: 'Popular',
  },
  {
    id: 'library_digital_pass',
    title: 'City Central Library Digital Pass',
    category: 'Education & Civic',
    pointsCost: 30,
    description: '3-month unlimited digital membership to municipal e-libraries, research papers, and journals.',
    terms: 'Instant digital activation. Non-convertible to cash.',
    icon: 'BookOpen',
    badge: 'Civic',
  },
  {
    id: 'urban_tree_certificate',
    title: 'Urban Canopy Tree Planting Certificate',
    category: 'Environment',
    pointsCost: 40,
    description: 'A native neem or banyan sapling planted in your ward under the Green City Initiative with geotagged certificate.',
    terms: 'Planted during the upcoming municipal weekend drive. Includes GPS coordinates and tree ID.',
    icon: 'Trees',
    badge: 'Eco Friendly',
  },
  {
    id: 'civic_champion_badge',
    title: 'Civic Champion Verified Certificate',
    category: 'Recognition',
    pointsCost: 20,
    description: 'Official digital commendation signed by the Municipal Authority recognizing active civic contributions.',
    terms: 'Verifiable online credential with unique serial number.',
    icon: 'Award',
    badge: 'Official',
  },
];

const getCatalogItem = (itemId) => {
  return REWARD_CATALOG.find((item) => item.id === itemId) || null;
};

module.exports = {
  REWARD_POINTS,
  REWARD_CATALOG,
  getCatalogItem,
};
