export const PIXAR_AGENTS = [
  { id: 1, name: 'Agent Marcus', gender: 'male', race: 'black', age: 'young', hair: 'fade', build: 'athletic', image: '/agents/young_black_man_mib_suit.png' },
  { id: 2, name: 'Agent Mei', gender: 'female', race: 'asian', age: 'young', hair: 'black-long', build: 'petite', image: '/agents/young_asian_woman_mib_suit.png' },
  { id: 3, name: 'Agent James', gender: 'male', race: 'white', age: 'middle', hair: 'brown-gray', build: 'athletic', facial: 'beard', image: '/agents/middle-aged_white_man_beard.png' },
  { id: 4, name: 'Agent Sofia', gender: 'female', race: 'hispanic', age: 'young', hair: 'brown-curly', build: 'curvy', image: '/agents/young_latina_woman_curly_hair.png' },
  { id: 5, name: 'Agent Gloria', gender: 'female', race: 'black', age: 'senior', hair: 'gray', build: 'elegant', image: '/agents/senior_black_woman_gray_hair.png' },
  { id: 6, name: 'Agent Raj', gender: 'male', race: 'indian', age: 'young', hair: 'black', build: 'slim', image: '/agents/young_indian_man_slim_build.png' },
  { id: 7, name: 'Agent Layla', gender: 'female', race: 'middle-eastern', age: 'middle', hair: 'dark-wavy', build: 'medium', image: '/agents/middle-aged_middle_eastern_woman.png' },
  { id: 8, name: 'Agent Devon', gender: 'male', race: 'mixed', age: 'young', hair: 'afro', build: 'tall', image: '/agents/young_mixed_race_man_afro.png' },
  { id: 9, name: 'Agent Walter', gender: 'male', race: 'white', age: 'senior', hair: 'bald', build: 'stocky', image: '/agents/senior_bald_white_man_stocky.png' },
  { id: 10, name: 'Agent Ken', gender: 'male', race: 'asian', age: 'young', hair: 'undercut', build: 'slim', image: '/agents/young_asian_man_undercut_hair.png' },
  { id: 11, name: 'Agent Sarah', gender: 'female', race: 'white', age: 'young', hair: 'blonde-ponytail', build: 'tall-athletic', image: '/agents/young_blonde_woman_ponytail.png' },
  { id: 12, name: 'Agent Darius', gender: 'male', race: 'black', age: 'middle', hair: 'bald', build: 'muscular', facial: 'goatee', image: '/agents/middle-aged_black_man_goatee_bald.png' },
  { id: 13, name: 'Agent Emma', gender: 'female', race: 'white', age: 'young', hair: 'red-pixie', build: 'petite', image: '/agents/young_redhead_woman_pixie_cut.png' },
  { id: 14, name: 'Agent Carlos', gender: 'male', race: 'hispanic', age: 'senior', hair: 'gray', build: 'medium', facial: 'mustache', image: '/agents/senior_latino_man_gray_mustache.png' },
  { id: 15, name: 'Agent Zara', gender: 'female', race: 'black', age: 'young', hair: 'natural-afro', build: 'curvy', image: '/agents/young_black_woman_natural_afro.png' },
  { id: 16, name: 'Agent Priya', gender: 'female', race: 'indian', age: 'young', hair: 'brown-long', build: 'curvy', image: '/agents/young_indian_woman_long_hair.png' },
  { id: 17, name: 'Agent Richard', gender: 'male', race: 'white', age: 'middle', hair: 'gray', build: 'heavyset', facial: 'full-beard', image: '/agents/middle-aged_white_man_gray_beard_heavyset.png' },
  { id: 18, name: 'Agent Koa', gender: 'male', race: 'polynesian', age: 'young', hair: 'black-bun', build: 'muscular', image: '/agents/young_polynesian_man_muscular.png' },
  { id: 19, name: 'Agent Yuki', gender: 'female', race: 'asian', age: 'senior', hair: 'white-updo', build: 'slim-petite', image: '/agents/senior_asian_woman_white_hair.png' },
  { id: 20, name: 'Agent Ryan', gender: 'male', race: 'white', age: 'young', hair: 'brown-wavy', build: 'athletic', facial: 'stubble', image: '/agents/young_white_man_wavy_hair_stubble.png' },
  { id: 21, name: 'Agent Kwame', gender: 'male', race: 'african', age: 'young', hair: 'black-designs', build: 'tall-slim', image: '/agents/young_african_man_tall_slim.png' },
  { id: 22, name: 'Agent Akiko', gender: 'female', race: 'japanese', age: 'middle', hair: 'black-bob', build: 'slim', image: '/agents/middle-aged_japanese_woman_bob_cut.png' },
  { id: 23, name: 'Agent Blake', gender: 'male', race: 'white', age: 'young', hair: 'platinum-spiky', build: 'medium', image: '/agents/young_white_man_platinum_blonde_spiky.png' },
  { id: 24, name: 'Agent Earl', gender: 'male', race: 'black', age: 'senior', hair: 'white', build: 'medium', image: '/agents/senior_black_man_white_hair_distinguished.png' },
  { id: 25, name: 'Agent Luna', gender: 'female', race: 'hispanic', age: 'young', hair: 'dark-highlights', build: 'petite-slim', image: '/agents/young_latina_woman_highlights_petite.png' },
]

export const getAgentById = (id) => PIXAR_AGENTS.find(a => a.id === id)
export const getAgentsByGender = (gender) => PIXAR_AGENTS.filter(a => a.gender === gender)
export const getAgentsByRace = (race) => PIXAR_AGENTS.filter(a => a.race === race)
export const getAgentsByAge = (age) => PIXAR_AGENTS.filter(a => a.age === age)

export default PIXAR_AGENTS
