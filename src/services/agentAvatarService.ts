import { agentPersonas, AgentPersonaId, AgentPersona } from '../mastra/ai/agentPersonas';

interface AvatarConfig {
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  facialHair: string;
  accessories: string;
  clothing: string;
  background: string;
}

const raceToSkinTone: Record<string, string> = {
  'Caucasian': 'f0c08a',
  'Asian': 'd4a574',
  'Black': '5c3d2e',
  'Hispanic': 'c68642',
  'South Asian': '8d5524',
  'Middle Eastern': 'c68642',
  'Mixed': '9f8170',
};

const hairColorToHex: Record<string, string> = {
  'Black': '1a1a1a',
  'Brown': '6a4e42',
  'Blonde': 'd4a76a',
  'Red': '8b3a3a',
  'Gray': '888888',
  'White': 'e0e0e0',
  'Auburn': 'a55d35',
  'Silver': 'c0c0c0',
};

const maleHairStyles = ['short', 'buzzcut', 'medium', 'mohawk', 'dreads', 'cornrows'];
const femaleHairStyles = ['long', 'bob', 'pixie', 'braids', 'ponytail', 'curly', 'wavy'];

const maleAccessories = ['none', 'glasses', 'sunglasses', 'headphones', 'cap-backwards', 'chain-necklace', 'watch'];
const femaleAccessories = ['none', 'glasses', 'sunglasses', 'earrings', 'necklace', 'headphones'];

const youngClothing = ['hoodie', 'tshirt', 'casual', 'crypto', 'tank-top'];
const middleClothing = ['casual', 'blazer', 'polo', 'vest', 'sweater'];
const seniorClothing = ['suit', 'blazer', 'polo', 'sweater', 'jacket'];

const backgrounds = ['dark', 'space', 'ocean', 'neon', 'crypto', 'forest'];

function getRandomFromArray<T>(arr: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return arr[Math.abs(hash) % arr.length];
}

function generateAvatarConfig(agent: AgentPersona): AvatarConfig {
  const skinTone = raceToSkinTone[agent.race] || 'c68642';
  const hairColor = hairColorToHex[agent.hairColor] || '1a1a1a';
  
  const hairStyles = agent.gender === 'male' ? maleHairStyles : femaleHairStyles;
  const hairStyle = getRandomFromArray(hairStyles, agent.id + 'hair');
  
  const accessoryList = agent.gender === 'male' ? maleAccessories : femaleAccessories;
  const accessories = getRandomFromArray(accessoryList, agent.id + 'acc');
  
  let clothingList: string[];
  if (agent.age === 'young') clothingList = youngClothing;
  else if (agent.age === 'middle') clothingList = middleClothing;
  else clothingList = seniorClothing;
  
  const clothing = getRandomFromArray(clothingList, agent.id + 'cloth');
  const background = getRandomFromArray(backgrounds, agent.id + 'bg');
  
  const facialHair = agent.gender === 'male' 
    ? getRandomFromArray(['none', 'none', 'stubble', 'goatee', 'mustache'], agent.id + 'beard')
    : 'none';

  return {
    skinTone,
    hairColor,
    hairStyle,
    facialHair,
    accessories,
    clothing,
    background
  };
}

function buildDicebearUrl(agent: AgentPersona, config: AvatarConfig, size: number = 200): string {
  const style = 'notionists';
  const seed = agent.name;
  
  const bgColorMap: Record<string, string> = {
    'dark': '0f0f0f',
    'space': '0b0c10',
    'ocean': '0d1b2a',
    'neon': '1a1a2e',
    'crypto': '1a1a1a',
    'forest': '0f1419'
  };
  
  const backgroundColor = bgColorMap[config.background] || '0f0f0f';
  
  const params = new URLSearchParams({
    seed: seed,
    backgroundColor: backgroundColor,
    size: size.toString(),
    skinColor: config.skinTone
  });
  
  return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
}

export interface AgentAvatarData {
  id: AgentPersonaId;
  name: string;
  displayName: string;
  avatarUrl: string;
  config: AvatarConfig;
}

export function generateAgentAvatar(agentId: AgentPersonaId, size: number = 200): AgentAvatarData {
  const agent = agentPersonas[agentId];
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }
  
  const config = generateAvatarConfig(agent);
  const avatarUrl = buildDicebearUrl(agent, config, size);
  
  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.displayName,
    avatarUrl,
    config
  };
}

export function generateAllAgentAvatars(size: number = 200): AgentAvatarData[] {
  const avatars: AgentAvatarData[] = [];
  
  for (const agentId of Object.keys(agentPersonas) as AgentPersonaId[]) {
    avatars.push(generateAgentAvatar(agentId, size));
  }
  
  return avatars;
}

export function getAgentAvatarUrl(agentId: AgentPersonaId, size: number = 200): string {
  return generateAgentAvatar(agentId, size).avatarUrl;
}

export const agentAvatarService = {
  generateAgentAvatar,
  generateAllAgentAvatars,
  getAgentAvatarUrl
};
