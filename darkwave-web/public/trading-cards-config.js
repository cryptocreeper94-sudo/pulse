// DarkWave NFT Trading Cards Configuration
console.log('✅ Trading Cards Configuration loaded');

const TRADING_CARDS = [
  // MALE AGENTS
  {
    id: 'DWCARD-001-M-ASIA',
    name: 'Agent Hikari',
    gender: 'Male',
    race: 'Asian',
    age: 'UNKNOWN',
    image: '/trading-cards/asian_male_agent_headshot.png',
    refractorColor: 'Neon Cyan Blue',
    careerNote: 'Decoded a classified trading algorithm that Goldman Sachs thought was unhackable',
    funFact: 'Meditates while reading smart contracts. His zen prevents panic sells.',
    serialNumber: 'DWCARD-001-M-ASIA-2025',
    qrCode: '/trading-cards/qr-001.png'
  },
  {
    id: 'DWCARD-002-M-CAUC-BLD',
    name: 'Agent Storm',
    gender: 'Male',
    race: 'Caucasian (Blonde)',
    age: 40,
    image: '/trading-cards/caucasian_blonde_male_agent.png',
    refractorColor: 'Electric Gold',
    careerNote: 'Built a trading bot that predicted the 2024 bull run with 94% accuracy',
    funFact: 'Calls every market move "obvious in hindsight" - but nails it every time.',
    serialNumber: 'DWCARD-002-M-CAUC-BLD-2025',
    qrCode: '/trading-cards/qr-002.png'
  },
  {
    id: 'DWCARD-003-M-CAUC-RED',
    name: 'Agent Phoenix',
    gender: 'Male',
    race: 'Caucasian (Redhead)',
    age: 35,
    image: '/trading-cards/caucasian_redhead_male_agent.png',
    refractorColor: 'Crimson Flame',
    careerNote: 'Survived 3 bear markets by pure technical analysis stubbornness',
    funFact: 'Has "HODL" tattooed in binary on his shoulder. Not kidding.',
    serialNumber: 'DWCARD-003-M-CAUC-RED-2025',
    qrCode: '/trading-cards/qr-003.png'
  },
  {
    id: 'DWCARD-004-M-CAUC-BRN',
    name: 'Agent Cipher',
    gender: 'Male',
    race: 'Caucasian (Brown)',
    age: 50,
    image: '/trading-cards/caucasian_brown-haired_male.png',
    refractorColor: 'Amber Gleam',
    careerNote: 'Wrote the playbook that 10,000 traders now follow (and lose money to)',
    funFact: 'Older than the internet. Calls Bitcoin "that hot new thing".',
    serialNumber: 'DWCARD-004-M-CAUC-BRN-2025',
    qrCode: '/trading-cards/qr-004.png'
  },
  {
    id: 'DWCARD-005-M-AA',
    name: 'Agent Obsidian',
    gender: 'Male',
    race: 'African American',
    age: 45,
    image: '/trading-cards/african_american_bald_male.png',
    refractorColor: 'Onyx Pulse',
    careerNote: 'Spotted a $500M exploit in Uniswap that the devs missed entirely',
    funFact: 'Bald by choice. Says it helps him think clearer. Market says he\'s right.',
    serialNumber: 'DWCARD-005-M-AA-2025',
    qrCode: '/trading-cards/qr-005.png'
  },
  {
    id: 'DWCARD-006-M-LATINO',
    name: 'Agent Frenzy',
    gender: 'Male',
    race: 'Latino',
    age: 38,
    image: '/trading-cards/latino_male_agent.png',
    refractorColor: 'Magenta Surge',
    careerNote: 'Turned $1K into $10M in 18 months (yes, really)',
    funFact: 'Trades faster than he thinks. His brain hasn\'t caught up yet.',
    serialNumber: 'DWCARD-006-M-LATINO-2025',
    qrCode: '/trading-cards/qr-006.png'
  },
  {
    id: 'DWCARD-007-M-MIX-ASIA-CAUC',
    name: 'Agent Nexus',
    gender: 'Male',
    race: 'Mixed (Asian-Caucasian)',
    age: 32,
    image: '/trading-cards/mixed_asian-caucasian_male.png',
    refractorColor: 'Prismatic Violet',
    careerNote: 'Connected 47 different data sources into one predictive model',
    funFact: 'Speaks 5 languages. Meme language is his favorite.',
    serialNumber: 'DWCARD-007-M-MIX-AC-2025',
    qrCode: '/trading-cards/qr-007.png'
  },
  {
    id: 'DWCARD-008-M-MIX-AA-CAUC',
    name: 'Agent Echo',
    gender: 'Male',
    race: 'Mixed (Black-Caucasian)',
    age: 36,
    image: '/trading-cards/mixed_black-caucasian_male.png',
    refractorColor: 'Holographic Silver',
    careerNote: 'Built the liquidity engine that never stops, ever',
    funFact: 'Thinks in candlesticks. Literally dreams in OHLC data.',
    serialNumber: 'DWCARD-008-M-MIX-AC2-2025',
    qrCode: '/trading-cards/qr-008.png'
  },
  {
    id: 'DWCARD-009-M-MIX-LATINO-ASIA',
    name: 'Agent Titan',
    gender: 'Male',
    race: 'Mixed (Latino-Asian)',
    age: 41,
    image: '/trading-cards/mixed_latino-asian_male.png',
    refractorColor: 'Steel Horizon',
    careerNote: 'Portfolio manager for 3 crypto hedge funds (all outperforming)',
    funFact: 'Speaks Spanish and trades in 47 currency pairs. Bullish on everything.',
    serialNumber: 'DWCARD-009-M-MIX-LA-2025',
    qrCode: '/trading-cards/qr-009.png'
  },
  {
    id: 'DWCARD-010-M-MIX-AA-LATINO',
    name: 'Agent Vortex',
    gender: 'Male',
    race: 'Mixed (Black-Latino)',
    age: 39,
    image: '/trading-cards/mixed_black-latino_male.png',
    refractorColor: 'Cosmic Indigo',
    careerNote: 'Discovered a pattern in memecoin launches that nobody else sees',
    funFact: 'Can smell a rug pull from 3 chains away. Literally has a 6th sense.',
    serialNumber: 'DWCARD-010-M-MIX-BL-2025',
    qrCode: '/trading-cards/qr-010.png'
  },
  
  // FEMALE AGENTS
  {
    id: 'DWCARD-011-F-ASIA',
    name: 'Agent Nova',
    gender: 'Female',
    race: 'Asian',
    age: 29,
    image: '/trading-cards/asian_female_agent.png',
    refractorColor: 'Cyber Pink',
    careerNote: 'Youngest person ever to audit a Fortune 500 crypto treasury',
    funFact: 'Finds security bugs for fun. Literally posted them on Reddit.',
    serialNumber: 'DWCARD-011-F-ASIA-2025',
    qrCode: '/trading-cards/qr-011.png'
  },
  {
    id: 'DWCARD-012-F-CAUC-BLD',
    name: 'Agent Aurora',
    gender: 'Female',
    race: 'Caucasian (Blonde)',
    age: 35,
    image: '/trading-cards/caucasian_blonde_female.png',
    refractorColor: 'Pearl Shimmer',
    careerNote: 'Invented a new type of technical indicator that outperforms RSI',
    funFact: 'Has a PhD in mathematics. Still prefers vibes-based trading.',
    serialNumber: 'DWCARD-012-F-CAUC-BLD-2025',
    qrCode: '/trading-cards/qr-012.png'
  },
  {
    id: 'DWCARD-013-F-CAUC-RED',
    name: 'Agent Inferno',
    gender: 'Female',
    race: 'Caucasian (Redhead)',
    age: 31,
    image: '/trading-cards/caucasian_red-haired_female.png',
    refractorColor: 'Scarlet Blaze',
    careerNote: 'Managed a $200M fund with zero losing months in 2024',
    funFact: 'Red hair = red hot portfolio. (Correlation = causation, obviously)',
    serialNumber: 'DWCARD-013-F-CAUC-RED-2025',
    qrCode: '/trading-cards/qr-013.png'
  },
  {
    id: 'DWCARD-014-F-CAUC-BRN',
    name: 'Agent Sage',
    gender: 'Female',
    race: 'Caucasian (Brown)',
    age: 42,
    image: '/trading-cards/caucasian_brown-haired_female.png',
    refractorColor: 'Bronze Mystique',
    careerNote: 'Advised 12 startups. 11 became unicorns. (1 was, uh... learning experience)',
    funFact: 'Been in crypto since 2011. Still doesn\'t understand memes. Buys them anyway.',
    serialNumber: 'DWCARD-014-F-CAUC-BRN-2025',
    qrCode: '/trading-cards/qr-014.png'
  },
  {
    id: 'DWCARD-015-F-AA',
    name: 'Agent Ethereal',
    gender: 'Female',
    race: 'African American',
    age: 38,
    image: '/trading-cards/african_american_female_agent.png',
    refractorColor: 'Amethyst Glow',
    careerNote: 'First woman to successfully arbitrage across 5 DEXs simultaneously',
    funFact: 'Trades with her eyes closed sometimes. Doesn\'t need them apparently.',
    serialNumber: 'DWCARD-015-F-AA-2025',
    qrCode: '/trading-cards/qr-015.png'
  },
  {
    id: 'DWCARD-016-F-LATINA',
    name: 'Agent Solera',
    gender: 'Female',
    race: 'Latina',
    age: 33,
    image: '/trading-cards/latina_female_agent.png',
    refractorColor: 'Royal Violet',
    careerNote: 'Built a community of 500K traders who follow her signals daily',
    funFact: 'Her trading alerts are faster than most APIs. She\'s basically superhuman.',
    serialNumber: 'DWCARD-016-F-LATINA-2025',
    qrCode: '/trading-cards/qr-016.png'
  },
  {
    id: 'DWCARD-017-F-MIX-ASIA-CAUC',
    name: 'Agent Lyra',
    gender: 'Female',
    race: 'Mixed (Asian-Caucasian)',
    age: 27,
    image: '/trading-cards/mixed_asian-caucasian_female.png',
    refractorColor: 'Opalescent Sky',
    careerNote: 'Youngest VP at a major crypto exchange (promoted at 26)',
    funFact: 'Trades on her phone. While shopping. Probably while sleeping too.',
    serialNumber: 'DWCARD-017-F-MIX-AC-2025',
    qrCode: '/trading-cards/qr-017.png'
  },
  {
    id: 'DWCARD-018-F-MIX-AA-CAUC',
    name: 'Agent Zephyr',
    gender: 'Female',
    race: 'Mixed (Black-Caucasian)',
    age: 34,
    image: '/trading-cards/mixed_black-caucasian_female.png',
    refractorColor: 'Emerald Whisper',
    careerNote: 'Decoded smart contract vulnerabilities that prevented $2B in hacks',
    funFact: 'Speaks code fluently. Humans... she\'s still working on that.',
    serialNumber: 'DWCARD-018-F-MIX-AC2-2025',
    qrCode: '/trading-cards/qr-018.png'
  },
  {
    id: 'DWCARD-019-F-MIX-LATINA-ASIA',
    name: 'Agent Iris',
    gender: 'Female',
    race: 'Mixed (Latina-Asian)',
    age: 30,
    image: '/trading-cards/mixed_latina-asian_female.png',
    refractorColor: 'Topaz Aurora',
    careerNote: 'Designed tokenomics for projects worth combined $5B market cap',
    funFact: 'Designs meme coins that somehow pass audits. Dark magic confirmed.',
    serialNumber: 'DWCARD-019-F-MIX-LA-2025',
    qrCode: '/trading-cards/qr-019.png'
  },
  {
    id: 'DWCARD-020-F-MIX-AA-LATINA',
    name: 'Agent Vesper',
    gender: 'Female',
    race: 'Mixed (Black-Latina)',
    age: 28,
    image: '/trading-cards/mixed_black-latina_female.png',
    refractorColor: 'Sapphire Dusk',
    careerNote: 'Arbitrage queen: spotted 47 market inefficiencies that nobody else saw',
    funFact: 'Trades 24/7. Literally. Doesn\'t sleep. Has probably achieved enlightenment.',
    serialNumber: 'DWCARD-020-F-MIX-BL-2025',
    qrCode: '/trading-cards/qr-020.png'
  }
];

// Hallmark Serial Generator (matching user preference)
function generateHallmarkSerial(cardId) {
  return cardId.replace('-2025', `-${Date.now().toString().slice(-6)}`);
}

// Get card by ID
function getTradingCardById(id) {
  return TRADING_CARDS.find(card => card.id === id);
}

// Get random card
function getRandomTradingCard() {
  return TRADING_CARDS[Math.floor(Math.random() * TRADING_CARDS.length)];
}

// Export
window.TRADING_CARDS = TRADING_CARDS;
window.generateHallmarkSerial = generateHallmarkSerial;
window.getTradingCardById = getTradingCardById;
window.getRandomTradingCard = getRandomTradingCard;

console.log(`✅ ${TRADING_CARDS.length} NFT Trading Cards loaded - Ready for carousel`);
