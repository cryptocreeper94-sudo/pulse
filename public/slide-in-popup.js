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
  
  // Comic-style oblong oval speech bubble
  const speechBubble = document.createElement('div');
  speechBubble.className = 'comic-speech-bubble';
  speechBubble.style.cssText = `
    background: linear-gradient(180deg, #ffffff 0%, #f0f4ff 100%);
    border: 3px solid #1a1a2e;
    border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
    padding: 18px 28px;
    max-width: 320px;
    min-width: 180px;
    margin-bottom: 12px;
    position: relative;
    box-shadow: 4px 4px 0 #1a1a2e, 0 8px 25px rgba(0, 0, 0, 0.3);
    animation: bubblePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    opacity: 0;
    transform: scale(0.6);
    text-align: center;
  `;
  
  // Comic-style curved tail
  const tail = document.createElement('div');
  tail.style.cssText = `
    position: absolute;
    bottom: -22px;
    ${direction === 'left' ? 'left: 35px' : 'right: 35px'};
    width: 25px;
    height: 25px;
    background: linear-gradient(180deg, #ffffff 0%, #f0f4ff 100%);
    border-right: 3px solid #1a1a2e;
    border-bottom: 3px solid #1a1a2e;
    transform: rotate(45deg) skew(15deg, 15deg);
    box-shadow: 3px 3px 0 #1a1a2e;
  `;
  
  // Cover to hide tail overlap
  const cover = document.createElement('div');
  cover.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 15px;
    background: #f0f4ff;
    border-radius: 0 0 20px 20px;
  `;
  
  speechBubble.innerHTML = `
    <button id="slideInCloseBtn" style="
      position: absolute;
      top: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FF006E;
      border: 2px solid #1a1a2e;
      color: white;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 2px 2px 0 #1a1a2e;
      z-index: 10;
      transition: transform 0.2s, background 0.2s;
    " onmouseover="this.style.transform='scale(1.1)'; this.style.background='#FF4081'" onmouseout="this.style.transform='scale(1)'; this.style.background='#FF006E'">×</button>
    ${title ? `<div style="
      font-size: 16px;
      font-weight: 900;
      color: #1a1a2e;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;
    ">${title}</div>` : ''}
    <div style="
      font-size: 15px;
      color: #2a2a3e;
      line-height: 1.5;
      font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;
      font-weight: 500;
    ">${message}</div>
    ${name ? `<div style="
      margin-top: 10px;
      font-size: 12px;
      color: #555;
      font-style: italic;
      font-family: 'Comic Sans MS', 'Segoe UI', sans-serif;
    ">— ${name}</div>` : ''}
  `;
  
  speechBubble.appendChild(tail);
  speechBubble.appendChild(cover);
  
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
  // Try to use cutout version (transparent background) from trading-cards-cutouts folder
  const cutoutPath = image.replace('/trading-cards/', '/trading-cards-cutouts/');
  characterImg.src = cutoutPath;
  characterImg.alt = name || 'Character';
  characterImg.style.cssText = `
    height: 180px;
    width: auto;
    object-fit: contain;
    background: transparent;
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 15px rgba(0, 212, 255, 0.3));
    cursor: pointer;
    transition: transform 0.3s ease;
  `;
  
  characterImg.onmouseover = () => {
    characterImg.style.transform = 'scale(1.05)';
  };
  characterImg.onmouseout = () => {
    characterImg.style.transform = 'scale(1)';
  };
  
  // If cutout doesn't exist, try original image, then fallback to Grumpy cat
  characterImg.onerror = () => {
    if (characterImg.src.includes('/trading-cards-cutouts/')) {
      // Try original image
      characterImg.src = image;
    } else {
      // Final fallback
      characterImg.src = '/trading-cards-cutouts/Grumpy_cat_neutral_pose_ba4a1b4d.png';
    }
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
  
  // Close button click handler
  const closeBtn = document.getElementById('slideInCloseBtn');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeSlideInPopup(direction);
    };
  }
  
  // Click anywhere on container also closes
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
