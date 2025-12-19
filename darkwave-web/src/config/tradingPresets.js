export const TRADING_PRESETS = {
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    icon: '🛡️',
    tagline: 'Prefer a calmer pace?',
    description: 'Conservative approach with strict safety filters. Lower risk, steadier gains. Best for capital preservation.',
    color: '#00D4FF',
    colorRgb: '0, 212, 255',
    tradeConfig: {
      buyAmountSol: 0.25,
      stopLossPercent: 12,
      takeProfitPercent: 22,
    },
    safetyFilters: {
      minLiquidityUsd: 20000,
      maxBotPercent: 50,
      minHolders: 100,
      maxTop10HoldersPercent: 60,
    },
  },
  pathfinder: {
    id: 'pathfinder',
    name: 'Pathfinder',
    icon: '⚖️',
    tagline: 'Balance risk & reward',
    description: 'Balanced strategy for consistent performance. Moderate risk with solid upside potential.',
    color: '#8B5CF6',
    colorRgb: '139, 92, 246',
    tradeConfig: {
      buyAmountSol: 0.5,
      stopLossPercent: 18,
      takeProfitPercent: 35,
    },
    safetyFilters: {
      minLiquidityUsd: 10000,
      maxBotPercent: 65,
      minHolders: 75,
      maxTop10HoldersPercent: 70,
    },
  },
  velocity: {
    id: 'velocity',
    name: 'Velocity',
    icon: '🚀',
    tagline: 'Chase the momentum',
    description: 'Aggressive approach for experienced traders. Higher risk, maximum upside on volatile plays.',
    color: '#39FF14',
    colorRgb: '57, 255, 20',
    tradeConfig: {
      buyAmountSol: 0.75,
      stopLossPercent: 25,
      takeProfitPercent: 55,
    },
    safetyFilters: {
      minLiquidityUsd: 5000,
      maxBotPercent: 80,
      minHolders: 50,
      maxTop10HoldersPercent: 80,
    },
  },
}

export const PRESET_ORDER = ['guardian', 'pathfinder', 'velocity']

export const getPresetById = (id) => TRADING_PRESETS[id] || TRADING_PRESETS.pathfinder

export const getPresetConfig = (id) => {
  const preset = getPresetById(id)
  return {
    safetyFilters: {
      minLiquidityUsd: preset.safetyFilters.minLiquidityUsd,
      maxBotPercent: preset.safetyFilters.maxBotPercent,
      maxTop10HoldersPercent: preset.safetyFilters.maxTop10HoldersPercent,
    },
    discoveryFilters: {
      minHolders: preset.safetyFilters.minHolders,
    },
    tradeControls: {
      buyAmountSol: preset.tradeConfig.buyAmountSol,
      stopLossPercent: preset.tradeConfig.stopLossPercent,
      takeProfitPercent: preset.tradeConfig.takeProfitPercent,
    },
    autoModeSettings: {},
  }
}

export const getPresetDisplayValues = (id) => {
  const preset = getPresetById(id)
  return {
    ...preset.tradeConfig,
    ...preset.safetyFilters,
  }
}

export default TRADING_PRESETS
