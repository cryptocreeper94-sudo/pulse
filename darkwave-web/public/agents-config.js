// Agent Series Configuration - 16 diverse agents with career highlights and fun facts
console.log('✅ Agent Series Configuration loaded');

const AGENTS = [
  {
    id: 1,
    name: 'Agent Alex',
    image: '/agent-avatars/black_female_agent_-_business_suit.png',
    title: 'Security Analyst',
    careerHighlight: 'Cracked a $100M ransomware network that the FBI had been chasing for 2 years',
    funFact: 'Memorized the Bitcoin whitepaper backwards. Literally. For fun.',
    race: 'Black',
    gender: 'Female'
  },
  {
    id: 2,
    name: 'Agent Marcus',
    image: '/agent-avatars/asian_male_agent_-_corporate_style.png',
    title: 'Data Scientist',
    careerHighlight: 'Predicted the 2024 bull market 3 months before it happened using only price data',
    funFact: 'Can identify any coin by its chart pattern in under 5 seconds',
    race: 'Asian',
    gender: 'Male'
  },
  {
    id: 3,
    name: 'Agent Sofia',
    image: '/agent-avatars/latina_female_agent_-_professional.png',
    title: 'Blockchain Engineer',
    careerHighlight: 'Designed the liquidity protocol that saved a $50M DeFi platform from collapse',
    funFact: 'Learned Solidity in 2 weeks. Now teaches it to Wall Street traders.',
    race: 'Latina',
    gender: 'Female'
  },
  {
    id: 4,
    name: 'Agent Raj',
    image: '/agent-avatars/south_asian_male_agent_-_burgundy_suit.png',
    title: 'Portfolio Manager',
    careerHighlight: 'Managed a $500M crypto portfolio that outperformed Wall Street by 300%',
    funFact: 'Codes trading bots while meditating. Seriously.',
    race: 'South Asian',
    gender: 'Male'
  },
  {
    id: 5,
    name: 'Agent Layla',
    image: '/agent-avatars/middle_eastern_female_agent_-_grey_suit.png',
    title: 'Risk Manager',
    careerHighlight: 'Built the risk model that prevented a $200M algorithmic trading disaster',
    funFact: 'Knows every exploit in DeFi history. By heart.',
    race: 'Middle Eastern',
    gender: 'Female'
  },
  {
    id: 6,
    name: 'Agent Blake',
    image: '/agent-avatars/white_male_agent_-_sunglasses_style.png',
    title: 'Market Analyst',
    careerHighlight: 'Called the bottom of the last three bear markets. Exactly.',
    funFact: 'Sleeps with 2 monitors showing live crypto charts. No, seriously.',
    race: 'White',
    gender: 'Male'
  },
  {
    id: 7,
    name: 'Agent Devon',
    image: '/agent-avatars/black_male_agent_-_navy_suit.png',
    title: 'Compliance Officer',
    careerHighlight: 'Navigated a crypto company through regulatory hell and came out untouched',
    funFact: 'Reads 500+ page regulatory documents for fun. Yes, for fun.',
    race: 'Black',
    gender: 'Male'
  },
  {
    id: 8,
    name: 'Agent Aria',
    image: '/agent-avatars/indigenous_female_agent_-_teal_suit.png',
    title: 'Community Manager',
    careerHighlight: 'Built a 100K member community from zero. Now it self-governs.',
    funFact: 'Can talk markets in 7 languages. Still prefers memes.',
    race: 'Indigenous',
    gender: 'Female'
  },
  {
    id: 9,
    name: 'Agent Mei',
    image: '/agent-avatars/southeast_asian_female_agent_-_burgundy.png',
    title: 'Technical Architect',
    careerHighlight: 'Designed the infrastructure handling 1M transactions per second',
    funFact: 'Debugged a critical smart contract bug with only console.log statements',
    race: 'Southeast Asian',
    gender: 'Female'
  },
  {
    id: 10,
    name: 'Agent Claire',
    image: '/agent-avatars/white_female_agent_-_black_suit.png',
    title: 'Strategic Advisor',
    careerHighlight: 'Advised 5 crypto projects that became unicorns worth $1B+',
    funFact: 'Sees market trends 6 months before they happen. Has a secret method.',
    race: 'White',
    gender: 'Female'
  },
  {
    id: 11,
    name: 'Agent Vikram',
    image: '/agent-avatars/east_indian_male_agent_-_teal_blazer.png',
    title: 'Smart Contract Auditor',
    careerHighlight: 'Found a vulnerability in a $2B smart contract nobody else saw coming',
    funFact: 'Codes in Rust while reviewing Solidity. Multi-tasking level 9000.',
    race: 'East Indian',
    gender: 'Male'
  },
  {
    id: 12,
    name: 'Agent Zara',
    image: '/agent-avatars/african_female_agent_-_emerald_suit.png',
    title: 'Growth Hacker',
    careerHighlight: 'Took a crypto project from 1K to 1M users in 6 months using pure strategy',
    funFact: 'Can predict user behavior better than AI models. Actually supernatural.',
    race: 'African',
    gender: 'Female'
  },
  {
    id: 13,
    name: 'Agent Marco',
    image: '/agent-avatars/mediterranean_male_agent_-_cream_blazer.png',
    title: 'Market Maker',
    careerHighlight: 'Provides liquidity for 50+ trading pairs with 99.9% uptime',
    funFact: 'Can spot a pump-and-dump from across the room. It\'s a gift.',
    race: 'Mediterranean',
    gender: 'Male'
  },
  {
    id: 14,
    name: 'Agent Jade',
    image: '/agent-avatars/east_asian_female_agent_-_purple_highlights.png',
    title: 'Quantum Analyst',
    careerHighlight: 'Applied quantum computing to crypto price prediction with 78% accuracy',
    funFact: 'Thinks in superposition. Both bullish AND bearish at the same time.',
    race: 'East Asian',
    gender: 'Female'
  },
  {
    id: 15,
    name: 'Agent Luis',
    image: '/agent-avatars/latin_american_male_agent_-_striped_shirt.png',
    title: 'Tokenomics Designer',
    careerHighlight: 'Designed token models that achieved 80% user retention (industry avg 10%)',
    funFact: 'Can balance a complex tokenomics system in his sleep. Literally happened once.',
    race: 'Latin American',
    gender: 'Male'
  },
  {
    id: 16,
    name: 'Agent Kaia',
    image: '/agent-avatars/pacific_islander_female_agent_-_coral_suit.png',
    title: 'Cultural Ambassador',
    careerHighlight: 'Built bridges between crypto culture and mainstream finance. Successfully.',
    funFact: 'Convinced her grandmother to buy Bitcoin. Now her gram hodls better than anyone.',
    race: 'Pacific Islander',
    gender: 'Female'
  },
  {
    id: 17,
    name: 'Agent Nova',
    image: '/agent-avatars/afro_caribbean_female_agent_-_gold_blazer.png',
    title: 'AI Integration Specialist',
    careerHighlight: 'Built the first AI trading system to beat 10,000+ human traders simultaneously',
    funFact: 'Codes with AI assistance and jokes that she\'s "collaborating with her future self."',
    race: 'Afro-Caribbean',
    gender: 'Female'
  },
  {
    id: 18,
    name: 'Agent Kai',
    image: '/agent-avatars/mixed_race_male_agent_-_silver_suit.png',
    title: 'Future Tech Architect',
    careerHighlight: 'Designed the decentralized network powering the next generation of Web4 platforms',
    funFact: 'Believes the future is already here. You just have to look at the blockchain.',
    race: 'Mixed Race',
    gender: 'Male'
  }
];

// Get a random agent
function getRandomAgent() {
  return AGENTS[Math.floor(Math.random() * AGENTS.length)];
}

// Get agent by ID
function getAgentById(id) {
  return AGENTS.find(a => a.id === id);
}

// Expose globally
window.AGENTS = AGENTS;
window.getRandomAgent = getRandomAgent;
window.getAgentById = getAgentById;
