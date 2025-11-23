class PersonaManager {
  constructor() {
    this.STORAGE_KEY = 'darkwave-persona-mode';
    this.currentPersona = this.loadFromStorage();
    
    this.imageMap = {
      business: {
        explaining: '/crypto-cat-images/business-cat-explaining.jpg',
        facepalm: '/crypto-cat-images/business-cat-facepalm.jpg',
        pointing: '/crypto-cat-images/business-cat-pointing.jpg',
        sitting: '/crypto-cat-images/business-cat-sitting.jpg'
      },
      casual: {
        explaining: '/crypto-cat-images/sarcastic-cat.png',
        facepalm: '/crypto-cat-images/sarcastic-cat-facepalm.jpg',
        pointing: '/crypto-cat-images/sarcastic-cat-pointing.jpg',
        sitting: '/crypto-cat-images/sarcastic-cat-coins.jpg',
        sunglasses: '/crypto-cat-images/sarcastic-cat-sunglasses.jpg'
      }
    };
  }

  loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'casual' ? 'casual' : 'business';
  }

  getPersona() {
    return this.currentPersona;
  }

  setPersona(mode) {
    if (mode !== 'business' && mode !== 'casual') {
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
    const newMode = this.currentPersona === 'business' ? 'casual' : 'business';
    this.setPersona(newMode);
  }

  getImage(imageName) {
    const persona = this.currentPersona;
    
    if (this.imageMap[persona] && this.imageMap[persona][imageName]) {
      return this.imageMap[persona][imageName];
    }
    
    return this.imageMap.business.explaining;
  }

  getCommentary(term) {
    if (!term || !term.smartass || !term.plain) {
      return term?.definition || '';
    }
    
    return this.currentPersona === 'casual' ? term.smartass : term.plain;
  }

  isBusiness() {
    return this.currentPersona === 'business';
  }

  isCasual() {
    return this.currentPersona === 'casual';
  }
}

const personaManager = new PersonaManager();

window.personaManager = personaManager;
