class PersonaManager {
  constructor() {
    this.STORAGE_KEY = 'darkwave-persona-mode';
    this.currentPersona = this.loadFromStorage();
    this.currentAgent = null;
    
    this.imageMap = {
      business: {
        explaining: '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png',
        facepalm: '/trading-cards/Grumpy_cat_facepalm_pose_2fdc5a6a.png',
        pointing: '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png',
        sitting: '/trading-cards/Grumpy_cat_arms_crossed_f8e46099.png'
      },
      casual: {
        explaining: '/trading-cards/Grumpy_cat_sideeye_pose_5e52df88.png',
        facepalm: '/trading-cards/Grumpy_cat_facepalm_pose_2fdc5a6a.png',
        pointing: '/trading-cards/Grumpy_cat_sideeye_pose_5e52df88.png',
        sitting: '/trading-cards/Grumpy_cat_arms_crossed_f8e46099.png',
        sunglasses: '/trading-cards/Grumpy_cat_fist_pump_e028a55a.png'
      }
    };
    
    this.agentQuotes = [
      "Intel confirmed. Markets are moving.",
      "Running analysis protocols now.",
      "My sources indicate volatility ahead.",
      "Asset acquired. Monitoring commenced.",
      "Pattern recognition complete.",
      "Field report: Market conditions optimal.",
      "Decrypting market signals...",
      "Threat level: manageable. Proceed.",
      "Asset verified. Trust rating: high.",
      "Surveillance complete. Data secured.",
      "Neural network analysis in progress.",
      "Target acquired. Initiating deep scan.",
      "Blockchain intel verified.",
      "Risk assessment: calculated.",
      "Signal intercepted. Processing...",
      "Market infiltration successful.",
      "Encoded data decrypted.",
      "Strategic position locked.",
      "Covert operations: nominal.",
      "Mission brief: portfolio optimization.",
      "Extracting alpha from noise.",
      "Perimeter secured. Safe to trade.",
      "Intelligence gathering complete.",
      "Agent protocols activated.",
      "Deploying predictive algorithms."
    ];
    
    this.agentGreetings = [
      "Agent {name} reporting for duty. What's your mission?",
      "This is {name}. I've been monitoring the markets. How can I assist?",
      "{name} here. Ready to analyze any asset you need.",
      "Agent {name} online. What intel do you require?",
      "Operative {name} at your service. Target acquired?",
      "{name} checking in. The blockchain never sleeps, and neither do I.",
      "Agent {name} standing by. What's your objective?",
      "This is {name}. I've got eyes on the market. What do you need?",
      "{name} reporting. All systems operational.",
      "Agent {name} activated. Let's find your alpha."
    ];
  }

  loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'casual' || stored === 'business' || stored === 'agent' || stored === 'off') {
      return stored;
    }
    return 'agent';
  }

  getPersona() {
    return this.currentPersona;
  }

  setPersona(mode) {
    const validModes = ['business', 'casual', 'agent', 'off'];
    if (!validModes.includes(mode)) {
      console.error('Invalid persona mode:', mode);
      return;
    }
    
    this.currentPersona = mode;
    localStorage.setItem(this.STORAGE_KEY, mode);
    
    window.dispatchEvent(new CustomEvent('personaChanged', { 
      detail: { persona: mode } 
    }));
  }

  togglePersona() {
    const modes = ['agent', 'business', 'casual', 'off'];
    const currentIndex = modes.indexOf(this.currentPersona);
    const newMode = modes[(currentIndex + 1) % modes.length];
    this.setPersona(newMode);
  }

  setCurrentAgent(agent) {
    this.currentAgent = agent;
  }
  
  getCurrentAgent() {
    if (this.currentAgent) return this.currentAgent;
    if (window.AGENTS && window.AGENTS.length > 0) {
      return window.AGENTS[0];
    }
    return null;
  }

  getImage(imageName) {
    const persona = this.currentPersona;
    
    if (persona === 'agent') {
      const agent = this.getCurrentAgent();
      if (agent && agent.image) {
        return agent.image;
      }
      return '/trading-cards/caucasian_blonde_male_agent.png';
    }
    
    if (this.imageMap[persona] && this.imageMap[persona][imageName]) {
      return this.imageMap[persona][imageName];
    }
    
    return this.imageMap.business.explaining;
  }

  getRandomAgentQuote() {
    return this.agentQuotes[Math.floor(Math.random() * this.agentQuotes.length)];
  }
  
  getAgentGreeting() {
    const agent = this.getCurrentAgent();
    const name = agent ? agent.name.replace('Agent ', '') : 'Unknown';
    const greeting = this.agentGreetings[Math.floor(Math.random() * this.agentGreetings.length)];
    return greeting.replace('{name}', name);
  }

  getCommentary(term) {
    if (!term || !term.smartass || !term.plain) {
      return term?.definition || '';
    }
    
    if (this.currentPersona === 'agent') {
      return term.plain;
    }
    
    return this.currentPersona === 'casual' ? term.smartass : term.plain;
  }

  isBusiness() {
    return this.currentPersona === 'business';
  }

  isCasual() {
    return this.currentPersona === 'casual';
  }
  
  isAgent() {
    return this.currentPersona === 'agent';
  }
}

const personaManager = new PersonaManager();

window.personaManager = personaManager;
