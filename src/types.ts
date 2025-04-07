export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseIncome: number;
  count: number;
  icon: string;
  reputation: number;
  climate: number;
  requiresAscension?: boolean;
  ethical?: boolean;
  unethical?: boolean;
}

export interface TemporaryUpgrade {
  id: string;
  name: string;
  description: string;
  moneyMultiplier: number;
  reputationChange: number;
  climateChange: number;
  ethical: boolean;
  icon: string;
}

export interface GameState {
  money: number;
  moneyPerSecond: number;
  reputation: number;
  climate: number;
  upgrades: Record<string, Upgrade>;
  lastTick: number;
  ascensionLevel: number;
  lifetimeEarnings: number;
  canRenaissance: boolean;
  temporaryUpgrades: TemporaryUpgrade[] | null;
  lastTemporaryUpgrade: number;
  waitingForSelection: boolean;
}