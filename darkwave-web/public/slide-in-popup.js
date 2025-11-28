// Slide-In Popup System - Characters walk up and talk with speech bubbles
console.log('✅ Slide-In Popup System loaded');

let slideInTimeout = null;

function showSlideInPopup(options) {
  const {
    image,
    name,
    title,
    message,
    direction = 'left',
    duration = 8000
  } = options;
  
  const existingPopup = document.getElementById('slideInPopupContainer');
  if (existingPopup) {
    existingPopup.remove();
    if (slideInTimeout) clearTimeout(slideInTimeout);
  }
  
  const container = document.createElement('div');
  container.id = 'slideInPopupContainer';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    ${direction}: 20px;
    z-index: 10100;
    display: flex;
    flex-direction: column;
    align-items: ${direction === 'left' ? 'flex-start' : 'flex-end'};
    pointer-events: auto;
    animation: slideInFrom${direction === 'left' ? 'Left' : 'Right'} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `;
  
  const speechBubble = document.createElement('div');
  speechBubble.className = 'speech-bubble';
  speechBubble.style.cssText = `
    background: linear-gradient(135deg, rgba(20, 20, 35, 0.95), rgba(30, 30, 50, 0.95));
    border: 2px solid #3861fb;
    border-radius: 20px;
    padding: 16px 20px;
    max-width: 320px;
    margin-bottom: 8px;
    position: relative;
    box-shadow: 0 8px 32px rgba(56, 97, 251, 0.3), 0 0 20px rgba(56, 97, 251, 0.15);
    backdrop-filter: blur(10px);
    animation: bubblePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    opacity: 0;
    transform: scale(0.8);
  `;
  
  speechBubble.innerHTML = `
    <div style="
      position: absolute;
      bottom: -12px;
      ${direction === 'left' ? 'left: 30px' : 'right: 30px'};
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 14px solid #3861fb;
    "></div>
    <div style="
      position: absolute;
      bottom: -8px;
      ${direction === 'left' ? 'left: 32px' : 'right: 32px'};
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 12px solid rgba(25, 25, 40, 0.95);
    "></div>
    ${title ? `<div style="
      font-size: 16px;
      font-weight: 800;
      color: #3861fb;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    ">${title}</div>` : ''}
    <div style="
      font-size: 14px;
      color: #e0e0e0;
      line-height: 1.5;
    ">${message}</div>
    ${name ? `<div style="
      margin-top: 10px;
      font-size: 11px;
      color: #888;
      font-style: italic;
    ">— ${name}</div>` : ''}
  `;
  
  const characterContainer = document.createElement('div');
  characterContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: characterBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
    opacity: 0;
    transform: translateY(20px);
  `;
  
  const characterImg = document.createElement('img');
  characterImg.src = image;
  characterImg.alt = name || 'Character';
  characterImg.style.cssText = `
    height: 180px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 15px rgba(56, 97, 251, 0.3));
    cursor: pointer;
    transition: transform 0.3s ease;
  `;
  
  characterImg.onmouseover = () => {
    characterImg.style.transform = 'scale(1.05)';
  };
  characterImg.onmouseout = () => {
    characterImg.style.transform = 'scale(1)';
  };
  
  characterImg.onerror = () => {
    characterImg.src = '/trading-cards-cutouts/Grumpy_cat_neutral_pose_ba4a1b4d.png';
  };
  
  characterContainer.appendChild(characterImg);
  container.appendChild(speechBubble);
  container.appendChild(characterContainer);
  
  const style = document.createElement('style');
  style.id = 'slideInPopupStyles';
  if (!document.getElementById('slideInPopupStyles')) {
    style.textContent = `
      @keyframes slideInFromLeft {
        from {
          transform: translateX(-150%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideInFromRight {
        from {
          transform: translateX(150%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutToLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-150%);
          opacity: 0;
        }
      }
      
      @keyframes slideOutToRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(150%);
          opacity: 0;
        }
      }
      
      @keyframes bubblePop {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes characterBounce {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(container);
  
  container.onclick = () => closeSlideInPopup(direction);
  
  slideInTimeout = setTimeout(() => closeSlideInPopup(direction), duration);
}

function closeSlideInPopup(direction = 'left') {
  const container = document.getElementById('slideInPopupContainer');
  if (container) {
    container.style.animation = `slideOutTo${direction === 'left' ? 'Left' : 'Right'} 0.4s ease-in forwards`;
    setTimeout(() => container.remove(), 400);
  }
  if (slideInTimeout) {
    clearTimeout(slideInTimeout);
    slideInTimeout = null;
  }
}

function showAgentSlideIn(term, definition) {
  const agent = window.getPopupAgent ? window.getPopupAgent() : null;
  const mode = window.agentPopupMode || localStorage.getItem('agentPopupMode') || 'off';
  
  let message = definition;
  
  if (mode === 'business' && window.businessResponses) {
    message = window.businessResponses[term.toLowerCase()] || definition;
  } else if (mode === 'casual' && window.casualResponses) {
    message = window.casualResponses[term.toLowerCase()] || definition;
  }
  
  let agentImage = agent?.image || '/trading-cards/caucasian_blonde_male_agent.png';
  agentImage = agentImage.replace('/trading-cards/', '/trading-cards-cutouts/');
  const agentName = agent?.name || 'Agent';
  
  showSlideInPopup({
    image: agentImage,
    name: agentName,
    title: term,
    message: message,
    direction: 'left',
    duration: 10000
  });
}

function showCatSlideIn(term, definition) {
  const mode = window.cryptoCatMode || localStorage.getItem('cryptoCatMode') || 'off';
  const persona = window.personaManager?.getPersona() || mode;
  
  let message = definition;
  let catImage = '/trading-cards-cutouts/Grumpy_cat_neutral_pose_ba4a1b4d.png';
  
  if (persona === 'business' || mode === 'business') {
    catImage = '/trading-cards-cutouts/Grumpy_cat_neutral_pose_ba4a1b4d.png';
    if (window.businessResponses) {
      message = window.businessResponses[term.toLowerCase()] || definition;
    }
  } else if (persona === 'casual' || mode === 'casual') {
    catImage = '/trading-cards-cutouts/Grumpy_cat_sideeye_pose_5e52df88.png';
    if (window.casualResponses) {
      message = window.casualResponses[term.toLowerCase()] || definition;
    }
  }
  
  showSlideInPopup({
    image: catImage,
    name: 'Grumpy Cat',
    title: term,
    message: message,
    direction: 'right',
    duration: 10000
  });
}

function showCharacterSlideIn(options) {
  const persona = window.personaManager?.getPersona() || 'agent';
  
  if (persona === 'agent') {
    showAgentSlideIn(options.term || '', options.message || options.definition || '');
  } else if (persona === 'off') {
    showSlideInPopup({
      image: '/trading-cards-cutouts/Grumpy_cat_neutral_pose_ba4a1b4d.png',
      title: options.term,
      message: options.definition || options.message,
      direction: 'left',
      duration: 8000
    });
  } else {
    showCatSlideIn(options.term || '', options.message || options.definition || '');
  }
}

window.showSlideInPopup = showSlideInPopup;
window.closeSlideInPopup = closeSlideInPopup;
window.showAgentSlideIn = showAgentSlideIn;
window.showCatSlideIn = showCatSlideIn;
window.showCharacterSlideIn = showCharacterSlideIn;

console.log('✅ Slide-In Popup functions registered');
