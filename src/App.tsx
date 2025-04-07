import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, AlertTriangle, Sparkles, LogIn, Mail, Lock, Crown, BookOpen, Flag, Star, Building, Flame, Snowflake, Heart, Shield, Brain, Bot, UserCheck, Eye, Smartphone, Car, Users, Leaf } from 'lucide-react';
import { GameState, Upgrade, TemporaryUpgrade } from './types';
import { INITIAL_UPGRADES, INITIAL_MONEY, CLICK_BASE_VALUE, REPUTATION_DECAY_RATE, CLIMATE_DANGER_THRESHOLD, MAX_CLIMATE, REPUTATION_DANGER_THRESHOLD, TEMPORARY_UPGRADES, TEMPORARY_UPGRADE_INTERVAL } from './gameConfig';
import { supabase } from './supabase';
import { logAnalyticsEvent } from './firebase';

const iconMap: Record<string, React.ElementType> = {
  Crown, BookOpen, Flag, Star, Building, Flame, Snowflake, Heart, Shield, Brain, Bot, UserCheck, Eye, Smartphone, Car, Users, Leaf
};

function App() {
  const [gameState, setGameState] = useState<GameState>({
    money: INITIAL_MONEY,
    moneyPerSecond: 0,
    reputation: 100,
    climate: 0,
    upgrades: INITIAL_UPGRADES,
    lastTick: Date.now(),
    ascensionLevel: 0,
    lifetimeEarnings: 0,
    canRenaissance: true,
    temporaryUpgrades: null,
    lastTemporaryUpgrade: Date.now(),
    waitingForSelection: false
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveId, setSaveId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedGame();
      logAnalyticsEvent('user_logged_in');
    }
  }, [user]);

  const loadSavedGame = async () => {
    try {
      const { data, error } = await supabase
        .from('saves')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setGameState(data.game_state);
        setSaveId(data.id);
        logAnalyticsEvent('game_loaded', {
          ascensionLevel: data.game_state.ascensionLevel,
          lifetimeEarnings: data.game_state.lifetimeEarnings
        });
      }
    } catch (error) {
      console.error('Error loading saved game:', error);
    }
  };

  const saveGame = async () => {
    if (!user) return;

    try {
      if (saveId) {
        const { error } = await supabase
          .from('saves')
          .update({ game_state: gameState })
          .eq('id', saveId);

        if (error) throw error;
        logAnalyticsEvent('game_saved', {
          ascensionLevel: gameState.ascensionLevel,
          lifetimeEarnings: gameState.lifetimeEarnings
        });
      } else {
        const { data, error } = await supabase
          .from('saves')
          .insert([
            { user_id: user.id, game_state: gameState }
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) setSaveId(data.id);
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(saveGame, 30000);
    return () => clearInterval(interval);
  }, [user, gameState]);

  const calculateUpgradeCost = (upgrade: Upgrade): number => {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
  };

  const handleClick = () => {
    const clickValue = CLICK_BASE_VALUE * (1 + gameState.ascensionLevel * 0.5);
    setGameState(prev => ({
      ...prev,
      money: prev.money + clickValue,
      lifetimeEarnings: prev.lifetimeEarnings + clickValue
    }));
    logAnalyticsEvent('money_clicked', { value: clickValue });
  };

  const buyUpgrade = (upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades[upgradeId];
      if (upgrade.requiresAscension && prev.ascensionLevel === 0) return prev;
      
      const cost = calculateUpgradeCost(upgrade);
      if (prev.money < cost) return prev;

      const newUpgrade = {
        ...upgrade,
        count: upgrade.count + 1
      };

      logAnalyticsEvent('upgrade_purchased', {
        upgradeId,
        cost,
        newCount: newUpgrade.count
      });

      return {
        ...prev,
        money: prev.money - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: newUpgrade
        }
      };
    });
  };

  const generateTemporaryUpgrades = useCallback(() => {
    const now = Date.now();
    
    if (gameState.waitingForSelection) return;
    
    if (now - gameState.lastTemporaryUpgrade < TEMPORARY_UPGRADE_INTERVAL) return;

    const availableUpgrades = TEMPORARY_UPGRADES.filter(upgrade => 
      gameState.ascensionLevel > 0 ? true : !upgrade.ethical
    );

    const selectedUpgrades = [];
    const usedIndices = new Set();

    while (selectedUpgrades.length < 3 && usedIndices.size < availableUpgrades.length) {
      const index = Math.floor(Math.random() * availableUpgrades.length);
      if (!usedIndices.has(index)) {
        usedIndices.add(index);
        selectedUpgrades.push(availableUpgrades[index]);
      }
    }

    if (selectedUpgrades.length === 3) {
      setGameState(prev => ({
        ...prev,
        temporaryUpgrades: selectedUpgrades,
        lastTemporaryUpgrade: now,
        waitingForSelection: true
      }));
    }
  }, [gameState.lastTemporaryUpgrade, gameState.ascensionLevel, gameState.waitingForSelection]);

  const selectTemporaryUpgrade = (upgrade: TemporaryUpgrade) => {
    setGameState(prev => {
      const reputationChange = upgrade.reputationChange;
      const climateChange = upgrade.climateChange;
      const newReputation = Math.max(0, Math.min(100, prev.reputation + reputationChange));
      const newClimate = Math.min(MAX_CLIMATE, Math.max(0, prev.climate + climateChange));

      logAnalyticsEvent('temporary_upgrade_selected', {
        upgradeId: upgrade.id,
        reputationChange,
        climateChange
      });

      return {
        ...prev,
        reputation: newReputation,
        climate: newClimate,
        moneyPerSecond: prev.moneyPerSecond * upgrade.moneyMultiplier,
        temporaryUpgrades: null,
        lastTemporaryUpgrade: Date.now(),
        waitingForSelection: false
      };
    });
  };

  const isGameOver = () => {
    return gameState.climate >= CLIMATE_DANGER_THRESHOLD || gameState.reputation <= REPUTATION_DANGER_THRESHOLD;
  };

  const ascend = () => {
    if (!gameState.canRenaissance || (!isGameOver() && gameState.ascensionLevel === 0)) return;

    logAnalyticsEvent('player_ascended', {
      previousLevel: gameState.ascensionLevel,
      lifetimeEarnings: gameState.lifetimeEarnings
    });

    setGameState(prev => {
      // Calcul du bonus basé sur les revenus à vie
      const baseBonus = prev.lifetimeEarnings * (0.2 + prev.ascensionLevel * 0.1);
      // On prend le maximum entre le bonus calculé et 400
      const startingMoney = Math.max(baseBonus, 400);

      return {
        money: startingMoney,
        moneyPerSecond: 0,
        reputation: 100,
        climate: 0,
        upgrades: Object.fromEntries(
          Object.entries(INITIAL_UPGRADES).map(([key, upgrade]) => [
            key,
            { ...upgrade, count: 0 }
          ])
        ),
        lastTick: Date.now(),
        ascensionLevel: prev.ascensionLevel + 1,
        lifetimeEarnings: prev.lifetimeEarnings,
        canRenaissance: false,
        temporaryUpgrades: null,
        lastTemporaryUpgrade: Date.now(),
        waitingForSelection: false
      };
    });
  };

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      const now = Date.now();
      const delta = (now - prev.lastTick) / 1000;

      let totalIncome = 0;
      let reputationChange = 0;
      let climateChange = 0;

      Object.values(prev.upgrades).forEach(upgrade => {
        if (upgrade.requiresAscension && prev.ascensionLevel === 0) return;
        const multiplier = 1 + prev.ascensionLevel * 0.2;
        totalIncome += upgrade.baseIncome * upgrade.count * multiplier;
        reputationChange += upgrade.reputation * upgrade.count;
        climateChange += upgrade.climate * upgrade.count;
      });

      const newMoney = prev.money + totalIncome * delta;
      const newLifetimeEarnings = prev.lifetimeEarnings + totalIncome * delta;
      const newReputation = Math.max(0, Math.min(100, prev.reputation + (reputationChange * delta)));
      const newClimate = Math.min(MAX_CLIMATE, Math.max(0, prev.climate + (climateChange * delta)));

      const wasGameOver = isGameOver();
      const isNowGameOver = newClimate >= CLIMATE_DANGER_THRESHOLD || newReputation <= REPUTATION_DANGER_THRESHOLD;

      if (isNowGameOver && !wasGameOver) {
        logAnalyticsEvent('game_over', {
          climate: newClimate,
          reputation: newReputation,
          lifetimeEarnings: newLifetimeEarnings
        });
      }

      const newCanRenaissance = (!wasGameOver && isNowGameOver) || prev.canRenaissance;

      if (isNowGameOver) {
        return {
          ...prev,
          money: prev.money,
          moneyPerSecond: 0,
          reputation: newReputation,
          climate: newClimate,
          lastTick: now,
          lifetimeEarnings: newLifetimeEarnings,
          canRenaissance: newCanRenaissance
        };
      }

      return {
        ...prev,
        money: newMoney,
        moneyPerSecond: totalIncome,
        reputation: newReputation,
        climate: newClimate,
        lastTick: now,
        lifetimeEarnings: newLifetimeEarnings,
        canRenaissance: newCanRenaissance
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(gameLoop, 100);
    return () => clearInterval(interval);
  }, [gameLoop]);

  useEffect(() => {
    const interval = setInterval(generateTemporaryUpgrades, 1000);
    return () => clearInterval(interval);
  }, [generateTemporaryUpgrades]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSignUpSuccess(false);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSignUpSuccess(true);
        setAuthError("Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception et confirmer votre compte avant de vous connecter.");
        logAnalyticsEvent('sign_up_completed');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === 'Email not confirmed') {
            throw new Error("Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.");
          }
          throw error;
        }
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        logAnalyticsEvent('login_completed');
      }
    } catch (error) {
      setAuthError(error.message);
      logAnalyticsEvent('auth_error', { error: error.message });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      logAnalyticsEvent('user_logged_out');
      setGameState({
        money: INITIAL_MONEY,
        moneyPerSecond: 0,
        reputation: 100,
        climate: 0,
        upgrades: INITIAL_UPGRADES,
        lastTick: Date.now(),
        ascensionLevel: 0,
        lifetimeEarnings: 0,
        canRenaissance: true,
        temporaryUpgrades: null,
        lastTemporaryUpgrade: Date.now(),
        waitingForSelection: false
      });
      setSaveId(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const gameOverMessage = () => {
    if (gameState.climate >= CLIMATE_DANGER_THRESHOLD) {
      return "Game Over : La crise climatique a atteint un niveau critique !";
    }
    if (gameState.reputation <= REPUTATION_DANGER_THRESHOLD) {
      return "Game Over : Votre réputation est totalement ruinée !";
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f7]">
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">{isSignUp ? 'Créer un compte' : 'Se connecter'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              {authError && (
                <div className={`text-sm ${signUpSuccess ? 'text-green-600' : 'text-red-500'} bg-opacity-10 p-3 rounded-lg ${signUpSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                  setSignUpSuccess(false);
                }}
                className="w-full text-purple-500 underline text-sm"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError('');
                  setSignUpSuccess(false);
                }}
                className="w-full text-gray-500 text-sm"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4">
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              <LogIn size={20} />
              <span>Se connecter</span>
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Connecté en tant que {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Capitalism Clicker</h1>
          <div className="stats flex justify-center gap-8 mb-4">
            <div className="stat">
              <div className="text-2xl font-bold">${gameState.money.toFixed(2)}</div>
              <div className="text-sm text-gray-600">+${gameState.moneyPerSecond.toFixed(2)}/s</div>
            </div>
            <div className="stat">
              <div className="text-2xl font-bold">{gameState.reputation.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Réputation</div>
            </div>
            <div className="stat">
              <div className="text-2xl font-bold">{gameState.climate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Crise Climatique</div>
            </div>
            <div className="stat">
              <div className="text-2xl font-bold">{gameState.ascensionLevel}</div>
              <div className="text-sm text-gray-600">Niveau de Renaissance</div>
            </div>
          </div>

          {isGameOver() && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="mr-2" />
                  <p>{gameOverMessage()}</p>
                </div>
                {gameState.canRenaissance && (
                  <p className="text-purple-600 font-semibold animate-pulse">
                    Une nouvelle voie s'ouvre à vous... Cliquez sur le bouton Renaissance pour découvrir des options plus éthiques !
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleClick}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-8 transition-transform transform hover:scale-105 active:scale-95"
              disabled={isGameOver()}
            >
              <DollarSign size={48} />
            </button>

            {((isGameOver() && gameState.canRenaissance) || gameState.ascensionLevel > 0) && (
              <div className="flex flex-col items-center">
                <button
                  onClick={ascend}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-8 transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center relative"
                  title="Renaissance : Recommencer avec des options éthiques"
                >
                  <Sparkles size={48} />
                  {isGameOver() && gameState.canRenaissance && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  )}
                </button>
                <span className="mt-2 text-sm font-medium text-purple-600">Renaissance</span>
              </div>
            )}
          </div>
        </div>

        {gameState.temporaryUpgrades && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Opportunités Spéciales</h2>
            <div className="space-y-4">
              {gameState.temporaryUpgrades.map((upgrade) => {
                const Icon = iconMap[upgrade.icon];
                return (
                  <button
                    key={upgrade.id}
                    onClick={() => selectTemporaryUpgrade(upgrade)}
                    className={`w-full p-3 rounded-lg shadow-sm transition-colors ${
                      upgrade.ethical ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {Icon && <Icon size={16} className={upgrade.ethical ? 'text-green-600' : 'text-red-600'} />}
                      <h3 className="font-bold text-sm">{upgrade.name}</h3>
                    </div>
                    <p className="text-xs mb-1">{upgrade.description}</p>
                    <div className="text-xs">
                      <div>×{upgrade.moneyMultiplier} argent</div>
                      <div className={upgrade.reputationChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {upgrade.reputationChange > 0 ? '+' : ''}{upgrade.reputationChange} réputation
                      </div>
                      <div className={upgrade.climateChange <= 0 ? 'text-green-600' : 'text-red-600'}>
                        {upgrade.climateChange > 0 ? '+' : ''}{upgrade.climateChange}% climat
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(gameState.upgrades).map(upgrade => {
            if (upgrade.ethical && gameState.ascensionLevel === 0) return null;
            
            const cost = calculateUpgradeCost(upgrade);
            const isLocked = upgrade.requiresAscension && gameState.ascensionLevel === 0;
            const Icon = iconMap[upgrade.icon];

            return (
              <div key={upgrade.id} className={`bg-white rounded-lg shadow-md p-4 ${isLocked ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">{upgrade.name}</h3>
                  <span className="text-sm text-gray-600">Possédé: {upgrade.count}</span>
                </div>
                {Icon && <Icon size={24} className="mb-2" />}
                <p className="text-sm text-gray-600 mb-2">
                  {isLocked ? '🔒 Nécessite une Renaissance' : upgrade.description}
                </p>
                <div className="text-sm mb-2">
                  <div>Revenu: +${upgrade.baseIncome}/s</div>
                  <div className={upgrade.reputation >= 0 ? 'text-green-500' : 'text-red-500'}>
                    Réputation: {upgrade.reputation > 0 ? '+' : ''}{upgrade.reputation}/s
                  </div>
                  <div className={upgrade.climate <= 0 ? 'text-green-500' : 'text-orange-500'}>
                    Impact Climatique: {upgrade.climate > 0 ? '+' : ''}{upgrade.climate}%/s
                  </div>
                </div>
                <button
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={gameState.money < cost || isLocked || isGameOver()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
                >
                  Acheter (${cost.toFixed(2)})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;