import { Upgrade, TemporaryUpgrade } from './types';

export const INITIAL_MONEY = 0;
export const CLICK_BASE_VALUE = 1;
export const REPUTATION_DECAY_RATE = 0.1;
export const CLIMATE_DANGER_THRESHOLD = 100;
export const REPUTATION_DANGER_THRESHOLD = 0;
export const MAX_CLIMATE = 100;
export const TEMPORARY_UPGRADE_INTERVAL = 5000; // 5 secondes
export const TEMPORARY_UPGRADE_WAIT_TIME = 5000; // 5 secondes d'attente après une sélection

export const TEMPORARY_UPGRADES: TemporaryUpgrade[] = [
  {
    id: 'emmanuele',
    name: 'Emmanuele Macaroni',
    description: 'Président qui promet la "start-up nation" tout en favorisant les ultra-riches.',
    moneyMultiplier: 1.5,
    reputationChange: -10,
    climateChange: 5,
    ethical: false,
    icon: 'Crown'
  },
  {
    id: 'brigetta',
    name: 'Brigetta M.',
    description: 'Première dame influente qui soutient les initiatives culturelles.',
    moneyMultiplier: 1.2,
    reputationChange: 5,
    climateChange: 0,
    ethical: true,
    icon: 'BookOpen'
  },
  {
    id: 'marina',
    name: 'Marina LeStylo',
    description: 'Politicienne populiste qui promet des solutions simplistes.',
    moneyMultiplier: 1.3,
    reputationChange: -15,
    climateChange: 8,
    ethical: false,
    icon: 'Flag'
  },
  {
    id: 'gabrielo',
    name: 'Gabrielo Attali',
    description: 'Jeune politique ambitieux qui promet le changement.',
    moneyMultiplier: 1.1,
    reputationChange: 3,
    climateChange: -2,
    ethical: true,
    icon: 'Star'
  },
  {
    id: 'donaldo',
    name: 'Donaldo Triomphe',
    description: 'Magnat de l\'immobilier devenu politique, climatosceptique notoire.',
    moneyMultiplier: 2.0,
    reputationChange: -20,
    climateChange: 15,
    ethical: false,
    icon: 'Building'
  },
  {
    id: 'jordano',
    name: 'Jordano Sardella',
    description: 'Jeune leader d\'un parti traditionnel en quête de modernité.',
    moneyMultiplier: 1.4,
    reputationChange: -12,
    climateChange: 6,
    ethical: false,
    icon: 'Flame'
  },
  {
    id: 'vladimiro',
    name: 'Vladimiro Poutinov',
    description: 'Dirigeant autoritaire qui contrôle les ressources énergétiques.',
    moneyMultiplier: 1.8,
    reputationChange: -25,
    climateChange: 20,
    ethical: false,
    icon: 'Snowflake'
  },
  {
    id: 'francesco',
    name: 'Francesco I',
    description: 'Leader spirituel engagé pour la protection de l\'environnement.',
    moneyMultiplier: 0.8,
    reputationChange: 15,
    climateChange: -10,
    ethical: true,
    icon: 'Heart'
  },
  {
    id: 'volodymyro',
    name: 'Volodymyro Zelenskyo',
    description: 'Leader charismatique qui défend la démocratie.',
    moneyMultiplier: 1.0,
    reputationChange: 20,
    climateChange: -5,
    ethical: true,
    icon: 'Shield'
  }
];

export const INITIAL_UPGRADES: Record<string, Upgrade> = {
  aiBot: {
    id: 'aiBot',
    name: 'Googlai',
    description: 'IA qui remplace les travailleurs humains. Développée par une grande entreprise de recherche.',
    baseCost: 15,
    baseIncome: 0.3,
    count: 0,
    icon: 'Bot',
    reputation: -0.5,
    climate: 0.2,
    unethical: true
  },
  lobbyist: {
    id: 'lobbyist',
    name: 'Amazonia Corp',
    description: 'Géant du e-commerce qui influence les politiques pour maximiser ses profits.',
    baseCost: 100,
    baseIncome: 2,
    count: 0,
    icon: 'UserCheck',
    reputation: -2,
    climate: 0.5,
    unethical: true
  },
  marketing: {
    id: 'marketing',
    name: 'Metaverse Inc',
    description: 'Réseau social qui collecte les données personnelles et manipule l\'opinion.',
    baseCost: 300,
    baseIncome: 5,
    count: 0,
    icon: 'Eye',
    reputation: -1,
    climate: 1,
    unethical: true
  },
  offshore: {
    id: 'offshore',
    name: 'Appel Systems',
    description: 'Géant de la tech expert en optimisation fiscale agressive.',
    baseCost: 800,
    baseIncome: 12,
    count: 0,
    icon: 'Smartphone',
    reputation: -5,
    climate: 0,
    unethical: true
  },
  teslectric: {
    id: 'teslectric',
    name: 'Teslectric Motors',
    description: 'Constructeur automobile qui promet une révolution verte tout en exploitant ses travailleurs.',
    baseCost: 1500,
    baseIncome: 15,
    count: 0,
    icon: 'Car',
    reputation: -3,
    climate: 0.8,
    unethical: true
  },
  openMind: {
    id: 'openMind',
    name: 'OpenMind Corp',
    description: 'Startup d\'IA qui prétend être éthique mais privilégie le profit à tout prix.',
    baseCost: 2000,
    baseIncome: 20,
    count: 0,
    icon: 'Brain',
    reputation: -4,
    climate: 1.2,
    unethical: true
  },
  greenTech: {
    id: 'greenTech',
    name: 'Ecosia Search',
    description: 'Moteur de recherche qui plante des arbres et fonctionne à l\'énergie renouvelable.',
    baseCost: 200,
    baseIncome: 1.5,
    count: 0,
    icon: 'Leaf',
    reputation: 2,
    climate: -0.5,
    requiresAscension: true,
    ethical: true
  },
  ethicalAI: {
    id: 'ethicalAI',
    name: 'Too Good To Go',
    description: 'Application qui lutte contre le gaspillage alimentaire et soutient les commerces locaux.',
    baseCost: 500,
    baseIncome: 4,
    count: 0,
    icon: 'Heart',
    reputation: 3,
    climate: -0.2,
    requiresAscension: true,
    ethical: true
  },
  communityPrograms: {
    id: 'communityPrograms',
    name: 'Patagonia Green',
    description: 'Marque de vêtements investissant massivement dans la protection de l\'environnement.',
    baseCost: 1200,
    baseIncome: 8,
    count: 0,
    icon: 'Users',
    reputation: 5,
    climate: -1,
    requiresAscension: true,
    ethical: true
  }
};