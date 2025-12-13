export const safetyExplanations = {
  mintAuthority: {
    name: "Mint Authority",
    shortDesc: "Token supply control",
    description: "Mint authority allows the token creator to create new tokens at any time, potentially diluting your holdings to zero value.",
    whyItMatters: "If enabled, the creator can print unlimited tokens and dump them on the market, crashing the price. Safe tokens have this disabled (revoked).",
    safe: "Disabled - Cannot create new tokens",
    danger: "Active - Supply can be inflated anytime",
    impactScore: 20
  },
  freezeAuthority: {
    name: "Freeze Authority", 
    shortDesc: "Wallet freeze control",
    description: "Freeze authority allows the token creator to freeze any wallet holding the token, preventing you from selling or transferring.",
    whyItMatters: "If enabled, your tokens can be frozen at any moment, making them worthless and untradeable. This is a major red flag.",
    safe: "Disabled - Your wallet cannot be frozen",
    danger: "Active - Creator can freeze your tokens",
    impactScore: 20
  },
  liquidity: {
    name: "Liquidity Status",
    shortDesc: "Rug pull protection",
    description: "Liquidity is what allows you to swap tokens. Locked or burned liquidity means the creator cannot remove it and run away with investor funds.",
    whyItMatters: "Unlocked liquidity is the #1 way rug pulls happen. The creator adds liquidity, waits for people to buy, then removes it all, taking everyone's SOL/ETH.",
    safe: "Burned or locked - Rug pull protection active",
    warning: "Unlocked - Creator could remove liquidity",
    impactScore: 20
  },
  honeypot: {
    name: "Honeypot Check",
    shortDesc: "Can you actually sell?",
    description: "A honeypot is a token you can buy but cannot sell. The contract blocks sell transactions or applies 100% sell tax.",
    whyItMatters: "If you can't sell, your investment is trapped forever. This simulation tests if a sell transaction would succeed.",
    safe: "Can sell - Trade simulation passed",
    danger: "Cannot sell - This is a honeypot!",
    impactScore: 20
  },
  tokenAge: {
    name: "Token Age",
    shortDesc: "How new is this token?",
    description: "Very new tokens (under 1 hour) are much riskier. Most rug pulls happen within the first few hours of launch.",
    whyItMatters: "Older tokens have had time to build real communities and prove they're not scams. Brand new tokens are extremely risky.",
    levels: {
      safe: "> 24 hours - Established token",
      warning: "1-24 hours - Still new, be cautious",
      danger: "< 1 hour - Very high risk"
    },
    impactScore: 5
  },
  holderDistribution: {
    name: "Top 10 Holders",
    shortDesc: "Concentration risk",
    description: "Shows what percentage of the total supply is held by the top 10 wallets. High concentration means a few wallets can crash the price.",
    whyItMatters: "If top wallets hold 70%+ of supply, they can dump and crash the price 90% instantly. Well-distributed tokens are safer.",
    levels: {
      safe: "< 50% - Well distributed",
      warning: "50-70% - Moderate concentration",
      danger: "> 70% - High dump risk"
    },
    impactScore: 10
  },
  holderCount: {
    name: "Holder Count",
    shortDesc: "Community size",
    description: "Total number of unique wallets holding the token. More holders generally means a more established community.",
    whyItMatters: "Tokens with very few holders can be manipulated easily. A larger holder base provides more stability and liquidity.",
    levels: {
      safe: "> 100 holders - Good distribution",
      warning: "50-100 holders - Building community",
      danger: "< 50 holders - Very thin, high risk"
    },
    impactScore: 5
  },
  creatorRisk: {
    name: "Creator Risk Score",
    shortDesc: "Creator wallet history",
    description: "Analyzes the token creator's wallet history including previous tokens launched and their outcomes.",
    whyItMatters: "Creators with a history of failed tokens or rug pulls are likely to repeat the pattern. Check their track record.",
    levels: {
      safe: "0-40 - Clean history",
      warning: "40-70 - Some concerns",
      danger: "70-100 - High risk creator"
    },
    impactScore: 10
  }
}

export const gradeExplanations = {
  'A': {
    description: "Excellent safety profile. All major checks pass.",
    recommendation: "Lower risk, but always trade carefully and with proper position sizing."
  },
  'B': {
    description: "Good safety with minor concerns. Most checks pass.",
    recommendation: "Generally safer, but review any warnings before trading."
  },
  'C': {
    description: "Moderate risk. Some concerns need attention.",
    recommendation: "Exercise caution. Understand the risks before proceeding."
  },
  'D': {
    description: "High risk. Multiple red flags detected.",
    recommendation: "Significant risk. Only for experienced traders who understand the risks."
  },
  'F': {
    description: "Extreme risk. Major safety checks failed.",
    recommendation: "Avoid trading. High probability of loss."
  }
}

export const scoreBreakdown = {
  description: "The safety score (0-100) is calculated by starting at 100 and deducting points for each risk or warning found.",
  deductions: {
    risk: "-20 points per major risk (mint authority, freeze, unlocked LP, honeypot)",
    warning: "-5 points per warning (low holders, new token, high concentration)"
  }
}
