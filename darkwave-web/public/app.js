// DarkWave Pulse - Compact App Logic

const API_BASE = '';
let currentCatMode = 'normal';

// Cat images for Altcoin Season gauge disabled - using clean gauges instead (Nov 26 2025)
const businessCatAltSeasonImages = {
  grumpyFace: null,
  coolFace: null,
  arm: null,
  loaded: false
};

function preloadAltSeasonCatImages() {
  // Disabled - no longer using cat sprite sheets for gauges
  // Using clean needle-only gauges from gauges-clean.js
  console.log('ℹ️ Cat gauge images disabled - using clean gauges');
}

// Preload images on script load
if (typeof window !== 'undefined') {
  preloadAltSeasonCatImages();
}

// Retry fetch with exponential backoff for backend startup delays
async function retryWithBackoff(fetchFn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchFn();
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⏳ Retry ${i + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Toggle collapsible sections (Learn page)
function toggleCollapsible(btn) {
  const section = btn.closest('.collapsible-section');
  const content = section.querySelector('.collapsible-content');
  const icon = btn.querySelector('.collapsible-icon');
  
  if (content.style.maxHeight && content.style.maxHeight !== '0px') {
    content.style.maxHeight = '0px';
    icon.style.transform = 'rotate(0deg)';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.style.transform = 'rotate(180deg)';
  }
}

// Switch truth sections (Learn page tabs)
function showTruthSection(section) {
  // Hide all sections
  document.querySelectorAll('.truth-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.truth-tab-btn').forEach(btn => {
    btn.style.background = 'rgba(255,255,255,0.1)';
    btn.style.border = '1px solid rgba(255,255,255,0.2)';
    btn.classList.remove('truth-tab-active');
  });
  
  // Show selected section
  const selectedSection = document.getElementById(`truth-section-${section}`);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }
  
  // Highlight active tab
  event.target.style.background = '#3861FB';
  event.target.style.border = 'none';
  event.target.classList.add('truth-tab-active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DarkWave Pulse initializing...');
  
  // Check for valid session - redirect to lockscreen if not logged in
  const dwpUser = JSON.parse(localStorage.getItem('dwp_user') || '{}');
  const hasValidSession = dwpUser.accessLevel || dwpUser.subscriptionTier || dwpUser.isWhitelisted;
  
  // If no session at all, redirect to lockscreen (but not in development with localhost)
  if (!hasValidSession && !window.location.hostname.includes('localhost')) {
    console.log('🔒 No valid session found, redirecting to login...');
    window.location.href = '/lockscreen.html';
    return;
  }
  
  // Set initial theme
  document.body.className = 'theme-dark';
  
  // Bind tab navigation
  bindTabs();
  
  // Load glossary terms
  loadGlossary();
  
  // Initialize charts
  initCharts();
  
  // Initialize chart title based on current mode
  updateChartTitle();
  
  // Initialize gauges
  initGauges();
  
  // Set candle chart as active by default
  setTimeout(() => {
    const candleChart = document.getElementById('candleChart');
    const candleBtn = document.getElementById('mainCandleBtn');
    if (candleChart) candleChart.classList.add('active');
    if (candleBtn) candleBtn.classList.add('active');
  }, 100);
  
  // Initialize persona state
  initPersona();
  
  // Initialize Agent system
  initializeAgentSystem();
  
  // Load pricing plans
  loadPricingPlans();
  
  // Fetch macro market metrics
  fetchMacroMarketMetrics();
  
  // Fetch again after 5 seconds to enable volume flow calculation
  setTimeout(() => {
    fetchMacroMarketMetrics();
  }, 5000);
  
  // Update live coin prices
  updateCoinPrices();
  
  // Stock prices will be loaded when Stocks tab is clicked (avoid rate limiting on page load)
  
  // Load theme from backend after session validation
  if (typeof themeManager !== 'undefined') {
    setTimeout(async () => {
      await themeManager.loadThemeFromBackend();
      
      // SECURITY: Show theme button only after backend confirms premium tier
      const userTier = await themeManager.getUserTierFromBackend();
      if (userTier === 'premium' || userTier === 'admin') {
        const themeBtn = document.getElementById('themeSelectorBtn');
        if (themeBtn) {
          themeBtn.style.display = 'block';
        }
      }
    }, 1000);
  }
  
  // Check if user should see onboarding (after session verification)
  setTimeout(() => {
    checkAndShowOnboarding();
  }, 2000);
  
  // Check if user should see socials popup (after session verification)
  setTimeout(() => {
    checkAndShowSocialsPopup();
  }, 3000);
  
  // Initialize V2 checklist progress tracking
  initV2Checklist();
  updateV2Countdown();
  
  console.log('✅ DarkWave Pulse ready');
});

// V2 Features Modal Functions
function openV2FeaturesModal() {
  const modal = document.getElementById('v2FeaturesModal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Update cat image based on persona
    const catImage = document.getElementById('v2FeaturesCatImage');
    const persona = window.personaManager ? personaManager.getPersona() : 'business';
    if (catImage) {
      if (persona === 'casual') {
        catImage.src = '/trading-cards/Grumpy_cat_arms_crossed_f8e46099.png';
      } else {
        catImage.src = '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png';
      }
    }
    
    console.log('✅ V2 Features modal opened');
  }
}

function closeV2FeaturesModal() {
  const modal = document.getElementById('v2FeaturesModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Disclaimer Modal Functions
function openDisclaimerModal() {
  const modal = document.getElementById('disclaimerModal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Update cat image and quote based on persona
    const catImage = document.getElementById('disclaimerCatImage');
    const catQuote = document.getElementById('disclaimerCatQuote');
    const persona = window.personaManager ? personaManager.getPersona() : 'business';
    
    const businessQuotes = [
      "Listen carefully. I'm legally obligated to tell you that this is NOT financial advice. Read the fine print below before making any decisions.",
      "Before we continue, you need to understand the risks. Markets are volatile and unpredictable. This disclaimer protects both of us.",
      "Professional disclosure: Everything on this platform is educational content only. The legal team insisted I make this crystal clear."
    ];
    
    const casualQuotes = [
      "Okay, real talk... I gotta cover our butts here. This ain't financial advice, just so we're clear. Don't sue us if your portfolio tanks. 📉",
      "Look, I'm just a cat on the internet. Nothing I say is investment advice. Do your own research and don't blame me if things go sideways. 🤷",
      "Legal stuff incoming! Translation: we're not responsible if you lose money. Markets are wild. Read the boring text below. 😼"
    ];
    
    if (catImage && catQuote) {
      if (persona === 'casual') {
        catImage.src = '/trading-cards/Grumpy_cat_sideeye_pose_5e52df88.png';
        catQuote.textContent = `"${casualQuotes[Math.floor(Math.random() * casualQuotes.length)]}"`;
      } else {
        catImage.src = '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png';
        catQuote.textContent = `"${businessQuotes[Math.floor(Math.random() * businessQuotes.length)]}"`;
      }
    }
    
    console.log('⚠️ Disclaimer modal opened');
  }
}

function closeDisclaimerModal() {
  const modal = document.getElementById('disclaimerModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Staking V2 Lock Functions
function closeStakingV2Lock() {
  const overlay = document.getElementById('stakingV2Lock');
  if (overlay) {
    overlay.classList.add('hidden');
    console.log('🔓 Staking preview closed');
  }
}

function unlockStakingPreview() {
  const overlay = document.getElementById('stakingV2Lock');
  if (overlay) {
    overlay.classList.add('hidden');
    console.log('🔓 Staking preview unlocked for dev/admin');
  }
  
  // Show active staking dashboard with mock data for aesthetic review
  const dashboard = document.getElementById('activeStakingDashboard');
  if (dashboard) {
    dashboard.style.display = 'block';
    
    // Populate with mock data
    document.getElementById('dashTotalStaked').textContent = '25,000 PULSE';
    document.getElementById('dashTotalStakedUSD').textContent = '$12,500.00';
    document.getElementById('dashActiveSince').textContent = 'Dec 25, 2025';
    document.getElementById('dashDaysActive').textContent = '45 days';
    document.getElementById('dashLockPeriod').textContent = '60 Days';
    document.getElementById('dashTimeRemaining').textContent = '15 days left';
    document.getElementById('dashPendingRewards').textContent = '342.8 PULSE';
    document.getElementById('dashPendingRewardsUSD').textContent = '$171.40';
    document.getElementById('dashCurrentAPY').textContent = '25%';
    document.getElementById('dashEffectiveAPY').textContent = '27.5% with bonuses';
    document.getElementById('dashLifetimeEarnings').textContent = '1,847 PULSE';
    document.getElementById('dashLifetimeEarningsUSD').textContent = '$923.50';
    document.getElementById('dashHourlyRate').textContent = '1.14 PULSE/hour';
    document.getElementById('dashNextReward').textContent = '00:42:18';
    document.getElementById('dashPoolUtilization').textContent = '67.3% Full';
    document.getElementById('dashUtilizationFill').style.width = '67%';
    document.getElementById('dashPoolShare').textContent = '0.082%';
    document.getElementById('dashGlobalStaked').textContent = '30.5M PULSE';
    document.getElementById('dashTotalStakers').textContent = '1,247';
    document.getElementById('calcWithout').textContent = '625 PULSE';
    document.getElementById('calcWith').textContent = '658.2 PULSE';
    document.getElementById('calcDiff').textContent = '+33.2 PULSE';
    document.getElementById('chartPeriodTotal').textContent = '164.8 PULSE';
    document.getElementById('chartAvgDaily').textContent = '23.5 PULSE';
    
    // Set Gold pool tier
    const tierBadge = document.getElementById('activePoolTier');
    tierBadge.className = 'active-pool-tier gold';
    tierBadge.innerHTML = '<span class="tier-icon"></span><span class="tier-name">GOLD POOL</span><span class="tier-apy">25% APY</span>';
    
    console.log('Active staking dashboard shown with mock data for aesthetic review');
    
    // Initialize calculator with default values
    updateStakingCalculator();
  }
}

// Staking Feature Detail Popups
function openStakingFeaturePopup(feature) {
  const featureContent = {
    hourly: {
      title: '⏰ Hourly Auto-Compounding Rewards',
      content: `
        <p><strong>Most platforms?</strong> Pay rewards monthly or weekly.</p>
        <p><strong>DarkWave Pulse?</strong> Rewards distributed <strong>EVERY SINGLE HOUR</strong>.</p>
        <div style="background: rgba(56, 97, 251, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="color: #3861FB; margin: 0 0 10px 0;">Why This Matters:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Compound Effect:</strong> Your rewards earn rewards faster</li>
            <li><strong>Real-Time Growth:</strong> Watch your balance grow every hour</li>
            <li><strong>Max APY:</strong> Hourly compounding = highest effective APY</li>
            <li><strong>Cash Out Anytime:</strong> Claim hourly without waiting weeks</li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #888;">Example: 10,000 PULSE at 25% APY = ~2.85 PULSE earned every hour while you sleep.</p>
      `
    },
    apy: {
      title: '💎 Up to 50% APY (Platinum Pool)',
      content: `
        <p><strong>4-Tier Pool System</strong> - Lock longer, earn more:</p>
        <div style="display: grid; gap: 10px; margin: 15px 0;">
          <div style="background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(139, 69, 19, 0.2)); padding: 12px; border-radius: 6px; border-left: 4px solid #CD7F32;">
            <div style="font-weight: 700; margin-bottom: 4px;">🥉 BRONZE POOL</div>
            <div style="font-size: 13px; color: #DDD;">7-Day Lock: <strong>2% APY</strong></div>
          </div>
          <div style="background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(128, 128, 128, 0.2)); padding: 12px; border-radius: 6px; border-left: 4px solid #C0C0C0;">
            <div style="font-weight: 700; margin-bottom: 4px;">🥈 SILVER POOL</div>
            <div style="font-size: 13px; color: #DDD;">30-Day Lock: <strong>10% APY</strong></div>
          </div>
          <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(184, 134, 11, 0.2)); padding: 12px; border-radius: 6px; border-left: 4px solid #FFD700;">
            <div style="font-weight: 700; margin-bottom: 4px;">🥇 GOLD POOL</div>
            <div style="font-size: 13px; color: #DDD;">90-Day Lock: <strong>25% APY</strong></div>
          </div>
          <div style="background: linear-gradient(135deg, rgba(56, 97, 251, 0.3), rgba(131, 56, 236, 0.3)); padding: 12px; border-radius: 6px; border-left: 4px solid #3861FB;">
            <div style="font-weight: 700; margin-bottom: 4px;">💎 PLATINUM POOL</div>
            <div style="font-size: 13px; color: #DDD;">180-Day Lock: <strong>50% APY</strong></div>
          </div>
        </div>
        <p style="font-size: 13px; color: #888;">No hidden fees. No rug pulls. Transparent smart contracts audited by DarkWave security team.</p>
      `
    },
    multi: {
      title: '🌐 Multi-Token Platform (100+ Tokens)',
      content: `
        <p><strong>ONE Platform. UNLIMITED Tokens.</strong></p>
        <p>Stake <strong>any</strong> token and earn <strong>PULSE rewards</strong>:</p>
        <div style="background: rgba(56, 97, 251, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="color: #3861FB; margin: 0 0 10px 0;">Supported Tokens:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>PULSE</strong> - Native DarkWave token (highest APY)</li>
            <li><strong>SOL, BTC, ETH</strong> - Major cryptocurrencies</li>
            <li><strong>USDC, USDT</strong> - Stablecoins for safe yields</li>
            <li><strong>Community Tokens</strong> - 100+ verified projects</li>
          </ul>
        </div>
        <p><strong>No switching platforms.</strong> Manage everything in one unified dashboard.</p>
        <p style="font-size: 13px; color: #888;">Launch with 20 tokens. Expand to 100+ by Q2 2026.</p>
      `
    },
    rewards: {
      title: '🎁 Early Bird 2x Launch Bonuses',
      content: `
        <p><strong>First 500 stakers get DOUBLE rewards for 90 days.</strong></p>
        <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2)); padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #FFD700;">
          <h4 style="color: #FFD700; margin: 0 0 10px 0; font-size: 16px;">🔥 EARLY BIRD PERKS:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 2;">
            <li><strong>2x APY Multiplier</strong> for first 90 days</li>
            <li><strong>Priority Access</strong> to new staking pools</li>
            <li><strong>Bonus Airdrops</strong> from partner projects</li>
            <li><strong>Lifetime Founder Badge</strong> on your profile</li>
          </ul>
        </div>
        <p><strong>Example:</strong> Platinum Pool (50% APY) → <strong>100% APY</strong> for early birds</p>
        <p style="font-size: 13px; color: #888;">This is a limited-time launch incentive. After 500 stakers, standard rates apply.</p>
      `
    },
    solana: {
      title: '⚡ Solana Speed, Near-Zero Fees',
      content: `
        <p><strong>Why Solana?</strong> Because Ethereum gas fees are highway robbery.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
          <div style="background: rgba(220, 38, 38, 0.2); padding: 15px; border-radius: 8px; border-left: 4px solid #DC2626;">
            <div style="font-weight: 700; color: #DC2626; margin-bottom: 8px;">❌ Ethereum</div>
            <div style="font-size: 13px;">$50-$200 gas fees</div>
            <div style="font-size: 13px;">15-30 sec transactions</div>
            <div style="font-size: 13px;">Network congestion</div>
          </div>
          <div style="background: rgba(34, 197, 94, 0.2); padding: 15px; border-radius: 8px; border-left: 4px solid #22C55E;">
            <div style="font-weight: 700; color: #22C55E; margin-bottom: 8px;">✅ Solana</div>
            <div style="font-size: 13px;">$0.00025 fees</div>
            <div style="font-size: 13px;">400ms transactions</div>
            <div style="font-size: 13px;">65,000 TPS capacity</div>
          </div>
        </div>
        <p><strong>Real Talk:</strong> You'll spend more on a coffee than on 1,000 Solana transactions.</p>
        <p style="font-size: 13px; color: #888;">Stake, claim, and compound without worrying about gas eating your profits.</p>
      `
    }
  };

  const data = featureContent[feature];
  if (!data) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
      <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      <h2 style="font-family: 'Orbitron', sans-serif; color: #3861FB; margin-bottom: 20px;">${data.title}</h2>
      <div style="line-height: 1.7; color: #DDD;">
        ${data.content}
      </div>
      <button class="btn" onclick="this.closest('.modal-overlay').remove(); switchTab('settings')" style="width: 100%; margin-top: 20px; font-size: 14px; font-weight: 700;">
        UPGRADE NOW FOR V2 ACCESS →
      </button>
    </div>
  `;
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

// Staking Calculator Functions
const POOL_APY = {
  bronze: 0.02,    // 2%
  silver: 0.10,    // 10%
  gold: 0.25,      // 25%
  platinum: 0.50   // 50%
};

const PULSE_PRICE_USD = 0.50; // $0.50 per PULSE (placeholder, will be live later)

function updateStakingCalculator() {
  const amount = parseFloat(document.getElementById('calcStakeAmount')?.value || 0);
  const poolTier = document.getElementById('calcPoolTier')?.value || 'gold';
  const timePeriod = parseInt(document.getElementById('calcTimePeriod')?.value || 30);
  
  if (!amount || amount <= 0) {
    // Reset to zeros if invalid amount
    document.getElementById('calcHourlyEarn').textContent = '0 PULSE';
    document.getElementById('calcDailyEarn').textContent = '0 PULSE';
    document.getElementById('calcMonthlyEarn').textContent = '0 PULSE';
    document.getElementById('calcTotalEarn').textContent = '0 PULSE';
    document.getElementById('calcTotalUSD').textContent = '$0.00';
    return;
  }
  
  const apy = POOL_APY[poolTier];
  
  // Calculate earnings with hourly compounding: A = P(1 + r/n)^(n*t)
  // Where: P = principal, r = annual rate, n = compounding periods per year (8760 hours), t = years
  const hoursInYear = 8760;
  const years = timePeriod / 365;
  const compoundedAmount = amount * Math.pow(1 + (apy / hoursInYear), hoursInYear * years);
  const totalEarned = compoundedAmount - amount;
  
  // Calculate period breakdowns
  const hourlyRate = (amount * apy) / hoursInYear;
  const dailyRate = hourlyRate * 24;
  const monthlyRate = hourlyRate * 24 * 30;
  
  // Format and display
  document.getElementById('calcHourlyEarn').textContent = `${hourlyRate.toFixed(4)} PULSE`;
  document.getElementById('calcDailyEarn').textContent = `${dailyRate.toFixed(2)} PULSE`;
  document.getElementById('calcMonthlyEarn').textContent = `${monthlyRate.toFixed(2)} PULSE`;
  document.getElementById('calcTotalEarn').textContent = `${totalEarned.toFixed(2)} PULSE`;
  document.getElementById('calcTotalUSD').textContent = `$${(totalEarned * PULSE_PRICE_USD).toFixed(2)}`;
}

function updateCompoundingCalc() {
  // Placeholder function for compounding calculator (uses existing stake data)
  console.log('Compounding calculator updated');
}

function switchRewardChart(period) {
  // Remove active from all tabs
  document.querySelectorAll('.timeframe-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Add active to clicked tab
  const clickedTab = document.querySelector(`[data-period="${period}"]`);
  if (clickedTab) {
    clickedTab.classList.add('active');
  }
  
  console.log(`Reward chart switched to ${period} period`);
}

function refreshStakingDashboard() {
  console.log('🔄 Refreshing staking dashboard...');
  // This will fetch live data from API when implemented
  // For now, just show console message
}

function openStakeMoreModal() {
  alert('Stake More feature coming with V2 launch on Dec 25, 2025');
}

function openUnstakeModal() {
  alert('Unstake feature coming with V2 launch on Dec 25, 2025');
}

function claimRewards() {
  alert('Claim Rewards feature coming with V2 launch on Dec 25, 2025');
}

function toggleAutoCompound() {
  const icon = document.getElementById('autoCompoundIcon');
  const text = document.getElementById('autoCompoundText');
  const banner = document.getElementById('autoCompoundBanner');
  
  if (text.textContent.includes('Enable')) {
    text.textContent = 'Disable Auto-Compound';
    icon.textContent = '✅';
    banner.style.display = 'block';
  } else {
    text.textContent = 'Enable Auto-Compound';
    icon.textContent = '🔄';
    banner.style.display = 'none';
  }
}

function openSwitchPoolModal() {
  alert('Switch Pool feature coming with V2 launch on Dec 25, 2025');
}

function openWinDetailPopup(type) {
  const popups = {
    hourly: {
      title: 'HOURLY REWARDS - GAME CHANGER',
      content: `
        <p><strong>Most staking platforms:</strong> Pay rewards monthly or weekly. That's 12-52 payments per year.</p>
        <p><strong>DarkWave Pulse:</strong> Pays every single hour. That's <strong>8,760 payments per year</strong>.</p>
        <p class="highlight">Why this matters:</p>
        <ul>
          <li>Compound interest kicks in faster (hourly vs monthly = exponentially more gains)</li>
          <li>You can claim anytime without waiting weeks</li>
          <li>Smoother, more predictable income stream</li>
        </ul>
        <p class="example">Real Example: $10,000 staked at 25% APY</p>
        <ul>
          <li>Monthly compounding: $2,500/year profit</li>
          <li>Hourly compounding: $2,840/year profit (+$340 extra just from frequency)</li>
        </ul>
      `
    },
    revenue: {
      title: 'REAL REVENUE BACKING - NO HYPE',
      content: `
        <p><strong>The problem with most tokens:</strong> APY comes from thin air. They mint new tokens, dilute holders, and eventually collapse.</p>
        <p><strong>DarkWave's solution:</strong> 30% of all subscription revenue ($4 Beta V1 tier) goes directly into the staking reward pool.</p>
        <p class="highlight">What this means:</p>
        <ul>
          <li>Real money backing real rewards (not inflationary printing)</li>
          <li>Sustainable long-term (as long as people subscribe, stakers earn)</li>
          <li>Transparent revenue source (track our subscriptions, track the pool)</li>
        </ul>
        <p class="example">Math breakdown:</p>
        <ul>
          <li>10,000 subscribers × $4 avg/month = $40,000/month revenue</li>
          <li>30% staking allocation = $12,000/month → $144,000/year reward pool</li>
          <li>Plus: Trading fees, partnerships, and V2 ecosystem fees add more</li>
        </ul>
      `
    },
    community: {
      title: '100 COMMUNITY TOKENS - ONE PLATFORM',
      content: `
        <p><strong>The Netflix model for staking:</strong> DarkWave isn't just for PULSE. We're building the ecosystem where ANY crypto project can launch staking pools.</p>
        <p class="highlight">How it works:</p>
        <ul>
          <li>PULSE is the native token (stake for highest APY)</li>
          <li>Partner projects can create their own pools (e.g., stake $MEME coin, earn $MEME rewards)</li>
          <li>One dashboard tracks everything (no juggling 20 different platforms)</li>
        </ul>
        <p class="example">Real use cases:</p>
        <ul>
          <li>Meme coin communities: Stake $DOGE, earn hourly $DOGE rewards</li>
          <li>NFT projects: Stake project tokens, earn whitelist spots + rewards</li>
          <li>DeFi protocols: Stake governance tokens, earn protocol fees</li>
        </ul>
        <p>V2 launch includes developer SDK to add your token in <strong>under 10 minutes</strong>.</p>
      `
    }
  };

  const data = popups[type];
  if (!data) return;

  const modal = document.createElement('div');
  modal.className = 'win-detail-popup';
  modal.innerHTML = `
    <div class="win-detail-content">
      <button class="win-detail-close" onclick="this.parentElement.parentElement.remove()">×</button>
      <h2>${data.title}</h2>
      <div class="win-detail-body">${data.content}</div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Check if user should see dev preview button
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const devPreviewBtn = document.getElementById('devPreviewBtn');
    if (devPreviewBtn) {
      // Show dev preview for admin, whitelisted users, or dev mode
      const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('replit');
      const userData = window.currentUserData;
      const isAdmin = userData?.accessLevel === 'admin';
      const isWhitelisted = userData?.isWhitelisted === true;
      
      if (isDev || isAdmin || isWhitelisted) {
        devPreviewBtn.style.display = 'block';
        const hallmarkBtn = document.getElementById('hallmarkPreviewBtn');
        if (hallmarkBtn) {
          hallmarkBtn.style.display = 'block';
        }
        console.log('🔓 Dev preview button enabled');
      }
    }
  }, 1000);
});

// V2 Feature Detail Modal
const featureDetails = {
  dwav: {
    icon: '🪙',
    title: 'DarkWave Coin (DWAV) — Your Ticket to Hourly Passive Income',
    content: `
      <p><strong>Most meme coins promise the moon but deliver nothing.</strong> Shiba, Doge, and hundreds of copycats ask you to "hodl" while the founders cash out. DarkWave Coin (DWAV) is different. We're not just another dog token with no utility—we're building the Netflix of crypto staking, backed by real revenue from DarkWave Pulse subscriptions.</p>
      
      <p><strong>Here's the game-changer: DWAV holders earn HOURLY rewards, not monthly.</strong> While other platforms pay you once a month (if they pay at all), we distribute rewards every single hour. That's 720 payment cycles per month versus their measly 1. Your balance grows while you sleep, work, or binge Netflix. This isn't hype—it's automated yield backed by platform fees from our multi-token staking ecosystem.</p>
      
      <p><strong>Fixed 1 Billion supply means scarcity works in your favor.</strong> No infinite minting. No team dumps. 30% of subscription revenue funds the hourly reward pool, creating sustainable passive income for holders. Multi-tier benefits unlock as you stake more: exclusive avatars, priority support, governance voting power, and early access to partner token launches. This is what utility looks like—real benefits tied to real revenue.</p>
      
      <p><strong>The bottom line:</strong> DWAV combines the viral appeal of meme coins with institutional-grade tokenomics. We're launching on Solana for lightning-fast transactions and pennies in fees, then expanding to Ethereum, Polygon, and BSC to capture every major chain. Join the revolution that treats holders like owners, not exit liquidity. December 25th, 2025. Be there.</p>
    `
  },
  staking: {
    icon: '💰',
    title: '4-Tier Staking Pools — Pick Your Speed, Maximize Your Gains',
    content: `
      <p><strong>Say goodbye to one-size-fits-all staking.</strong> Most platforms force you into rigid lock periods with mediocre returns. DarkWave's 4-tier system lets YOU choose your commitment level and rewards. Whether you're a cautious newcomer or a diamond-handed veteran, there's a pool designed for your risk tolerance and timeline.</p>
      
      <p><strong>Flexible Pool (2% APY):</strong> Zero lock period. Stake and unstake anytime. Perfect for testing the waters or keeping liquidity ready. <strong>30-Day Pool (10% APY):</strong> Modest commitment, solid returns—5x better than traditional savings accounts. <strong>60-Day Pool (25% APY):</strong> For believers who see the vision and want aggressive growth. <strong>90-Day Pool (50% APY):</strong> The whale tier. Lock for 3 months and watch your stack double annually through hourly compounding. Every. Single. Hour.</p>
      
      <p><strong>Here's why this destroys the competition:</strong> Other tokens promise big APYs but pay monthly (or never). We pay hourly, so your rewards auto-compound 720 times per month instead of once. The math is insane—50% APY compounded hourly beats 50% compounded monthly by a landslide. Plus, we're backed by real platform revenue (30% of subscription fees), not thin-air token printing.</p>
      
      <p><strong>Bonus perks for stakers:</strong> Lock 10k+ DWAV tokens and unlock exclusive community badges, priority customer support, early access to partner token pools, and governance voting rights. This isn't just yield farming—it's joining an elite club of holders who actually get rewarded for their loyalty. Launch day: December 25th, 2025. Founders' pools fill up fast.</p>
    `
  },
  airdrops: {
    icon: '🎁',
    title: 'Subscriber Airdrops — Loyalty Pays Literally',
    content: `
      <p><strong>Airdrops shouldn't be random giveaways to bots and farmers.</strong> DarkWave Pulse rewards REAL users—the subscribers who believed in us early and stuck around. If you're subscribed to Beta V1 Legacy Founder tier before December 25th, 2025, you're getting PULSE tokens for free. No hoops, no referral pyramids, just pure appreciation for being early.</p>
      
      <p><strong>How it works:</strong> Every Legacy Founder ($4/month) receives 27,000-35,000 PULSE tokens after 6 months of subscription. That's instant equity in the ecosystem—tokens you can stake, hold for appreciation, or trade. At launch prices, that's thousands of dollars in free value for users who believed in us early.</p>
      
      <p><strong>Why this matters:</strong> Most projects airdrop to wallet addresses that vanish overnight. We're airdropping to engaged community members who actually use the platform. This creates a decentralized holder base of real people, not whales and bots. And because you're already using DarkWave Pulse for trading signals, you'll know exactly when to hold and when to take profits. It's insider info, legally.</p>
      
      <p><strong>Future airdrops planned:</strong> Partner token launches will prioritize DarkWave subscribers. When we onboard the next Bonk or Pepe to our multi-token staking platform, subscribers get first dibs on their airdrops too. This is recurring value, not a one-time gimmick. Subscribe now, earn forever. Launch: December 25th, 2025. The clock is ticking.</p>
      
      <div style="margin-top: 24px; text-align: center;">
        <button onclick="closeFeatureDetail(); window.showPricingModal();" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
          💎 Subscribe Now to Qualify for Airdrops
        </button>
      </div>
    `
  },
  avatars: {
    icon: '🎨',
    title: 'Custom Avatars — Your Identity, Your Way',
    content: `
      <p><strong>Your avatar is your identity in the DarkWave ecosystem.</strong> Unlike platforms that force you into pre-made templates, we give YOU complete creative control. Upload your own image—a photo of your dog, your favorite meme, a selfie, whatever represents you. Or choose from our exclusive DarkWave avatar collections designed by professional crypto artists. Your profile, your rules.</p>
      
      <p><strong>Upload Your Own & We'll Customize It:</strong> Submit any image through our custom avatar form, and our team will transform it exactly how you want. Sure, you could edit it yourself—but there's something special about getting VIP treatment from an actual crypto ecosystem. Choose your style:</p>
      <ul style="font-size: 14px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
        <li><strong>Animated Character</strong> - Turn your photo into a moving GIF or animated loop</li>
        <li><strong>Caricature Style</strong> - Exaggerated cartoon version with personality</li>
        <li><strong>3D Render</strong> - Depth and dimension with realistic lighting</li>
        <li><strong>Crypto Coin Avatar</strong> - Your face on a custom coin design</li>
        <li><strong>Glowing Effects</strong> - Neon borders, holographic shine, RGB glow</li>
        <li><strong>Transparent Background</strong> - Clean cutout ready for any theme</li>
        <li><strong>Or Keep It Raw</strong> - Upload as-is with zero edits if you prefer</li>
      </ul>
      
      <p><strong>Premium Collections Available:</strong> Not artistically inclined? No problem. BASE and TOP tier subscribers get access to exclusive DarkWave avatar sets—Business Cat (professional), Casual Cat (laid-back), seasonal limited editions, and more. Each collection comes with NFT certificates of authenticity minted on Solana. These are tradable, collectible, and scream "I was early."</p>
      
      <p><strong>DWAV Holder Perks:</strong> Stake 10k+ DWAV tokens and unlock advanced customization features like animated effects, holographic borders, and AR-enabled 3D renders. Stake 50k+ DWAV? Get priority access to our artist commission queue for fully custom 1-of-1 designs. Your avatar becomes a living status symbol that evolves with your commitment to the platform.</p>
      
      <p><strong>Future Utility:</strong> Avatars will unlock token-gated Discord channels, priority support, early beta access, and exclusive partner platform perks. Think American Express Black Card benefits, but for crypto. Other platforms treat avatars as throwaway cosmetics. We're building a digital identity system that compounds value over time. Launch: December 25th, 2025. Upload yours on day one.</p>
    `
  },
  platform: {
    icon: '🏆',
    title: 'Multi-Token Staking Platform — The Netflix of Yield Farming',
    content: `
      <p><strong>Sick of juggling 10 different staking platforms?</strong> Each with different wallets, different UIs, different scam risks? DarkWave's multi-token staking platform consolidates EVERYTHING. Stake DWAV, partner tokens, meme coins, blue chips—all in one sleek interface. We're the Netflix of crypto yield: one subscription, unlimited earning potential.</p>
      
      <p><strong>How it works:</strong> We onboard vetted community tokens (think Bonk, WIF, Popcat, etc.) and create staking pools with competitive APYs. Users stake their tokens, earn hourly rewards, and we take a 10% platform fee from the rewards pool. That 10% goes BACK to DWAV holders as revenue share. You're literally earning from OTHER people's staking activity. Passive income on autopilot.</p>
      
      <p><strong>Revenue-backed sustainability:</strong> Unlike Ponzi staking platforms that print tokens out of thin air, our multi-token pools are funded by platform fees from DarkWave Pulse subscriptions AND staking fees from partner tokens. This creates a diversified revenue stream that doesn't rely on infinite new users. We're building for the long haul, not the pump-and-dump.</p>
      
      <p><strong>Partner token benefits:</strong> New projects launching their tokens? They can apply to launch a staking pool on DarkWave, instantly accessing our community of engaged traders. We curate the best projects, reject the rugs, and give YOU access to early-stage opportunities with institutional-grade infrastructure. It's like Y Combinator for meme coins, and DWAV holders get first-class seats. Launch: December 25th, 2025. First 100 partner tokens will be absolute gems.</p>
    `
  },
  multichain: {
    icon: '🌐',
    title: 'Multi-Chain Expansion — Dominate Every Blockchain, Not Just One',
    content: `
      <p><strong>Solana-only tokens are playing checkers.</strong> We're playing 4D chess across every major blockchain. DarkWave Coin launches on Solana for speed and cost-efficiency, then expands to Ethereum (the OG smart contract king), Polygon (for scalability), and Binance Smart Chain (for the CEX crowd). This isn't just diversification—it's total market domination.</p>
      
      <p><strong>Why multi-chain matters:</strong> Each blockchain has its own community, liquidity pools, and cultural vibes. Solana bros love speed. Ethereum maxis demand decentralization. BSC degens chase low fees. By deploying on all four chains, we capture EVERY tribe. And thanks to cross-chain bridges, you can move your DWAV tokens between chains seamlessly. One token, infinite ecosystems.</p>
      
      <p><strong>Liquidity strategy:</strong> We're launching liquidity pools on all major DEXs—Raydium (Solana), Uniswap (Ethereum), QuickSwap (Polygon), PancakeSwap (BSC). This creates deep, fragmented liquidity that's harder for whales to manipulate. No single exchange can rug you. No single chain can kill the project. True decentralization through multi-chain presence.</p>
      
      <p><strong>Future-proof tokenomics:</strong> As new Layer 1s and Layer 2s emerge (Sui, Aptos, Base, etc.), we'll expand there too. DarkWave isn't married to one blockchain—we go wherever the users are. This flexibility ensures longevity while other projects fade into irrelevance on dying chains. We're building the Coca-Cola of crypto: available everywhere, trusted by everyone. Launch: Solana first on December 25th, 2025. Other chains follow in Q1 2026.</p>
    `
  },
  filters: {
    icon: '🎯',
    title: 'Live Category Filters — Already Live, Already Changing the Game',
    content: `
      <p><strong>This feature isn't coming soon—it's HERE right now.</strong> While you're reading this, beta testers are using our Live Category Filters to dominate the market. Filter coins by Top 10 market cap, Memes, DeFi, Blue Chips, Top Gainers (1h or 24h), and Top Losers. It's like having a Bloomberg Terminal for crypto, but mobile-first and Telegram-integrated.</p>
      
      <p><strong>Why this is a killer feature:</strong> CoinMarketCap and CoinGecko are cluttered messes with 20,000+ coins. Good luck finding the next 100x gem in that haystack. Our filters cut through the noise and surface actionable opportunities in seconds. Want to ride the meme wave? Click "Memes." Want blue-chip safety? Click "Blue Chips." Want to catch reversals? Check "Top Losers (1h)." Simple, fast, mobile-optimized.</p>
      
      <p><strong>Blockchain badge system:</strong> Each coin displays its chain (SOL/ETH/POLY/BSC/MULTI) with color-coded gradient badges. This instant visual clarity helps you spot cross-chain opportunities and avoid ecosystem confusion. We even pull live data from CoinGecko's API, so you're always seeing real-time rankings and price changes. No stale data. No guesswork.</p>
      
      <p><strong>V2 exclusive access:</strong> Right now, only VIP beta testers can use this feature. On December 25th, 2025, it goes live for ALL subscribers (BASE and TOP tier). Trial users will see a subscription gate encouraging upgrade. This is how we reward early believers while keeping the platform financially sustainable. Try it today if you're a VIP beta tester. If not, subscribe now and lock in your V2 beta access before launch. The future of crypto research is already here.</p>
    `
  },
  mobileapps: {
    icon: '📱',
    title: 'Native Mobile Apps — iOS & Android Domination (Q2 2026)',
    content: `
      <p><strong>Web apps are cool. Native apps are UNSTOPPABLE.</strong> While most crypto platforms stay stuck in browsers, DarkWave Pulse is going full nuclear with dedicated iOS and Android apps launching in App Stores worldwide in Q2 2026. This isn't a wrapped website—this is native code optimized for speed, security, and the features only mobile can deliver.</p>
      
      <p><strong>Why we're launching EARLY (before the full ecosystem is complete):</strong> By Q2 2026, we'll have the complete V2 platform—analysis tools, DWAV staking, category filters, Crypto Cat AI, and the full glossary system. That's MORE than enough to dominate the "crypto analysis app" category. We'll add wallet features (Phase 4) and payment network (Phase 5) via app updates later. Early launch = early market capture = exponential growth while competitors are still building.</p>
      
      <p><strong>Why native apps destroy web versions:</strong> Push notifications hit your lock screen the INSTANT Bitcoin crashes or Ethereum pumps 10%. Biometric authentication (Face ID, fingerprint) keeps your account secure without passwords. Offline mode caches your watchlist and charts so you can analyze on planes, trains, and underground parking garages. Widgets on your home screen show live price tickers and Fear & Greed Index without even opening the app. This is mobile-first trading intelligence taken to the absolute limit.</p>
      
      <p><strong>App Store visibility = organic growth explosion.</strong> Right now, DarkWave Pulse requires typing a URL or scanning a QR code. That's a barrier. With App Store presence, we get featured in "Finance" and "Business" categories alongside Coinbase and Robinhood. Users discover us through search ("crypto trading app"), reviews, and top charts. We're talking 10,000+ downloads in the first month, then exponential growth as ratings climb and word spreads. This is how niche platforms become household names.</p>
      
      <p><strong>Apple Watch & Wear OS integration:</strong> Track Bitcoin price from your WRIST. Set price alerts that buzz your watch when targets hit. Check Fear & Greed Index during meetings without pulling out your phone. We're building for the future where crypto monitoring is seamless, ambient, and always accessible. Desktop traders are dinosaurs—mobile is king, and wearables are the next frontier.</p>
      
      <p><strong>Same backend, superior experience:</strong> Your DarkWave account works seamlessly across web, iOS, and Android. Start analysis on your laptop, get a push notification on your phone, check details on your watch. All data syncs in real-time via our API, so you never miss a beat. Plus, mobile app subscribers get exclusive beta access to features before they hit the web version. Launch target: June 2026. Just 6 months after V2! Pre-register now for early access notifications.</p>
    `
  },
  earlybird: {
    icon: '💎',
    title: 'Legacy Founder Program — Lock In $4/Month + 35K PULSE Tokens Before Dec 25',
    content: `
      <p><strong>This is NOT a permanent price.</strong> DarkWave Pulse Beta V1 is $4/month—less than a single coffee—but this is strictly an early adopter reward. On December 26, 2025, pricing DOUBLES to $8/month with NO token rewards. And pricing will continue rising to $20/month as we add features. Subscribe NOW and lock in $4/month FOREVER + earn FREE lifetime access after 6 months.</p>
      
      <p><strong>Why we're doing this:</strong> Early believers take the biggest risk. You're joining when the platform is in Beta V1, helping us test and improve. You deserve to be rewarded with pricing that never increases AND massive PULSE token rewards. This isn't a "first month discount"—this is permanent grandfathered pricing for life PLUS 27,000-35,000 PULSE tokens worth thousands at launch.</p>
      
      <p><strong>The pricing jump (don't miss this):</strong></p>
      <ul style="font-size: 14px; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
        <li><strong>NOW - Dec 25, 2025:</strong> $4/month + 35K PULSE tokens + lifetime access (first 10,000 only)</li>
        <li><strong>V2 Launch (Dec 26+):</strong> $8/month — NO token rewards, NO lifetime access</li>
        <li><strong>Future Versions:</strong> Pricing continues rising to $20/month as features expand</li>
      </ul>
      
      <p><strong>What you get as Legacy Founder:</strong> Unlimited crypto & stock analysis, TradingView charts, all technical indicators (RSI, MACD, EMA, Golden/Death Cross), AI-powered Crypto Cat commentary, 143-term glossary, 8-chapter Knowledge Base, portfolio tracking, V2 category filters, staking dashboard, AND 35,000 PULSE tokens at launch. Future users will pay $20/month for the SAME features without ANY tokens.</p>
      
      <p><strong>Save 50% vs V2 pricing, 70% vs future pricing:</strong> TradingView Pro costs $15/month. CoinMarketCap Diamond is $33/month. Crypto.com's advanced tier is $25/month. DarkWave Pulse at $4/month is absurdly underpriced—but only for the first 10,000 Legacy Founders who believed before V2 launch.</p>
      
      <p><strong>Lifetime lock guarantee:</strong> Your $4 rate NEVER increases. Not when V3 launches. Not when mobile apps drop. Not when we hit 100,000 users paying $20/month. You're locked at $4 forever PLUS you go completely FREE after 6 months. This is how we reward our founding believers. Deadline: December 25th, 2025. Miss it, pay double (or more).</p>
    `
  }
};

function openFeatureDetail(featureKey) {
  const feature = featureDetails[featureKey];
  if (!feature) return;
  
  const modal = document.getElementById('featureDetailModal');
  const icon = document.getElementById('featureDetailIcon');
  const title = document.getElementById('featureDetailTitle');
  const body = document.getElementById('featureDetailBody');
  
  if (modal && icon && title && body) {
    icon.textContent = feature.icon;
    title.textContent = feature.title;
    body.innerHTML = feature.content;
    modal.style.display = 'flex';
    console.log(`✅ Feature detail opened: ${featureKey}`);
  }
}

function closeFeatureDetail() {
  const modal = document.getElementById('featureDetailModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// SMS Checkbox Toggle
document.addEventListener('DOMContentLoaded', () => {
  const smsCheckbox = document.getElementById('v2SmsOptIn');
  const phoneInput = document.getElementById('v2WaitlistPhone');
  
  if (smsCheckbox && phoneInput) {
    smsCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        phoneInput.style.display = 'block';
        phoneInput.required = true;
      } else {
        phoneInput.style.display = 'none';
        phoneInput.required = false;
        phoneInput.value = '';
      }
    });
  }
});

// V2 Waitlist Form Submission
async function submitV2Waitlist(event) {
  event.preventDefault();
  
  const email = document.getElementById('v2WaitlistEmail').value.trim();
  const smsOptIn = document.getElementById('v2SmsOptIn').checked;
  const phone = document.getElementById('v2WaitlistPhone').value.trim();
  
  try {
    const response = await fetch('/api/v2-waitlist/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        smsOptIn,
        phone: smsOptIn ? phone : null
      })
    });
    
    if (!response.ok) {
      throw new Error('Subscription failed');
    }
    
    // Show success message
    document.getElementById('v2WaitlistForm').style.display = 'none';
    document.getElementById('v2WaitlistSuccess').style.display = 'block';
    
    console.log('✅ V2 waitlist subscription successful');
  } catch (error) {
    console.error('❌ V2 waitlist subscription error:', error);
    alert('Oops! Something went wrong. Please try again.');
  }
}

// Clear Input Function
function clearInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = '';
    input.focus();
  }
}

// Clear Select Function
function clearSelect(selectId) {
  const select = document.getElementById(selectId);
  if (select) {
    select.selectedIndex = 0;
    select.focus();
  }
}

// Market Cycle Indicator Educational Popups
function showCycleIndicatorPopup(indicator) {
  const persona = window.personaManager ? personaManager.getPersona() : 'business';
  
  const indicatorData = {
    fearGreed: {
      title: 'Fear & Greed Index',
      business: 'The Fear & Greed Index measures market sentiment from 0 (Extreme Fear) to 100 (Extreme Greed). It combines volatility, volume, social media, surveys, and market dominance data. Low values (< 25) suggest oversold conditions and buying opportunities, while high values (> 75) indicate overbought markets and potential corrections.',
      casual: 'This thing literally tells you if everyone\'s panicking (Fear) or FOMOing hard (Greed). Under 25? People are crying in the shower. Over 75? Everyone thinks they\'re a genius. It\'s a contrarian indicator — when everyone\'s greedy, run. When they\'re terrified, that\'s when you strike.'
    },
    rsi: {
      title: 'RSI (Relative Strength Index)',
      business: 'RSI measures momentum on a scale of 0-100 using 14 periods of price data. Values above 70 indicate overbought conditions (potential sell), below 30 indicates oversold conditions (potential buy), and 50 is neutral. RSI divergences can signal trend reversals.',
      casual: 'RSI tells you if price is running too hot or too cold. Above 70? The rocket\'s overheating, might crash soon. Below 30? It\'s frozen in the dumpster, might bounce back. Between 30-70? Nothing interesting happening. Basically a thermometer for hype.'
    },
    macd: {
      title: 'MACD (Moving Average Convergence Divergence)',
      business: 'MACD shows momentum by comparing a 12-period and 26-period exponential moving average (EMA). The histogram is the difference between the MACD line and its 9-period signal line. Positive histogram = bullish momentum, negative = bearish. Crossovers signal trend changes.',
      casual: 'MACD is two lines doing a dance. When the fast line (12-day) crosses above the slow line (26-day), that\'s bullish. When it crosses below? Bearish AF. The histogram is basically momentum visualized — bigger bars = stronger trend. Nerds love this one.'
    },
    trend: {
      title: 'Trend Analysis (SMA 50/200)',
      business: 'Trend detection compares the 50-period Simple Moving Average (SMA50) to the 200-period SMA (SMA200). When SMA50 crosses above SMA200, it creates a "Golden Cross" (bullish). When it crosses below, it\'s a "Death Cross" (bearish). Strong trends occur when both SMAs are moving in the same direction.',
      casual: 'This tracks whether we\'re in an uptrend or downtrend using two moving averages. Golden Cross = 50-day crosses above 200-day = moon mission incoming. Death Cross = 50-day falls below 200-day = prepare for pain. If both are flat? Sideways hell, aka crabbing.'
    }
  };
  
  const data = indicatorData[indicator];
  if (!data) return;
  
  const explanation = persona === 'casual' ? data.casual : data.business;
  
  alert(`📊 ${data.title}\n\n${explanation}`);
}

// Tab Navigation
function bindTabs() {
  const tabBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  console.log('📑 Binding tabs:', tabBtns.length, 'buttons found');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      console.log('🔄 Tab clicked:', targetTab);
      
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Add active to clicked
      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) {
        targetPane.classList.add('active');
        console.log('✅ Tab switched to:', targetTab);
        
        // Disable hide-and-seek on settings tab (for clean admin login experience)
        if (targetTab === 'settings') {
          if (window.hideSeekEnabled !== undefined) {
            window.hideSeekEnabled = false;
          }
          if (window.teardownHideAndSeek) {
            window.teardownHideAndSeek();
          }
          console.log('🔒 Hide-and-seek disabled for Settings tab');
        } else {
          // Re-enable hide-and-seek when leaving settings
          if (window.hideSeekEnabled !== undefined) {
            window.hideSeekEnabled = true;
          }
          if (window.initHideAndSeek) {
            window.initHideAndSeek();
          }
        }
        
        // Initialize stock market data when stocks tab is opened
        if (targetTab === 'stocks') {
          if (typeof initStockMarketData === 'function') {
            initStockMarketData();
          }
          
          // Link glossary terms on stocks page
          if (window.glossaryLinker) {
            setTimeout(() => {
              window.glossaryLinker.linkStocksPage();
            }, 300);
          }
        }
      } else {
        console.error('❌ Tab pane not found:', targetTab);
      }
    });
  });
}

// Public function to switch tabs programmatically (for CTA banners, etc.)
function switchTab(tabName) {
  const tabBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
  const tabPanes = document.querySelectorAll('.tab-pane');
  const tabBtns = document.querySelectorAll('.nav-btn');
  const targetPane = document.getElementById(tabName);
  
  // Always try to switch the tab pane, even without a nav button
  if (targetPane) {
    // Remove active from all
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    
    // Add active to nav button if it exists
    if (tabBtn) {
      tabBtn.classList.add('active');
    }
    
    // Add active to target pane
    targetPane.classList.add('active');
    console.log('✅ Tab switched to:', tabName);
    
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Disable hide-and-seek on settings tab (for clean admin login experience)
    if (tabName === 'settings') {
      if (window.hideSeekEnabled !== undefined) {
        window.hideSeekEnabled = false;
      }
      if (window.teardownHideAndSeek) {
        window.teardownHideAndSeek();
      }
      console.log('🔒 Hide-and-seek disabled for Settings tab');
    } else {
      // Re-enable hide-and-seek when leaving settings
      if (window.hideSeekEnabled !== undefined) {
        window.hideSeekEnabled = true;
      }
      if (window.initHideAndSeek) {
        window.initHideAndSeek();
      }
    }
    
    // Initialize stock market data when stocks tab is opened
    if (tabName === 'stocks') {
      if (typeof initStockMarketData === 'function') {
        initStockMarketData();
      }
      
      // Link glossary terms on stocks page
      if (window.glossaryLinker) {
        setTimeout(() => {
          window.glossaryLinker.linkStocksPage();
        }, 300);
      }
    }
  } else {
    console.error('❌ Tab pane not found:', tabName);
  }
}

// Scroll to project submission form (for footer CTA button)
function scrollToProjectSubmission() {
  // First switch to projects tab
  switchTab('projects');
  
  // Use requestAnimationFrame to ensure tab switch completes before scrolling
  requestAnimationFrame(() => {
    const submissionForm = document.getElementById('projectSubmissionForm');
    if (submissionForm) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      submissionForm.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      
      console.log('✅ Scrolled to project submission form');
    }
  });
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const toggleBtn = document.getElementById('themeToggle');
  
  if (body.classList.contains('theme-dark')) {
    body.className = 'theme-light';
    toggleBtn.textContent = '🌙';
  } else {
    body.className = 'theme-dark';
    toggleBtn.textContent = '☀️';
  }
}

function changeTheme(theme) {
  const body = document.body;
  const toggleBtn = document.getElementById('themeToggle');
  
  body.className = `theme-${theme}`;
  toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Persona Management
function initPersona() {
  // Load saved commentary mode (now supports: off, business, casual, agent)
  // Default to 'off' mode if no saved preference for safer initialization
  const savedCatMode = localStorage.getItem('cryptoCatMode') || 'off';
  
  // CRITICAL: Register personaChanged listener ONCE, globally, regardless of initial mode
  window.addEventListener('personaChanged', (e) => {
    const newPersona = e.detail.persona;
    updatePersonaUI(newPersona);
    updateAllCatImages(newPersona);
    updateFloatingButtons(newPersona);
    refreshAllGauges();
  });
  
  // CRITICAL: Sync the global cryptoCatMode state first
  if (window.setCryptoCatMode) {
    window.setCryptoCatMode(savedCatMode);
  }
  
  if (savedCatMode === 'off') {
    // Initialize in OFF mode
    if (window.personaManager) {
      personaManager.setPersona('off');
    }
    updatePersonaUI('off');
    updateFloatingButtons('off');
    updateAllCatImages('off');
    if (window.hideSeekEnabled !== undefined) {
      window.hideSeekEnabled = false;
    }
    console.log('🔇 Commentary Mode: OFF');
    
    // Refresh gauges to show regular needles
    if (typeof refreshAllGauges === 'function') {
      refreshAllGauges();
    }
  } else if (savedCatMode === 'agent') {
    // Initialize in Agent mode
    // IMPORTANT: Set personaManager first so getCurrentAgent() works in updateFloatingButtons
    if (window.personaManager) {
      personaManager.setPersona('agent');
    }
    
    updatePersonaUI('agent');
    updateFloatingButtons('agent');
    
    // Enable hide and seek for agents
    if (typeof window.hideSeekEnabled !== 'undefined') {
      window.hideSeekEnabled = true;
    }
    
    console.log('🕵️ Commentary Mode: AGENT');
    
    if (typeof refreshAllGauges === 'function') {
      refreshAllGauges();
    }
  } else {
    // Initialize persona manager with business/casual
    if (!window.personaManager) {
      console.error('PersonaManager not loaded');
      return;
    }
    
    // CRITICAL: Sync persona manager with saved mode to trigger personaChanged event
    personaManager.setPersona(savedCatMode);
    
    console.log(`🎙️ Commentary Mode: ${savedCatMode}`);
    
    // NOTE: updatePersonaUI, updateAllCatImages, and refreshAllGauges
    // will be triggered by personaChanged event listener
  }
}

function setPersonaMode(mode) {
  // Orchestrate Commentary Mode: 'business', 'casual', 'agent', or 'off'
  localStorage.setItem('cryptoCatMode', mode);
  
  if (mode === 'off') {
    // OFF Mode: disable all character interactions
    if (window.setCryptoCatMode) {
      window.setCryptoCatMode('off');
    }
    
    // Set persona to off (triggers personaChanged event)
    if (window.personaManager) {
      personaManager.setPersona('off');
    }
    
    // Disable hide and seek
    if (typeof window.hideSeekEnabled !== 'undefined') {
      window.hideSeekEnabled = false;
    }
    
    // Teardown active popups and hotspots
    if (window.closeCatPopup) window.closeCatPopup();
    if (window.teardownHideAndSeek) window.teardownHideAndSeek();
    
    // Update UI buttons
    updatePersonaUI('off');
    updateFloatingButtons('off');
    updateAllCatImages('off');
    
    console.log('🔇 Commentary Mode set to: OFF');
    
    // Refresh gauges to show regular needles
    if (typeof refreshAllGauges === 'function') {
      refreshAllGauges();
    }
  } else if (mode === 'agent') {
    // Agent Mode
    if (window.setCryptoCatMode) {
      window.setCryptoCatMode('agent');
    }
    
    if (window.personaManager) {
      personaManager.setPersona('agent');
    }
    
    // Enable hide and seek for agents
    if (typeof window.hideSeekEnabled !== 'undefined') {
      window.hideSeekEnabled = true;
    }
    if (window.initHideAndSeek) {
      window.initHideAndSeek();
    }
    
    // Update UI
    updatePersonaUI('agent');
    updateFloatingButtons('agent');
    
    console.log('🕵️ Agent mode activated');
    
    if (typeof refreshAllGauges === 'function') {
      refreshAllGauges();
    }
  } else {
    // Business or Casual Cat Mode
    if (!window.personaManager) {
      console.error('PersonaManager not loaded');
      return;
    }
    
    // Set persona (business or casual only) - this will trigger personaChanged event
    personaManager.setPersona(mode);
    
    // Enable commentary mode
    if (window.setCryptoCatMode) {
      window.setCryptoCatMode(mode);
    }
    
    // Re-enable hide and seek
    if (typeof window.hideSeekEnabled !== 'undefined') {
      window.hideSeekEnabled = true;
    }
    if (window.initHideAndSeek) {
      window.initHideAndSeek();
    }
    
    console.log(`🐱 Crypto Cat set to ${mode} mode`);
    
    // NOTE: UI updates handled by personaChanged event listener
  }
}

// Update floating buttons with character cutouts based on mode
function updateFloatingButtons(mode) {
  // Update character system floating button
  if (window.characterSystem) {
    window.characterSystem.currentMode = mode;
    window.characterSystem.updateFloatingButton();
  }
  
  // Get character image for current mode using transparent cutouts
  const getCharacterImage = () => {
    if (mode === 'off') return null;
    if (mode === 'agent') {
      const agent = window.personaManager?.getCurrentAgent();
      if (agent && agent.image) {
        return agent.image.replace('/trading-cards/', '/trading-cards-cutouts/');
      }
      return '/trading-cards-cutouts/caucasian_blonde_male_agent.png';
    }
    if (mode === 'business') {
      return '/trading-cards-cutouts/Grumpy_cat_neutral_pose_ba4a1b4d.png';
    }
    if (mode === 'casual') {
      return '/trading-cards-cutouts/Grumpy_cat_sideeye_pose_5e52df88.png';
    }
    return null;
  };
  
  const charImage = getCharacterImage();
  
  // Update Community/Chat floating button (correct ID: floatingCommunityBtn)
  const communityBtn = document.getElementById('floatingCommunityBtn');
  if (communityBtn) {
    const iconSpan = communityBtn.querySelector('.floating-btn-icon');
    if (charImage && mode !== 'off') {
      if (iconSpan) {
        iconSpan.innerHTML = `<img src="${charImage}" alt="Chat" style="width: 32px; height: 32px; object-fit: cover; object-position: top; border-radius: 50%;">`;
      }
      communityBtn.style.opacity = '1';
    } else {
      if (iconSpan) iconSpan.innerHTML = '💬';
      communityBtn.style.opacity = '0.5';
    }
  }
  
  // Update AI floating button (correct ID: floatingAIBtn)
  const aiBtn = document.getElementById('floatingAIBtn');
  if (aiBtn) {
    const iconSpan = aiBtn.querySelector('.floating-btn-icon');
    if (charImage && mode !== 'off') {
      if (iconSpan) {
        iconSpan.innerHTML = `<img src="${charImage}" alt="AI" style="width: 32px; height: 32px; object-fit: cover; object-position: top; border-radius: 50%;">`;
      }
      aiBtn.style.opacity = '1';
    } else {
      if (iconSpan) iconSpan.innerHTML = '🤖';
      aiBtn.style.opacity = '0.5';
    }
  }
  
  console.log('✅ Floating buttons updated for mode:', mode);
}
window.updateFloatingButtons = updateFloatingButtons;

function updatePersonaUI(persona) {
  const businessBtn = document.getElementById('businessBtn');
  const casualBtn = document.getElementById('casualBtn');
  const offBtn = document.getElementById('offBtn');
  const agentBtn = document.getElementById('agentBtn');
  
  // Remove active from all buttons that exist
  if (businessBtn) businessBtn.classList.remove('active');
  if (casualBtn) casualBtn.classList.remove('active');
  if (offBtn) offBtn.classList.remove('active');
  if (agentBtn) agentBtn.classList.remove('active');
  
  // Set active based on mode
  if (persona === 'business' && businessBtn) {
    businessBtn.classList.add('active');
  } else if (persona === 'casual' && casualBtn) {
    casualBtn.classList.add('active');
  } else if (persona === 'off' && offBtn) {
    offBtn.classList.add('active');
  } else if (persona === 'agent' && agentBtn) {
    agentBtn.classList.add('active');
  }
  
  // Also update floating buttons
  updateFloatingButtons(persona);
}

function updateAllCatImages(persona) {
  if (!window.personaManager) return;
  
  // Get current agent for agent mode - use cutout images
  const currentAgent = personaManager.getCurrentAgent();
  let agentImage = currentAgent ? currentAgent.image : '/trading-cards-cutouts/caucasian_blonde_male_agent.png';
  agentImage = agentImage.replace('/trading-cards/', '/trading-cards-cutouts/');
  
  const catImage = document.getElementById('catImage');
  if (catImage) {
    if (persona === 'agent') {
      catImage.src = agentImage;
    } else if (persona === 'off') {
      catImage.style.display = 'none';
    } else {
      catImage.style.display = '';
      catImage.src = personaManager.getImage('pointing');
    }
  }
  
  const gaugePopupImg = document.getElementById('gaugePopupCatImage');
  if (gaugePopupImg) {
    if (persona === 'agent') {
      gaugePopupImg.src = agentImage;
    } else if (persona === 'off') {
      gaugePopupImg.style.display = 'none';
    } else {
      gaugePopupImg.style.display = '';
      gaugePopupImg.src = personaManager.getImage('explaining');
    }
  }
  
  const footerImg = document.getElementById('footerCatImage');
  if (footerImg) {
    if (persona === 'agent') {
      footerImg.src = agentImage;
    } else if (persona === 'off') {
      footerImg.style.display = 'none';
    } else {
      footerImg.style.display = '';
      footerImg.src = personaManager.getImage('pointing');
    }
  }
  
  // Update Stocks Coming Soon character and message
  const stocksComingSoonCat = document.getElementById('stocksComingSoonCat');
  const stocksComingSoonTitle = document.getElementById('stocksComingSoonTitle');
  
  if (stocksComingSoonCat) {
    if (persona === 'agent') {
      stocksComingSoonCat.src = agentImage;
    } else if (persona === 'off') {
      stocksComingSoonCat.style.display = 'none';
    } else {
      stocksComingSoonCat.style.display = '';
      stocksComingSoonCat.src = personaManager.getImage('pointing');
    }
  }
  
  if (stocksComingSoonTitle) {
    if (persona === 'agent') {
      const agentName = currentAgent ? currentAgent.name : 'Agent';
      stocksComingSoonTitle.textContent = `"Intel indicates this section is under development. Stand by for deployment."\n— ${agentName}`;
    } else if (persona === 'casual') {
      stocksComingSoonTitle.textContent = '"HEY I\'M THE ONLY ONE WORKING ON THIS! GIVE ME SOME TIME... COMING SOON"\n— Crypto Cat';
    } else if (persona === 'off') {
      stocksComingSoonTitle.textContent = 'COMING SOON';
    } else {
      stocksComingSoonTitle.textContent = '"This portion of the stock page will be ready soon. Please give me a little more time as I am the only one working on it. Thank you."\n— Crypto Cat';
    }
  }
  
  // Update Projects Coming Soon character and message
  const comingSoonCat1 = document.getElementById('comingSoonCat1');
  const comingSoon1Title = document.getElementById('comingSoon1Title');
  
  if (comingSoonCat1) {
    if (persona === 'agent') {
      comingSoonCat1.src = agentImage;
    } else if (persona === 'off') {
      comingSoonCat1.style.display = 'none';
    } else {
      comingSoonCat1.style.display = '';
      comingSoonCat1.src = personaManager.getImage('pointing');
    }
  }
  
  if (comingSoon1Title) {
    if (persona === 'agent') {
      comingSoon1Title.textContent = '"Additional projects currently classified. Awaiting clearance."';
    } else if (persona === 'casual') {
      comingSoon1Title.textContent = '"MORE DOPE PROJECTS COMING SOON! STAY TUNED!"';
    } else if (persona === 'off') {
      comingSoon1Title.textContent = 'MORE PROJECTS COMING SOON';
    } else {
      comingSoon1Title.textContent = 'MORE PROJECTS COMING SOON';
    }
  }
  
  // Switch glossary banner based on persona
  const casualGlossaryCat = document.getElementById('casualGlossaryCat');
  const businessGlossaryCat = document.getElementById('businessGlossaryCat');
  
  if (casualGlossaryCat && businessGlossaryCat) {
    if (persona === 'off' || persona === 'agent') {
      casualGlossaryCat.style.display = 'none';
      businessGlossaryCat.style.display = 'none';
    } else if (persona === 'business') {
      casualGlossaryCat.style.display = 'none';
      businessGlossaryCat.style.display = 'block';
    } else {
      casualGlossaryCat.style.display = 'block';
      businessGlossaryCat.style.display = 'none';
    }
  }
  
  // Update floating AI modal header image
  const floatingCatImage = document.getElementById('floatingCatImage');
  if (floatingCatImage) {
    if (persona === 'agent') {
      floatingCatImage.src = agentImage;
    } else if (persona === 'off') {
      floatingCatImage.src = '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png';
    } else {
      floatingCatImage.src = personaManager.getImage('pointing');
    }
  }
}

// Commentary Mode Toggle (Legacy)
function changeCatMode(mode) {
  currentCatMode = mode;
  const modeDisplay = document.getElementById('catMode');
  modeDisplay.textContent = mode === 'smartass' ? 'Smartass Mode' : 'Normal Mode';
}

// Chart Toggle
function toggleChart(chartType) {
  const sparkline = document.getElementById('sparklineChart');
  const candle = document.getElementById('candleChart');
  const mainSparklineBtn = document.getElementById('mainSparklineBtn');
  const mainCandleBtn = document.getElementById('mainCandleBtn');
  
  console.log('📊 Toggling chart to:', chartType);
  
  // Remove active from all canvases
  sparkline.classList.remove('active');
  candle.classList.remove('active');
  
  // Remove active from buttons
  if (mainSparklineBtn) mainSparklineBtn.classList.remove('active');
  if (mainCandleBtn) mainCandleBtn.classList.remove('active');
  
  // Activate selected chart
  if (chartType === 'sparkline') {
    sparkline.classList.add('active');
    if (mainSparklineBtn) mainSparklineBtn.classList.add('active');
    // Force resize and redraw after becoming visible
    setTimeout(() => {
      if (dashboardSparklineChart) {
        const width = sparkline.clientWidth || 600;
        dashboardSparklineChart.applyOptions({ width });
        dashboardSparklineChart.timeScale().fitContent();
        console.log('✅ Sparkline chart resized to width:', width);
      }
    }, 50);
  } else {
    candle.classList.add('active');
    if (mainCandleBtn) mainCandleBtn.classList.add('active');
    // Force resize and redraw after becoming visible
    setTimeout(() => {
      if (dashboardCandleChart) {
        const width = candle.clientWidth || 600;
        dashboardCandleChart.applyOptions({ width });
        dashboardCandleChart.timeScale().fitContent();
        console.log('✅ Candlestick chart resized to width:', width);
      }
    }, 50);
  }
}

// Add touch responsiveness to macro chart containers
function setupMacroChartTouchHandlers() {
  const sparklineChart = document.getElementById('sparklineChart');
  const candleChart = document.getElementById('candleChart');
  
  const openFullscreen = () => {
    if (window.fullscreenChartController && window.fullscreenChartController.open) {
      window.fullscreenChartController.open(currentMainChartTimeframe, currentChartDataType);
    }
  };
  
  // Single tap opens fullscreen
  [sparklineChart, candleChart].forEach(chart => {
    if (chart) {
      chart.style.cursor = 'pointer';
      chart.style.touchAction = 'none';
      chart.addEventListener('click', openFullscreen, false);
      chart.addEventListener('touchend', (e) => {
        e.preventDefault();
        openFullscreen();
      }, false);
    }
  });
}

// Sparkline Color Settings
const sparklineColorPresets = {
  purple: { lineColor: '#8338EC', topColor: 'rgba(131, 56, 236, 0.4)', bottomColor: 'rgba(131, 56, 236, 0)' },
  blue: { lineColor: '#3B82F6', topColor: 'rgba(59, 130, 246, 0.4)', bottomColor: 'rgba(59, 130, 246, 0)' },
  green: { lineColor: '#10B981', topColor: 'rgba(16, 185, 129, 0.4)', bottomColor: 'rgba(16, 185, 129, 0)' },
  red: { lineColor: '#EF4444', topColor: 'rgba(239, 68, 68, 0.4)', bottomColor: 'rgba(239, 68, 68, 0)' },
  orange: { lineColor: '#F59E0B', topColor: 'rgba(245, 158, 11, 0.4)', bottomColor: 'rgba(245, 158, 11, 0)' },
  pink: { lineColor: '#EC4899', topColor: 'rgba(236, 72, 153, 0.4)', bottomColor: 'rgba(236, 72, 153, 0)' }
};

function toggleColorSettings() {
  const panel = document.getElementById('colorPickerPanel');
  if (panel) {
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    panel.style.display = isHidden ? 'block' : 'none';
    console.log('🎨 Color picker panel toggled:', isHidden ? 'OPEN' : 'CLOSED');
  } else {
    console.error('❌ Color picker panel not found!');
  }
}

function applySparklineColor(colorName) {
  const colors = sparklineColorPresets[colorName];
  if (!colors || !dashboardSparklineSeries) return;
  
  // Update the chart colors
  dashboardSparklineSeries.applyOptions(colors);
  
  // Update active button
  document.querySelectorAll('.color-preset-mini').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.color === colorName) {
      btn.classList.add('active');
    }
  });
  
  // Save preference
  localStorage.setItem('sparklineColor', colorName);
  
  console.log(`🎨 Applied ${colorName} color to sparkline`);
}

// Apply saved color on load
function applySavedSparklineColor() {
  const savedColor = localStorage.getItem('sparklineColor') || 'pink';
  applySparklineColor(savedColor);
  setupMacroChartTouchHandlers();
}

// Wrapper for theme selector to change chart colors
function setSparklineColor(colorName) {
  applySparklineColor(colorName);
  console.log(`✅ Chart color updated to ${colorName}`);
}

// Toggle between Macro and Bitcoin modes
function toggleChartMode(mode) {
  currentMainChartMode = mode;
  
  // Update button states
  const macroBtn = document.getElementById('macroModeBtn');
  const btcBtn = document.getElementById('bitcoinModeBtn');
  
  if (macroBtn && btcBtn) {
    macroBtn.classList.toggle('active', mode === 'macro');
    btcBtn.classList.toggle('active', mode === 'bitcoin');
    console.log(`✅ Chart mode toggled: ${mode}`);
  }
  
  // Refresh chart with new mode
  updateDashboardCharts(currentMainChartTimeframe);
  updateChartTitle();
}

// Update chart title based on mode and data type
function updateChartTitle() {
  const chartTitle = document.getElementById('mainChartTitle');
  if (chartTitle) {
    if (currentMainChartMode === 'macro') {
      chartTitle.textContent = currentChartDataType === 'price' ? 'Total Market Cap' : 'Total Volume';
    } else {
      chartTitle.textContent = currentChartDataType === 'price' ? 'Bitcoin' : 'Bitcoin Volume';
    }
  }
}

// Toggle between Price and Volume charts
function toggleChartDataType(dataType) {
  currentChartDataType = dataType;
  
  // Update button states
  const priceBtn = document.getElementById('priceChartBtn');
  const volumeBtn = document.getElementById('volumeChartBtn');
  
  if (priceBtn && volumeBtn) {
    priceBtn.classList.toggle('active', dataType === 'price');
    volumeBtn.classList.toggle('active', dataType === 'volume');
    console.log(`✅ Chart data type toggled: ${dataType}`);
  }
  
  // Refresh the chart with current timeframe
  updateDashboardCharts(currentMainChartTimeframe);
  updateChartTitle();
}

// Timeframe Configuration (standardized identifiers)
const TIMEFRAME_CONFIG = {
  '1h': { interval: 1, label: '1 Hour', description: 'Minute candles for 1 hour' },
  '4h': { interval: 4, label: '4 Hours', description: '4-hour candles' },
  '1d': { interval: 60, label: '24 Hours', description: 'Hourly candles for 1 day' },
  '7d': { interval: 240, label: '7 Days', description: '4-hour candles for 7 days' },
  '1mo': { interval: 1440, label: '1 Month', description: 'Daily candles for 1 month' },
  '1y': { interval: 1440, label: '1 Year', description: 'Daily candles for 1 year' },
  'all': { interval: 10080, label: 'All Time', description: 'Weekly candles since inception' }
};

// Current main chart timeframe (standardized to '1d', '1y', 'all')
let currentMainChartTimeframe = '1d';

// Current main chart mode
let currentMainChartMode = 'bitcoin'; // 'bitcoin' or 'macro'

// Dashboard chart instances (TradingView Lightweight Charts)
let dashboardSparklineChart = null;
let dashboardCandleChart = null;
let dashboardSparklineSeries = null;
let dashboardCandleSeries = null;

// Stock chart instances (TradingView Lightweight Charts - identical to crypto)
let stockSparklineChart = null;
let stockCandleChart = null;
let stockSparklineSeries = null;
let stockCandleSeries = null;

let currentStockSymbol = 'SPY'; // S&P 500 for macro market overview
let currentStockTimeframe = '24hr';
let currentChartDataType = 'price'; // 'price' or 'volume'

// Request debouncing to prevent rate limiting
let chartUpdateDebounceTimer = null;
let pendingChartTimeframe = null;
const CHART_DEBOUNCE_MS = 500; // Wait 500ms before fetching to debounce rapid clicks

// Update Main Chart with Timeframe (debounced to prevent rate limiting)
async function updateMainChart(timeframe, event) {
  // Clear any pending update
  if (chartUpdateDebounceTimer) {
    clearTimeout(chartUpdateDebounceTimer);
  }
  
  // Store the pending timeframe
  pendingChartTimeframe = timeframe;
  
  // Update UI immediately for responsiveness
  document.querySelectorAll('.market-timeframes-main .tf-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`.market-timeframes-main .tf-btn[data-tf="${timeframe}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }
  
  // Debounce the actual data fetch
  chartUpdateDebounceTimer = setTimeout(async () => {
    try {
      const previousTimeframe = currentMainChartTimeframe;
      const previousActiveBtn = document.querySelector('.market-timeframes-main .tf-btn.active');
      
      // Use the pending timeframe (in case of rapid clicks)
      const tf = pendingChartTimeframe || timeframe;
      currentMainChartTimeframe = tf;
      
      console.log(`📊 Updating main chart to ${tf} timeframe`);
      
      const success = await updateDashboardCharts(tf);
      
      if (!success) {
        console.warn('⚠️ Chart update failed, restoring previous timeframe');
        currentMainChartTimeframe = previousTimeframe;
        document.querySelectorAll('.market-timeframes-main .tf-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        if (previousActiveBtn) {
          previousActiveBtn.classList.add('active');
        }
        return;
      }
      
      fetchMacroMarketMetrics();
    } catch (error) {
      console.error('❌ Error updating main chart:', error);
    }
  }, CHART_DEBOUNCE_MS);
}

// Fetch Macro Market Metrics
async function fetchMacroMarketMetrics() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();
    
    if (data && data.data) {
      const { total_market_cap, total_volume, market_cap_percentage, market_cap_change_percentage_24h_usd } = data.data;
      
      // Update Total Market Cap with color coding
      const totalCap = total_market_cap.usd;
      const marketCapElement = document.getElementById('totalMarketCap');
      const marketCapDisplay = document.getElementById('marketCapDisplay');
      const marketCapChange = document.getElementById('marketCapChange');
      
      // Format market cap with proper T/B suffix
      const capText = totalCap >= 1e12 
        ? `$${(totalCap / 1e12).toFixed(2)}T` 
        : `$${(totalCap / 1e9).toFixed(1)}B`;
      
      // Smart formatting for market cap change - show 2 decimals for small changes
      const absChange = Math.abs(market_cap_change_percentage_24h_usd);
      const decimals = absChange < 0.1 ? 2 : 1; // Use 2 decimals if < 0.1%
      const capChangeText = `${market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}${market_cap_change_percentage_24h_usd.toFixed(decimals)}%`;
      
      if (marketCapElement) {
        marketCapElement.textContent = capText;
        // Apply green/red color based on 24h change
        if (market_cap_change_percentage_24h_usd > 0) {
          marketCapElement.style.color = '#00ff41'; // Green
        } else if (market_cap_change_percentage_24h_usd < 0) {
          marketCapElement.style.color = '#ff006e'; // Red
        } else {
          marketCapElement.style.color = '#ffffff'; // White
        }
      }
      
      // Update gauge box market cap display
      if (marketCapDisplay) {
        marketCapDisplay.textContent = capText;
        if (market_cap_change_percentage_24h_usd > 0) {
          marketCapDisplay.style.color = '#00ff41'; // Green
        } else if (market_cap_change_percentage_24h_usd < 0) {
          marketCapDisplay.style.color = '#ff006e'; // Red
        } else {
          marketCapDisplay.style.color = '#ffffff'; // White
        }
      }
      
      // Update market cap 24hr change percentage
      if (marketCapChange) {
        marketCapChange.textContent = capChangeText;
        if (market_cap_change_percentage_24h_usd > 0) {
          marketCapChange.style.color = '#00ff41'; // Green
        } else if (market_cap_change_percentage_24h_usd < 0) {
          marketCapChange.style.color = '#ff006e'; // Red
        } else {
          marketCapChange.style.color = '#888888'; // Gray
        }
      }
      
      // Update 24h Volume in macro metrics
      const totalVol = total_volume.usd;
      
      // Format volume with proper M/B suffix
      const volText = totalVol >= 1e9 
        ? `$${(totalVol / 1e9).toFixed(1)}B` 
        : `$${(totalVol / 1e6).toFixed(0)}M`;
      
      // Update macro metrics volume
      const volumeElement = document.getElementById('totalVolume');
      if (volumeElement) {
        volumeElement.textContent = volText;
      }
      
      // Calculate and display volume flow (inflow/outflow) - Simple display
      const volumeFlowElement = document.getElementById('volumeFlow');
      if (volumeFlowElement) {
        // Use market cap change as proxy for volume direction (simpler approach)
        const marketSentiment = market_cap_change_percentage_24h_usd;
        
        if (marketSentiment > 0) {
          volumeFlowElement.textContent = '↑ Inflow';
          volumeFlowElement.style.color = '#00ff41'; // Green
        } else if (marketSentiment < 0) {
          volumeFlowElement.textContent = '↓ Outflow';
          volumeFlowElement.style.color = '#ff006e'; // Red
        } else {
          volumeFlowElement.textContent = '— Neutral';
          volumeFlowElement.style.color = '#888';
        }
        
        console.log('✅ Volume flow updated:', volumeFlowElement.textContent);
      } else {
        console.error('❌ volumeFlow element not found!');
      }
      
      // Update Volume Display in gauge box
      const volumeDisplay = document.getElementById('volumeDisplay');
      const volumeChange = document.getElementById('volumeChange');
      
      // Use market cap change as indicator for volume sentiment (reasonable proxy)
      const marketSentiment = market_cap_change_percentage_24h_usd;
      const volChangeText = `${marketSentiment >= 0 ? '+' : ''}${marketSentiment.toFixed(1)}%`;
      
      if (volumeDisplay) {
        volumeDisplay.textContent = volText;
        if (marketSentiment > 0) {
          volumeDisplay.style.color = '#00ff41'; // Green
        } else if (marketSentiment < 0) {
          volumeDisplay.style.color = '#ff006e'; // Red
        } else {
          volumeDisplay.style.color = '#ffffff'; // White
        }
      }
      
      // Update volume bars dynamically based on market sentiment
      const volumeBars = document.getElementById('volumeBars');
      if (volumeBars) {
        const isPositive = marketSentiment >= 0;
        volumeBars.innerHTML = `
          <div class="vol-bar ${isPositive ? 'green' : 'red'}" style="height: 16px;"></div>
          <div class="vol-bar ${isPositive ? 'green' : 'red'}" style="height: 20px;"></div>
          <div class="vol-bar ${isPositive ? 'green' : 'red'}" style="height: 14px;"></div>
        `;
      }
      
      if (volumeChange) {
        volumeChange.textContent = volChangeText;
        if (marketSentiment > 0) {
          volumeChange.style.color = '#00ff41'; // Green
        } else if (marketSentiment < 0) {
          volumeChange.style.color = '#ff006e'; // Red
        } else {
          volumeChange.style.color = '#888888'; // Gray
        }
      }
      
      // Update volume flow indicator in metric box
      const volumeFlowIndicator = document.getElementById('volumeFlowIndicator');
      if (volumeFlowIndicator) {
        if (marketSentiment > 0) {
          volumeFlowIndicator.textContent = '↑ Inflow';
          volumeFlowIndicator.style.color = '#00ff41'; // Green
        } else if (marketSentiment < 0) {
          volumeFlowIndicator.textContent = '↓ Outflow';
          volumeFlowIndicator.style.color = '#ff006e'; // Red
        } else {
          volumeFlowIndicator.textContent = '— Neutral';
          volumeFlowIndicator.style.color = '#888';
        }
      }
      
      // Update BTC Dominance
      const btcDom = market_cap_percentage.btc;
      const btcDomElement = document.getElementById('btcDominance');
      if (btcDomElement) {
        btcDomElement.textContent = `${btcDom.toFixed(1)}%`;
        console.log('✅ BTC Dominance updated:', btcDom.toFixed(1) + '%');
      } else {
        console.error('❌ btcDominance element not found');
      }
      
      console.log('✅ Macro market metrics updated:', { 
        marketCap: capText, 
        volume: volText, 
        btcDominance: btcDom.toFixed(1) + '%' 
      });
    }
  } catch (error) {
    console.error('❌ Error fetching macro metrics:', error);
  }
}

// Update Live Coin Prices in Table
async function updateCoinPrices() {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT', 'DOTUSDT'];
    
    // Fetch 24h ticker data from backend proxy (Binance is geo-blocked from frontend)
    const response = await fetch('/api/crypto/coin-prices');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coin prices: ${response.statusText}`);
    }
    
    const allTickers = await response.json();
    
    // Create a mapping of symbol -> ticker data
    const tickerMap = {};
    allTickers.forEach(ticker => {
      if (symbols.includes(ticker.symbol)) {
        // Extract coin name (BTC from BTCUSDT)
        const coinName = ticker.symbol.replace('USDT', '');
        tickerMap[coinName] = ticker;
      }
    });
    
    // Update each row in the coin table by matching coin symbol
    const tableBody = document.getElementById('coinTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.getElementsByTagName('td');
      
      if (cells.length >= 4) {
        // Extract coin symbol from first cell (e.g., "BTC" from "<strong>BTC</strong>")
        const coinSymbol = cells[0].textContent.trim();
        const ticker = tickerMap[coinSymbol];
        
        if (ticker) {
          // Update price
          const price = parseFloat(ticker.lastPrice);
          const change = parseFloat(ticker.priceChangePercent);
          
          cells[1].textContent = price >= 1000 ? `$${price.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : 
                                  price >= 1 ? `$${price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` :
                                  `$${price.toFixed(6)}`;
          // Color price based on 24h change
          cells[1].className = change >= 0 ? 'positive' : 'negative';
          
          // Update 24h change
          cells[2].textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
          cells[2].className = change >= 0 ? 'positive' : 'negative';
          
          // Update volume
          const volume = parseFloat(ticker.quoteVolume);
          cells[3].textContent = volume >= 1e9 ? `$${(volume / 1e9).toFixed(1)}B` : `$${(volume / 1e6).toFixed(1)}M`;
          cells[3].className = change >= 0 ? 'positive' : 'negative';
          
          console.log(`✅ Updated ${coinSymbol}: $${price.toFixed(2)}`);
        }
      }
    }
    
    console.log('✅ Live coin prices updated successfully');
  } catch (error) {
    console.error('❌ Error updating coin prices:', error);
  }
}

// Stock quote cache to avoid rate limiting (2-minute cache)
const stockQuoteCache = {
  data: {},
  timestamp: 0,
  isValid: function() {
    return Date.now() - this.timestamp < 120000; // 2 minutes
  }
};

// Update Live Stock Prices in Table
async function updateStockPrices() {
  try {
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'AMD'];
    
    const tableBody = document.getElementById('stockTableBody');
    if (!tableBody) return;
    
    // Check cache first to avoid rate limiting
    if (stockQuoteCache.isValid() && Object.keys(stockQuoteCache.data).length > 0) {
      console.log('📦 Using cached stock quotes (avoiding rate limit)');
      updateStockTableWithQuotes(stockQuoteCache.data, tableBody);
      return;
    }
    
    // Fetch quotes for all symbols in parallel
    const quotePromises = symbols.map(symbol => 
      fetch(`/api/stocks/quote/${symbol}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
    );
    
    const quotes = await Promise.all(quotePromises);
    
    // Cache the results
    const quoteMap = {};
    symbols.forEach((symbol, i) => {
      if (quotes[i]) {
        quoteMap[symbol] = quotes[i];
      }
    });
    stockQuoteCache.data = quoteMap;
    stockQuoteCache.timestamp = Date.now();
    
    updateStockTableWithQuotes(quoteMap, tableBody);
    console.log('✅ Live stock prices updated successfully');
  } catch (error) {
    console.error('❌ Error updating stock prices:', error);
  }
}

function updateStockTableWithQuotes(quoteMap, tableBody) {
  const symbols = ['AAPL', 'TSLA', 'NVDA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'AMD'];
  const rows = tableBody.getElementsByTagName('tr');
  
  for (let i = 0; i < rows.length && i < symbols.length; i++) {
    const symbol = symbols[i];
    const quote = quoteMap[symbol];
    
    if (!quote || !quote.currentPrice) {
      console.warn(`⚠️ Missing stock data for symbol: ${symbol}`);
      continue;
    }
    
    const row = rows[i];
    const cells = row.getElementsByTagName('td');
    
    if (cells.length >= 4) {
      // Update price
      const change = quote.change24h || 0;
      
      cells[1].textContent = `$${quote.currentPrice.toFixed(2)}`;
      // Color price based on 24h change
      cells[1].className = change >= 0 ? 'positive' : 'negative';
      
      // Update 24h change
      cells[2].textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      cells[2].className = change >= 0 ? 'positive' : 'negative';
      
      // Volume is already static in table
    }
  }
}

// Initialize Charts with real BTC data (TradingView Lightweight Charts)
async function initCharts() {
  const sparklineContainer = document.getElementById('sparklineChart');
  const candleContainer = document.getElementById('candleChart');
  
  if (!sparklineContainer || !candleContainer) {
    console.error('❌ Chart containers not found');
    return;
  }
  
  // Check if TradingView Lightweight Charts is available
  if (typeof LightweightCharts === 'undefined') {
    console.error('❌ TradingView LightweightCharts library not loaded');
    return;
  }
  
  try {
    console.log('📊 Initializing TradingView Lightweight Charts for dashboard');
    
    // Create sparkline chart (area series) - only once
    if (!dashboardSparklineChart) {
      console.log('Creating sparkline chart...');
      dashboardSparklineChart = LightweightCharts.createChart(sparklineContainer, {
        width: sparklineContainer.clientWidth,
        height: 200,
        layout: { background: { color: '#1A1A1A' }, textColor: '#D9D9D9' },
        grid: { vertLines: { color: '#2B2B2B' }, horzLines: { color: '#2B2B2B' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Magnet },
        timeScale: { borderColor: '#2B2B2B', timeVisible: true },
        rightPriceScale: { borderColor: '#2B2B2B' },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true }
      });
      
      dashboardSparklineSeries = dashboardSparklineChart.addAreaSeries({
        lineColor: '#8338EC',
        topColor: 'rgba(131, 56, 236, 0.4)',
        bottomColor: 'rgba(131, 56, 236, 0)',
        lineWidth: 2
      });
      console.log('✅ Sparkline chart created');
    }
    
    // Create candle chart (candlestick series) - only once
    // IMPORTANT: Temporarily show container to get proper width since it starts hidden
    if (!dashboardCandleChart) {
      console.log('Creating candle chart...');
      
      // Temporarily show container to measure width correctly
      const wasHidden = !candleContainer.classList.contains('active');
      if (wasHidden) {
        candleContainer.style.visibility = 'hidden';
        candleContainer.style.display = 'block';
        candleContainer.style.position = 'absolute';
      }
      
      // Use sparkline container width as fallback (they're in same parent)
      const containerWidth = candleContainer.clientWidth || sparklineContainer.clientWidth || 600;
      
      dashboardCandleChart = LightweightCharts.createChart(candleContainer, {
        width: containerWidth,
        height: 200,
        layout: { background: { color: '#1A1A1A' }, textColor: '#D9D9D9' },
        grid: { vertLines: { color: '#2B2B2B' }, horzLines: { color: '#2B2B2B' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Magnet },
        timeScale: { borderColor: '#2B2B2B', timeVisible: true },
        rightPriceScale: { borderColor: '#2B2B2B' },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true }
      });
      
      // Restore hidden state
      if (wasHidden) {
        candleContainer.style.visibility = '';
        candleContainer.style.display = '';
        candleContainer.style.position = '';
      }
      
      dashboardCandleSeries = dashboardCandleChart.addCandlestickSeries({
        upColor: '#16C784',
        downColor: '#EA3943',
        borderVisible: false,
        wickUpColor: '#16C784',
        wickDownColor: '#EA3943'
      });
      console.log('✅ Candle chart created with width:', containerWidth);
      
      // Add double-tap handler for landscape fullscreen
      addDashboardChartFullscreenHandler(candleContainer, 'candle');
    }
    
    // Add double-tap handler for sparkline chart
    if (dashboardSparklineChart) {
      addDashboardChartFullscreenHandler(sparklineContainer, 'sparkline');
    }
    
    // Ensure charts and series exist before updating
    if (dashboardSparklineChart && dashboardSparklineSeries && dashboardCandleChart && dashboardCandleSeries) {
      console.log('Charts ready, loading data...');
      
      // Resize charts to proper dimensions after creation
      const containerWidth = sparklineContainer.clientWidth || 600;
      dashboardSparklineChart.applyOptions({ width: containerWidth });
      dashboardCandleChart.applyOptions({ width: containerWidth });
      console.log('📊 Charts resized to width:', containerWidth);
      
      await updateDashboardCharts(currentMainChartTimeframe);
      console.log('✅ Dashboard charts initialized successfully');
      
      // Apply saved sparkline color
      applySavedSparklineColor();
      
      // Add window resize listener to handle responsive charts
      window.addEventListener('resize', () => {
        const newWidth = sparklineContainer.clientWidth || 600;
        if (dashboardSparklineChart) dashboardSparklineChart.applyOptions({ width: newWidth });
        if (dashboardCandleChart) dashboardCandleChart.applyOptions({ width: newWidth });
      });
      
      // Add live time updates for charts (refresh every 30 seconds to avoid API rate limits)
      if (!window.chartLiveUpdateInterval) {
        window.chartLiveUpdateInterval = setInterval(async () => {
          if (dashboardSparklineChart && dashboardCandleSeries) {
            await updateDashboardCharts(currentMainChartTimeframe);
            console.log('📊 Charts updated - live time');
          }
        }, 30000);
        console.log('🔄 Live chart updates started (every 30 seconds)');
      }
    } else {
      console.error('❌ Charts or series not created properly');
    }
  } catch (error) {
    console.error('❌ Error initializing dashboard charts:', error);
    console.error('Error details:', error.message, error.stack);
  }
}

// Add double-tap (mobile) and click (desktop) handler for dashboard chart fullscreen
function addDashboardChartFullscreenHandler(container, chartType) {
  // Prevent duplicate listeners
  if (container.hasAttribute('data-fullscreen-ready')) {
    return;
  }
  container.setAttribute('data-fullscreen-ready', 'true');
  
  let lastTap = 0;
  
  // Helper function to activate fullscreen
  const activateFullscreen = () => {
    console.log(`📱 Dashboard ${chartType} chart - activating fullscreen`);
    
    if (window.landscapeChartController) {
      // Get current chart series data
      const series = chartType === 'candle' ? dashboardCandleSeries : dashboardSparklineSeries;
      
      if (series && window.lastDashboardChartData) {
        // Create asset data for BTC
        const btcAssetData = {
          displayName: 'Bitcoin (BTC)',
          name: 'Bitcoin',
          symbol: 'BTC',
          price: window.currentBTCPrice || 0,
          priceChange24h: 0,
          marketCap: 0,
          volume24h: 0,
          circulatingSupply: 0,
          rank: 1,
          rsi: null,
          sma50: null,
          sma200: null
        };
        
        // Get actual chart data from window cache
        const chartData = window.lastDashboardChartData[chartType] || [];
        
        if (chartData.length > 0) {
          window.landscapeChartController.activate(
            chartData,
            chartType === 'candle' ? 'candle' : 'sparkline',
            btcAssetData
          );
        } else {
          console.warn('⚠️ No chart data available for fullscreen');
        }
      }
    }
  };
  
  // Mobile: Single-tap to activate (more intuitive than double-tap)
  container.addEventListener('click', (e) => {
    e.preventDefault();
    activateFullscreen();
  });
  
  // Also support double-tap for legacy behavior
  container.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      activateFullscreen();
    }
    
    lastTap = currentTime;
  });
  
  // Desktop: Double-click to activate
  container.addEventListener('dblclick', (e) => {
    e.preventDefault();
    activateFullscreen();
  });
}

// Update dashboard charts with new data - returns true on success, false on failure
async function updateDashboardCharts(timeframe) {
  try {
    // Fetch data based on current mode (Bitcoin or Macro Market)
    let chartData;
    if (currentMainChartMode === 'macro') {
      console.log('📊 Fetching Macro Market data for timeframe:', timeframe);
      chartData = await fetchMacroMarketDataForTimeframe(timeframe);
    } else {
      console.log('📊 Fetching BTC data for timeframe:', timeframe);
      chartData = await fetchBTCDataForTimeframe(timeframe);
    }
    
    const btcData = chartData;
    
    if (!btcData || !btcData.candleData || btcData.candleData.length === 0) {
      console.warn('⚠️ No candle data received for timeframe:', timeframe);
      return false;
    }
    
    // STEP 1: Normalize candleData - sort ascending by timestamp and deduplicate
    const normalizedCandles = btcData.candleData
      .filter(c => c.timestamp && c.open && c.high && c.low && c.close) // Filter invalid candles
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp ascending
      .reduce((acc, candle) => {
        // Deduplicate - keep latest candle for each unique timestamp
        const lastCandle = acc[acc.length - 1];
        if (!lastCandle || lastCandle.timestamp !== candle.timestamp) {
          acc.push(candle);
        }
        return acc;
      }, []);
    
    if (normalizedCandles.length === 0) {
      console.warn('⚠️ No valid candles after normalization');
      return false;
    }
    
    console.log(`✅ Normalized ${btcData.candleData.length} candles → ${normalizedCandles.length} unique`);
    
    // STEP 1.5: Filter to last 24 hours for '1d' timeframe
    let filteredCandles = normalizedCandles;
    if (timeframe === '1d') {
      const now = Date.now();
      const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000); // 24 hours in milliseconds
      filteredCandles = normalizedCandles.filter(candle => candle.timestamp >= twentyFourHoursAgo);
      console.log(`✅ Filtered 24HR: ${normalizedCandles.length} candles → ${filteredCandles.length} candles (last 24 hours)`);
      
      // Safety check: if filtering removes all data, fall back to last 50 candles
      if (filteredCandles.length === 0) {
        console.warn('⚠️ No candles in last 24 hours, using last 50 candles as fallback');
        filteredCandles = normalizedCandles.slice(-50);
      }
    }
    
    // STEP 2: Build series data based on data type (price or volume)
    if (currentChartDataType === 'volume') {
      // VOLUME MODE: Display volume data as histogram
      if (dashboardCandleChart) {
        // Remove candlestick series if it exists and add histogram series
        if (dashboardCandleSeries && dashboardCandleSeries.seriesType && dashboardCandleSeries.seriesType() === 'Candlestick') {
          dashboardCandleChart.removeSeries(dashboardCandleSeries);
          dashboardCandleSeries = dashboardCandleChart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: '',
          });
        } else if (!dashboardCandleSeries) {
          dashboardCandleSeries = dashboardCandleChart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: '',
          });
        }
        
        const volumeCandleData = filteredCandles.map(candle => ({
          time: Math.floor(candle.timestamp / 1000),
          value: candle.volume || 0,
          color: (candle.close >= candle.open) ? '#16C784' : '#EA3943'
        }));
        
        const cappedVolumeCandle = volumeCandleData.slice(-500);
        dashboardCandleSeries.setData(cappedVolumeCandle);
        console.log('✅ Candle chart updated with', cappedVolumeCandle.length, 'volume bars');
      }
      
      if (dashboardSparklineSeries) {
        const volumeSparklineData = filteredCandles.map(candle => ({
          time: Math.floor(candle.timestamp / 1000),
          value: candle.volume || 0
        }));
        
        const cappedVolumeSparkline = volumeSparklineData.slice(-1000);
        dashboardSparklineSeries.setData(cappedVolumeSparkline);
        console.log('✅ Sparkline chart updated with', cappedVolumeSparkline.length, 'volume points');
      }
    } else {
      // PRICE MODE: Display price data as candlesticks
      if (dashboardCandleChart) {
        // Remove histogram series if it exists and add candlestick series
        if (dashboardCandleSeries && dashboardCandleSeries.seriesType && dashboardCandleSeries.seriesType() === 'Histogram') {
          dashboardCandleChart.removeSeries(dashboardCandleSeries);
          dashboardCandleSeries = dashboardCandleChart.addCandlestickSeries({
            upColor: '#16C784',
            downColor: '#EA3943',
            borderVisible: false,
            wickUpColor: '#16C784',
            wickDownColor: '#EA3943'
          });
        } else if (!dashboardCandleSeries) {
          dashboardCandleSeries = dashboardCandleChart.addCandlestickSeries({
            upColor: '#16C784',
            downColor: '#EA3943',
            borderVisible: false,
            wickUpColor: '#16C784',
            wickDownColor: '#EA3943'
          });
        }
        
        const candleSeriesData = filteredCandles.map(candle => ({
          time: Math.floor(candle.timestamp / 1000),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close
        }));
        
        const cappedCandleData = candleSeriesData.slice(-500);
        dashboardCandleSeries.setData(cappedCandleData);
        console.log('✅ Candle chart updated with', cappedCandleData.length, 'candles');
        
        // Cache for landscape fullscreen - FIXED: Now actually caching!
        if (!window.lastDashboardChartData) window.lastDashboardChartData = {};
        window.lastDashboardChartData.candle = cappedCandleData;
        console.log('📦 Cached candle data for fullscreen:', cappedCandleData.length, 'points');
      }
      
      if (dashboardSparklineSeries) {
        const sparklineSeriesData = filteredCandles.map(candle => ({
          time: Math.floor(candle.timestamp / 1000),
          value: candle.close
        }));
        
        const cappedSparklineData = sparklineSeriesData.slice(-1000);
        dashboardSparklineSeries.setData(cappedSparklineData);
        console.log('✅ Sparkline chart updated with', cappedSparklineData.length, 'points');
        
        // Cache for landscape fullscreen - FIXED: Now actually caching!
        if (!window.lastDashboardChartData) window.lastDashboardChartData = {};
        window.lastDashboardChartData.sparkline = cappedSparklineData;
        console.log('📦 Cached sparkline data for fullscreen:', cappedSparklineData.length, 'points');
      }
    }
    
    // STEP 4: Auto-fit time scale to show full historical range
    if (dashboardSparklineChart) dashboardSparklineChart.timeScale().fitContent();
    if (dashboardCandleChart) dashboardCandleChart.timeScale().fitContent();
    
    // Safety check before logging timestamps
    if (filteredCandles.length > 0) {
      console.log(`✅ Charts synced: ${filteredCandles.length} candles from ${new Date(filteredCandles[0].timestamp).toLocaleDateString()} to ${new Date(filteredCandles[filteredCandles.length - 1].timestamp).toLocaleDateString()}`);
    } else {
      console.warn('⚠️ No candles to display');
    }
    
    return true; // Success
    
  } catch (error) {
    console.error('❌ Error updating dashboard charts:', error?.message || String(error));
    console.error('Stack:', error?.stack);
    console.warn('⚠️ Charts will retain previous data');
    return false; // Failure - gracefully degrade
  }
}

// Stock Chart Functions (TradingView Lightweight Charts - IDENTICAL to crypto)
async function initStockCharts() {
  const sparklineContainer = document.getElementById('stockSparklineChart');
  const candleContainer = document.getElementById('stockCandleChart');
  
  if (!sparklineContainer || !candleContainer) {
    console.warn('⚠️ Stock chart containers not found');
    return;
  }
  
  if (typeof LightweightCharts === 'undefined') {
    console.error('❌ TradingView LightweightCharts library not loaded');
    return;
  }
  
  try {
    console.log('📊 Initializing TradingView Lightweight Charts for stocks');
    
    // Create sparkline chart (area series) - only once
    if (!stockSparklineChart) {
      console.log('Creating stock sparkline chart...');
      stockSparklineChart = LightweightCharts.createChart(sparklineContainer, {
        width: sparklineContainer.clientWidth,
        height: 280,
        layout: { background: { color: '#1A1A1A' }, textColor: '#D9D9D9' },
        grid: { vertLines: { color: '#2B2B2B' }, horzLines: { color: '#2B2B2B' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Magnet },
        timeScale: { borderColor: '#2B2B2B', timeVisible: true },
        rightPriceScale: { borderColor: '#2B2B2B' },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true }
      });
      
      stockSparklineSeries = stockSparklineChart.addAreaSeries({
        lineColor: '#3861FB',
        topColor: 'rgba(56, 97, 251, 0.4)',
        bottomColor: 'rgba(56, 97, 251, 0)',
        lineWidth: 2
      });
      console.log('✅ Stock sparkline chart created');
    }
    
    // Create candle chart (candlestick series) - only once
    // IMPORTANT: Temporarily show container to get proper width
    if (!stockCandleChart) {
      console.log('Creating stock candle chart...');
      
      // Temporarily show container to measure width
      const wasHidden = candleContainer.style.display === 'none';
      if (wasHidden) {
        candleContainer.style.display = 'block';
      }
      
      const chartWidth = candleContainer.clientWidth || sparklineContainer.clientWidth || 600;
      
      stockCandleChart = LightweightCharts.createChart(candleContainer, {
        width: chartWidth,
        height: 280,
        layout: { background: { color: '#1A1A1A' }, textColor: '#D9D9D9' },
        grid: { vertLines: { color: '#2B2B2B' }, horzLines: { color: '#2B2B2B' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Magnet },
        timeScale: { borderColor: '#2B2B2B', timeVisible: true },
        rightPriceScale: { borderColor: '#2B2B2B' },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true }
      });
      
      stockCandleSeries = stockCandleChart.addCandlestickSeries({
        upColor: '#16C784',
        downColor: '#EA3943',
        borderVisible: false,
        wickUpColor: '#16C784',
        wickDownColor: '#EA3943'
      });
      
      // Hide it again if it was hidden
      if (wasHidden) {
        candleContainer.style.display = 'none';
      }
      
      console.log('✅ Stock candle chart created with width:', chartWidth);
    }
    
    // Load data
    if (stockSparklineChart && stockSparklineSeries && stockCandleChart && stockCandleSeries) {
      console.log('Stock charts ready, loading data...');
      await updateStockCharts(currentStockTimeframe);
      console.log('✅ Stock charts initialized successfully');
      
      // Add fullscreen handlers after charts are ready
      addStockChartFullscreenHandlers('stockSparklineChart', 'sparkline');
      addStockChartFullscreenHandlers('stockCandleChart', 'candle');
    } else {
      console.error('❌ Stock charts or series not created properly');
    }
  } catch (error) {
    console.error('❌ Error initializing stock charts:', error);
  }
}

// Add fullscreen handlers to stock charts
function addStockChartFullscreenHandlers(containerId, chartType) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`⚠️ Chart container ${containerId} not found for fullscreen`);
    return;
  }
  
  // Prevent duplicate listeners
  if (container.hasAttribute('data-fullscreen-ready')) {
    return;
  }
  container.setAttribute('data-fullscreen-ready', 'true');
  
  let lastTap = 0;
  
  const activateFullscreen = () => {
    if (window.landscapeChartController) {
      // Get S&P 500 asset data
      const sp500AssetData = {
        symbol: currentStockSymbol || 'SPY',
        displayName: currentStockSymbol === 'SPY' ? 'S&P 500' : currentStockSymbol,
        name: currentStockSymbol === 'SPY' ? 'S&P 500 Index' : currentStockSymbol,
        price: 0,
        priceChange24h: 0,
        marketCap: 0,
        volume24h: 0,
        circulatingSupply: 0,
        rank: 1,
        rsi: null,
        sma50: null,
        sma200: null
      };
      
      // Get actual chart data from window cache - use pre-cached data
      const chartData = window.lastStockChartData?.[chartType] || [];
      
      if (chartData.length > 0) {
        window.landscapeChartController.activate(
          chartData,
          chartType === 'candle' ? 'candle' : 'sparkline',
          sp500AssetData
        );
      } else {
        console.warn('⚠️ No stock chart data available for fullscreen');
      }
    }
  };
  
  // Mobile: Single-tap to activate (more intuitive than double-tap)
  container.addEventListener('click', (e) => {
    e.preventDefault();
    activateFullscreen();
  });
  
  // Also support double-tap for legacy behavior
  container.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      activateFullscreen();
    }
    
    lastTap = currentTime;
  });
  
  // Desktop: Double-click to activate
  container.addEventListener('dblclick', (e) => {
    e.preventDefault();
    activateFullscreen();
  });
  
  console.log(`✅ Fullscreen handlers added to ${containerId}`);
}

async function updateStockCharts(timeframe) {
  try {
    console.log(`📊 Fetching ${currentStockSymbol} data for timeframe:`, timeframe);
    
    const stockData = await fetchStockDataForTimeframe(currentStockSymbol, timeframe);
    
    if (!stockData || !stockData.candleData || stockData.candleData.length === 0) {
      console.warn('⚠️ No stock data received for timeframe:', timeframe);
      return false;
    }
    
    // Normalize and sort data
    const normalizedCandles = stockData.candleData
      .filter(c => c.time && c.open && c.high && c.low && c.close)
      .sort((a, b) => a.time - b.time)
      .reduce((acc, candle) => {
        const lastCandle = acc[acc.length - 1];
        if (!lastCandle || lastCandle.time !== candle.time) {
          acc.push(candle);
        }
        return acc;
      }, []);
    
    if (normalizedCandles.length === 0) {
      console.warn('⚠️ No valid stock candles after normalization');
      return false;
    }
    
    console.log(`✅ Normalized ${stockData.candleData.length} stock candles → ${normalizedCandles.length} unique`);
    
    // Cache data FIRST for fullscreen access
    window.lastStockChartData = {
      candle: normalizedCandles,
      sparkline: normalizedCandles.map(c => ({ time: c.time, value: c.close }))
    };
    
    // Update candle series
    if (stockCandleSeries) {
      stockCandleSeries.setData(normalizedCandles);
      console.log('✅ Stock candle chart updated with', normalizedCandles.length, 'candles');
    }
    
    // Update sparkline series
    if (stockSparklineSeries) {
      const sparklineData = window.lastStockChartData.sparkline;
      stockSparklineSeries.setData(sparklineData);
      console.log('✅ Stock sparkline chart updated with', sparklineData.length, 'points');
    }
    
    // Auto-fit time scale
    if (stockSparklineChart) stockSparklineChart.timeScale().fitContent();
    if (stockCandleChart) stockCandleChart.timeScale().fitContent();
    
    console.log(`✅ Stock charts synced: ${normalizedCandles.length} candles`);
    return true;
    
  } catch (error) {
    console.error('❌ Error updating stock charts:', error);
    return false;
  }
}

function toggleStockChart(chartType) {
  const sparklineContainer = document.getElementById('stockSparklineChart');
  const candleContainer = document.getElementById('stockCandleChart');
  const sparklineBtn = document.getElementById('stockSparklineBtn');
  const candleBtn = document.getElementById('stockCandleBtn');
  
  if (!sparklineContainer || !candleContainer) return;
  
  if (chartType === 'sparkline') {
    sparklineContainer.style.display = 'block';
    candleContainer.style.display = 'none';
    sparklineContainer.classList.add('active');
    candleContainer.classList.remove('active');
    if (sparklineBtn) sparklineBtn.classList.add('active');
    if (candleBtn) candleBtn.classList.remove('active');
    
    // Resize sparkline chart to ensure proper dimensions
    if (stockSparklineChart) {
      setTimeout(() => {
        stockSparklineChart.resize(sparklineContainer.clientWidth, 280);
      }, 0);
    }
  } else {
    sparklineContainer.style.display = 'none';
    candleContainer.style.display = 'block';
    sparklineContainer.classList.remove('active');
    candleContainer.classList.add('active');
    if (sparklineBtn) sparklineBtn.classList.remove('active');
    if (candleBtn) candleBtn.classList.add('active');
    
    // Resize candle chart to ensure proper dimensions when shown
    if (stockCandleChart) {
      setTimeout(() => {
        stockCandleChart.resize(candleContainer.clientWidth, 280);
      }, 0);
    }
  }
}

async function updateStockTimeframe(timeframe) {
  try {
    // Update active button state
    document.querySelectorAll('.market-timeframes-stock .tf-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentStockTimeframe = timeframe;
    console.log(`📊 Updating stock chart to ${timeframe} timeframe`);
    
    await updateStockCharts(timeframe);
  } catch (error) {
    console.error('❌ Error updating stock timeframe:', error);
  }
}

async function refreshStockCharts() {
  console.log('🔄 Refreshing stock charts...');
  await updateStockCharts(currentStockTimeframe);
}

async function fetchStockDataForTimeframe(symbol, timeframe) {
  try {
    // TWELVE DATA FREE TIER ONLY SUPPORTS DAILY/WEEKLY/MONTHLY
    // Intraday intervals (5min, 30min, 1h) require paid plan
    const intervalMap = {
      '24hr': '1day',
      '7d': '1day',
      '30d': '1day',
      '90d': '1day',
      '1yr': '1day',
      '5yr': '1week',
      'max': '1month'
    };
    
    const outputSizeMap = {
      '24hr': 7,
      '7d': 14,
      '30d': 60,
      '90d': 90,
      '1yr': 365,
      '5yr': 260,
      'max': 500
    };
    
    const interval = intervalMap[timeframe] || '1day';
    const outputsize = outputSizeMap[timeframe] || 365;
    
    const url = `/api/stocks/data/${symbol}?interval=${interval}&outputsize=${outputsize}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.historical || data.historical.length === 0) {
      throw new Error('No historical data available');
    }
    
    const candleData = data.historical.map(candle => ({
      time: candle.timestamp / 1000,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
    
    return { candleData };
  } catch (error) {
    console.error('❌ Stock data fetch error:', error);
    return { candleData: [] };
  }
}

// Stock Market Functions
async function initStockMarketData() {
  try {
    console.log('📊 Initializing stock market data...');
    await fetchMajorIndices();
    await fetchMarketBreadth();
    await updateStockPrices(); // Fetch live prices (with 2-min cache to avoid rate limiting)
    await initStockCharts();
    console.log('✅ Stock market data initialization complete');
  } catch (error) {
    console.error('❌ Error initializing stock market data:', error);
  }
}

async function fetchMajorIndices() {
  try {
    const response = await fetch('/api/stocks/indices');
    if (!response.ok) {
      throw new Error('Failed to fetch indices');
    }
    
    const indices = await response.json();
    
    const mapping = {
      'sp500': 'sp500Index',
      'dow': 'dowIndex',
      'nasdaq': 'nasdaqIndex'
    };
    
    for (const [key, elementId] of Object.entries(mapping)) {
      const indexData = indices[key];
      if (indexData) {
        const element = document.getElementById(elementId);
        if (element) {
          element.textContent = indexData.price.toFixed(2);
          
          if (indexData.changePercent >= 0) {
            element.style.color = '#10B981';
          } else {
            element.style.color = '#EF4444';
          }
        }
      }
    }
    
    console.log('✅ Major indices loaded successfully');
  } catch (error) {
    console.error('❌ Error fetching major indices:', error);
  }
}

async function fetchMarketBreadth() {
  try {
    const response = await fetch('/api/stocks/market-breadth');
    if (!response.ok) {
      throw new Error('Failed to fetch market breadth');
    }
    
    const data = await response.json();
    const breadthValue = data.breadth || 50;
    
    drawMarketBreadthGauge(breadthValue);
    
    const breadthElement = document.getElementById('breadthValue');
    const statusElement = document.getElementById('breadthStatus');
    
    if (breadthElement) {
      breadthElement.textContent = `${breadthValue}%`;
    }
    
    if (statusElement) {
      if (breadthValue >= 60) {
        statusElement.textContent = 'Bullish';
        statusElement.style.color = '#10B981';
      } else if (breadthValue <= 40) {
        statusElement.textContent = 'Bearish';
        statusElement.style.color = '#EF4444';
      } else {
        statusElement.textContent = 'Neutral';
        statusElement.style.color = '#F59E0B';
      }
    }
    
    console.log(`✅ Market breadth: ${breadthValue}%`);
  } catch (error) {
    console.error('❌ Error fetching market breadth:', error);
    drawMarketBreadthGauge(50);
  }
}

function drawMarketBreadthGauge(value) {
  const canvas = document.getElementById('marketBreadthGauge');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const radius = Math.min(width, height) / 2 - 15;
  const centerY = height - 10;
  const lineWidth = Math.max(8, radius / 3);
  
  ctx.clearRect(0, 0, width, height);
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = '#1A1A1A';
  ctx.stroke();
  
  const segments = [
    { start: 0, end: 40, color: '#EF4444' },
    { start: 40, end: 60, color: '#F59E0B' },
    { start: 60, end: 100, color: '#10B981' }
  ];
  
  segments.forEach(seg => {
    const startAngle = Math.PI + (seg.start / 100) * Math.PI;
    const endAngle = Math.PI + (seg.end / 100) * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = seg.color;
    ctx.stroke();
  });
  
  // Draw needle - ENHANCED for visibility (Fear & Greed)
  const needleAngle = Math.PI + (value / 100) * Math.PI;
  const needleLength = radius + 5; // Extend beyond gauge slightly
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(needleAngle - Math.PI / 2); // FIXED: Added rotation offset like Alt Season
  
  // Draw larger, more visible needle
  ctx.beginPath();
  ctx.moveTo(0, -12); // Wider base (24px wide total)
  ctx.lineTo(needleLength, 0);
  ctx.lineTo(0, 12);
  ctx.closePath();
  
  // White fill with shadow for depth
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fill();
  
  // Blue stroke for definition
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#3861FB';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.restore();
  
  // Draw larger center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
  ctx.fillStyle = '#3861FB';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Fetch crypto market data (BTC as market proxy) for the current timeframe
async function fetchBTCDataForTimeframe(timeframe) {
  const config = TIMEFRAME_CONFIG[timeframe];
  
  if (!config) {
    console.error(`❌ Unknown timeframe: ${timeframe}. Falling back to 1d.`);
    return fetchBTCDataForTimeframe('1d');
  }
  
  const interval = config.interval;
  console.log(`📊 Fetching BTC data: ${config.label} (${interval}min candles)`);
  
  const url = `/api/crypto/market-chart?interval=${interval}`;
  
  // Use retry with backoff for backend startup delays
  const data = await retryWithBackoff(async () => {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market data: ${response.statusText}`);
    }
    
    return await response.json();
  }, 5, 1000); // 5 retries, starting at 1s delay (1s, 2s, 4s, 8s, 16s)
  
  if (!data || (!data.sparklineData && !data.candleData)) {
    console.warn('⚠️ API returned empty data');
  }
  
  return data;
}

// Fetch macro market data (total market cap) for the current timeframe
async function fetchMacroMarketDataForTimeframe(timeframe) {
  const config = TIMEFRAME_CONFIG[timeframe];
  
  if (!config) {
    console.error(`❌ Unknown timeframe: ${timeframe}. Falling back to 1d.`);
    return fetchMacroMarketDataForTimeframe('1d');
  }
  
  const interval = config.interval;
  console.log(`📊 Fetching Macro Market data: ${config.label} (${interval}min candles)`);
  
  // Use the same backend endpoint but with a 'macro' flag
  const url = `/api/crypto/market-chart?interval=${interval}&mode=macro`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ Macro data endpoint returned ${response.status}, falling back to BTC`);
      // Graceful fallback: use BTC data if macro endpoint fails
      return fetchBTCDataForTimeframe(timeframe);
    }
    
    const data = await response.json();
    
    if (!data || (!data.sparklineData && !data.candleData)) {
      console.warn('⚠️ API returned empty macro data, falling back to BTC');
      return fetchBTCDataForTimeframe(timeframe);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching macro data:', error.message, '- falling back to BTC');
    // Graceful fallback to BTC if macro fetch fails completely
    return fetchBTCDataForTimeframe(timeframe);
  }
}

// Draw Sparkline Chart
function drawSparkline(ctx, width, height, priceData = null) {
  // Use real data if provided, otherwise fall back to mock data
  const data = priceData || [30, 35, 33, 40, 45, 42, 50, 55, 52, 60, 65, 63, 70, 68, 75];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw gradient line
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#FF006E');
  gradient.addColorStop(0.5, '#8338EC');
  gradient.addColorStop(1, '#3A86FF');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 20) - 10;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  
  // Draw fill area
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  
  const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
  fillGradient.addColorStop(0, 'rgba(138, 56, 236, 0.3)');
  fillGradient.addColorStop(1, 'rgba(138, 56, 236, 0)');
  ctx.fillStyle = fillGradient;
  ctx.fill();
}

// Draw Candle Chart
function drawCandleChart(ctx, width, height, candleData = null) {
  // Use real data if provided, otherwise fall back to mock data
  const candles = candleData || [
    { open: 40, close: 50, high: 55, low: 38 },
    { open: 50, close: 45, high: 52, low: 43 },
    { open: 45, close: 52, high: 54, low: 44 },
    { open: 52, close: 48, high: 53, low: 46 },
    { open: 48, close: 60, high: 62, low: 47 },
    { open: 60, close: 58, high: 63, low: 56 },
    { open: 58, close: 65, high: 67, low: 57 },
  ];
  
  const max = Math.max(...candles.map(c => c.high));
  const min = Math.min(...candles.map(c => c.low));
  const range = max - min;
  
  const candleWidth = (width / candles.length) * 0.6;
  const spacing = width / candles.length;
  
  ctx.clearRect(0, 0, width, height);
  
  candles.forEach((candle, index) => {
    const x = index * spacing + spacing / 2;
    const openY = height - ((candle.open - min) / range) * (height - 20) - 10;
    const closeY = height - ((candle.close - min) / range) * (height - 20) - 10;
    const highY = height - ((candle.high - min) / range) * (height - 20) - 10;
    const lowY = height - ((candle.low - min) / range) * (height - 20) - 10;
    
    const isGreen = candle.close > candle.open;
    ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
    ctx.fillStyle = isGreen ? '#10B981' : '#EF4444';
    
    // Draw wick
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();
    
    // Draw candle body
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY);
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight || 2);
  });
}

// Check usage limit before performing search
async function checkSearchLimit() {
  try {
    const response = await fetch('/api/usage/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType: 'search' }),
      credentials: 'include'
    });

    const result = await response.json();
    
    if (!result.allowed) {
      // Show appropriate upgrade modal based on message
      if (result.message && result.message.includes('Monthly limit')) {
        showSearchLimitModal();
      } else {
        showUpgradeModal('search_limit');
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking search limit:', error);
    return true; // Allow search on error to avoid blocking users
  }
}

// Track search usage and update session
async function trackSearch() {
  try {
    const response = await fetch('/api/usage/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType: 'search' }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to track search');
    }

    // Refresh session to get updated search count
    const validateResponse = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include'
    });

    if (validateResponse.ok) {
      const result = await validateResponse.json();
      if (result.valid && result.user) {
        // Update session in localStorage
        const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
        session.user = result.user;
        localStorage.setItem('darkwaveSession', JSON.stringify(session));

        // Update search counter UI
        if (typeof updateSearchCounter === 'function') {
          updateSearchCounter();
        }
      }
    }
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}

// Token Analysis
async function searchWeb3() {
  const input = document.getElementById('web3SearchInput');
  const query = input.value.trim();
  
  if (!query) {
    alert('Please enter a search query or website URL');
    return;
  }

  // Check usage limit before searching
  const canSearch = await checkSearchLimit();
  if (!canSearch) {
    return;
  }
  
  console.log(`🔍 Searching Web 3 for: ${query}...`);
  
  // Smart URL detection - strict validation to avoid false positives
  // Must not contain spaces and must have a valid domain extension
  const hasSpaces = /\s/.test(query);
  const domainExtensions = /\.(com|io|org|net|ai|xyz|app|co|gg|finance|exchange|dev|tech|me|wtf|money|club|live|world|network|cash|digital|pro|site|cc|vc|tv|to|eth|sol|dao|nft)([\/\?#]|$)/i;
  
  let isUrl = false;
  
  // Only treat as URL if:
  // 1. No spaces (URLs can't have spaces)
  // 2. Has a valid domain extension OR explicit http/https protocol
  if (!hasSpaces) {
    isUrl = domainExtensions.test(query) || query.startsWith('http://') || query.startsWith('https://');
  }
  
  const resultsDiv = document.getElementById('web3SearchResults');
  
  if (isUrl) {
    // Direct navigation to website
    const finalUrl = query.startsWith('http://') || query.startsWith('https://') 
      ? query 
      : `https://${query}`;
    
    console.log(`🌐 Navigating directly to: ${finalUrl}`);
    window.open(finalUrl, '_blank');
    
    // Track search after successful navigation
    await trackSearch();
    
    if (resultsDiv) {
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `<p class="search-hint">✓ Opening ${query}</p>`;
      setTimeout(() => {
        resultsDiv.style.display = 'none';
      }, 2000);
    }
  } else {
    // Web 3 search via DuckDuckGo
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' web3 crypto blockchain')}`;
    window.open(searchUrl, '_blank');
    
    // Track search after successful navigation
    await trackSearch();
    
    if (resultsDiv) {
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `<p class="search-hint">✓ Searching Web 3 for "${query}"</p>`;
      setTimeout(() => {
        resultsDiv.style.display = 'none';
      }, 3000);
    }
  }
}

// Utility: Detect if a string is a Solana token address
function isSolanaAddress(input) {
  // Solana addresses are 32-44 character base58 strings
  // They typically start with specific patterns but can vary
  const solanaPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaPattern.test(input);
}

async function analyzeToken() {
  const input = document.getElementById('searchInput');
  const query = input.value.trim();
  
  if (!query) {
    alert('Please enter a token symbol, stock ticker, or Solana address');
    return;
  }

  // Check usage limit before analyzing
  const canSearch = await checkSearchLimit();
  if (!canSearch) {
    return;
  }
  
  console.log(`🔍 Analyzing ${query}...`);
  
  // Detect if input is a Solana address
  const isSolana = isSolanaAddress(query);
  
  // Comprehensive stock ticker list (100+ major US stocks)
  const knownStocks = [
    // Tech Giants
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'AMD', 'INTC', 'CSCO',
    'ORCL', 'CRM', 'ADBE', 'AVGO', 'TXN', 'QCOM', 'NFLX', 'PYPL', 'SHOP', 'SQ',
    'ROKU', 'SNAP', 'TWTR', 'UBER', 'LYFT', 'SPOT', 'ZM', 'DOCU', 'SNOW', 'PLTR',
    // Automotive
    'TSLA', 'F', 'GM', 'TM', 'HMC', 'RIVN', 'LCID',
    // Finance
    'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'AXP', 'V', 'MA', 'COIN',
    // Healthcare/Pharma
    'JNJ', 'PFE', 'ABBV', 'MRK', 'TMO', 'UNH', 'LLY', 'AMGN', 'GILD', 'MRNA', 'BNTX',
    // Retail/Consumer
    'WMT', 'TGT', 'HD', 'LOW', 'COST', 'NKE', 'SBUX', 'MCD', 'DIS', 'CMCSA',
    // Energy
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY',
    // Industrials
    'BA', 'CAT', 'GE', 'HON', 'UPS', 'FDX', 'LMT', 'RTX',
    // Telecom
    'T', 'VZ', 'TMUS',
    // Other Major Stocks
    'TSMC', 'BRK.A', 'BRK.B', 'TSM', 'PEP', 'KO', 'PG', 'WBA', 'CVS'
  ];
  
  let assetType = 'crypto';
  let tokenAddress = null;
  
  // Determine asset type
  if (isSolana) {
    assetType = 'solana';
    tokenAddress = query;
  } else if (knownStocks.includes(query.toUpperCase())) {
    assetType = 'stock';
  }
  
  // Open analysis modal with the searched token
  analysisModalController.openAnalysisModal({
    symbol: isSolana ? tokenAddress : query.toUpperCase(),
    name: isSolana ? tokenAddress : query.toUpperCase(),
    assetType: assetType,
    tokenAddress: tokenAddress
  });
  
  // Track search after successful modal open
  await trackSearch();
  
  // Clear search input
  input.value = '';
}

// Open analytics search dialog (themed modal instead of browser prompt)
function openAnalyticsSearch() {
  const modal = document.getElementById('coinSearchModal');
  if (!modal) return;
  
  const input = document.getElementById('coinSearchInput');
  if (!input) return;
  
  // Show modal
  modal.style.display = 'flex';
  input.value = '';
  input.focus();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Close coin search modal
function closeCoinSearch() {
  const modal = document.getElementById('coinSearchModal');
  if (!modal) return;
  
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Submit coin search
function submitCoinSearch() {
  const input = document.getElementById('coinSearchInput');
  if (!input || !input.value.trim()) return;
  
  const searchSymbol = input.value.trim().toUpperCase();
  closeCoinSearch();
  
  // Try to open modal - with retries if not ready
  function tryOpenModal(attempts = 0) {
    try {
      if (typeof analysisModalController !== 'undefined' && analysisModalController.openAnalysisModal) {
        console.log(`✅ Opening analysis for ${searchSymbol}`);
        analysisModalController.openAnalysisModal({
          symbol: searchSymbol,
          name: searchSymbol,
          assetType: 'crypto'
        });
        return;
      }
    } catch (e) {
      console.warn(`⚠️ Modal attempt ${attempts + 1} failed:`, e.message);
    }
    
    if (attempts < 15) {
      // Retry after 200ms if modal controller not ready
      setTimeout(() => tryOpenModal(attempts + 1), 200);
    } else {
      console.error('Analytics modal not available after retries');
      alert('Analytics modal is loading. Please try again in a moment.');
    }
  }
  
  tryOpenModal();
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const coinSearchModal = document.getElementById('coinSearchModal');
  if (coinSearchModal) {
    coinSearchModal.addEventListener('click', function(e) {
      if (e.target === coinSearchModal) {
        closeCoinSearch();
      }
    });
  }
});

// Crypto Cat AI Chat
async function sendCatMessage() {
  const input = document.getElementById('catInput');
  const messagesDiv = document.getElementById('catMessages');
  const prompt = input.value.trim();
  
  if (!prompt) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'cat-msg';
  userMsg.innerHTML = `<strong>You:</strong> ${prompt}`;
  messagesDiv.appendChild(userMsg);
  
  input.value = '';
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  try {
    // Get current persona mode from PersonaManager
    const persona = window.personaManager ? personaManager.getPersona() : 'business';
    const mode = persona === 'casual' ? 'smartass' : 'normal';
    
    // Call backend AI agent
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        userId: 'user-' + Date.now(),
        mode: mode
      })
    });
    
    const data = await response.json();
    
    // Add AI response
    const aiMsg = document.createElement('div');
    aiMsg.className = 'cat-msg';
    aiMsg.innerHTML = `<strong>Crypto Cat:</strong> ${data.text || 'Meow! Something went wrong.'}`;
    messagesDiv.appendChild(aiMsg);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Persona-aware cat images maintained by PersonaManager
    // Legacy changeCatPose disabled to preserve persona integrity
    
  } catch (error) {
    console.error('AI Chat error:', error);
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'cat-msg';
    errorMsg.innerHTML = `<strong>Crypto Cat:</strong> Ugh, my brain hurts. Try again.`;
    messagesDiv.appendChild(errorMsg);
  }
}

// DISABLED: Legacy pose system that broke persona integrity
// TODO: Implement persona-aware pose system with separate business/casual pose sets
/*
function changeCatPose(message) {
  if (!message) return;
  
  const catImage = document.getElementById('catImage');
  const msgLower = message.toLowerCase();
  const persona = window.personaManager ? personaManager.getPersona() : 'business';
  
  // This would need persona-specific pose images:
  // - business-cat-thumbsup.jpg, sarcastic-cat-thumbsup.jpg, etc.
  // Currently disabled to preserve persona image consistency
  
  if (msgLower.includes('buy') || msgLower.includes('bullish')) {
    catImage.src = '/crypto-cat-poses/thumbsup.png?v=3';
  } else if (msgLower.includes('sell') || msgLower.includes('bearish')) {
    catImage.src = '/crypto-cat-poses/angry.png?v=3';
  } else if (msgLower.includes('scam') || msgLower.includes('rug')) {
    catImage.src = '/crypto-cat-poses/facepalm.png?v=3';
  } else if (msgLower.includes('moon') || msgLower.includes('hodl')) {
    catImage.src = '/crypto-cat-poses/fist.png?v=3';
  } else {
    catImage.src = '/crypto-cat-poses/pointing.png?v=3';
  }
  
  setTimeout(() => {
    catImage.src = '/crypto-cat-poses/pointing.png?v=3';
  }, 3000);
}
*/

// Submit Project
async function submitProject() {
  const ticker = document.getElementById('projectTicker').value.trim();
  const projectName = document.getElementById('projectName').value.trim();
  const contractAddress = document.getElementById('projectContract').value.trim();
  const logoUrl = document.getElementById('projectLogo').value.trim();
  const description = document.getElementById('projectDescription').value.trim();
  const website = document.getElementById('projectWebsite').value.trim();
  const twitter = document.getElementById('projectTwitter').value.trim();
  const telegram = document.getElementById('projectTelegram').value.trim();
  const discord = document.getElementById('projectDiscord').value.trim();
  const dexPlatform = document.getElementById('projectDex').value;
  const doxxedStatus = document.getElementById('projectDoxxed').value;
  const whitepaperUrl = document.getElementById('projectWhitepaper').value.trim();
  const submitterEmail = document.getElementById('projectEmail').value.trim();
  
  if (!ticker || !projectName || !contractAddress || !description) {
    alert('Please fill in all required fields: Ticker, Name, Contract Address, and Description');
    return;
  }
  
  if (description.length > 500) {
    alert('Description must be 500 characters or less');
    return;
  }
  
  console.log('📝 Submitting project:', { ticker, projectName, contractAddress });
  
  try {
    const response = await fetch('/api/projects/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        projectName,
        contractAddress,
        logoUrl: logoUrl || null,
        description,
        website: website || null,
        twitter: twitter || null,
        telegram: telegram || null,
        discord: discord || null,
        dexPlatform: dexPlatform !== 'none' ? dexPlatform : null,
        doxxedStatus: doxxedStatus !== 'unknown' ? doxxedStatus : null,
        whitepaperUrl: whitepaperUrl || null,
        submitterEmail: submitterEmail || null
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message || `Thank you! ${ticker} has been submitted for review.`);
      
      // Clear form
      document.getElementById('projectTicker').value = '';
      document.getElementById('projectName').value = '';
      document.getElementById('projectContract').value = '';
      document.getElementById('projectLogo').value = '';
      document.getElementById('projectDescription').value = '';
      document.getElementById('projectWebsite').value = '';
      document.getElementById('projectTwitter').value = '';
      document.getElementById('projectTelegram').value = '';
      document.getElementById('projectDiscord').value = '';
      document.getElementById('projectDex').selectedIndex = 0;
      document.getElementById('projectDoxxed').selectedIndex = 0;
      document.getElementById('projectWhitepaper').value = '';
      document.getElementById('projectEmail').value = '';
    } else {
      alert(data.error || 'Submission failed. Please try again.');
    }
  } catch (error) {
    console.error('❌ Submission error:', error);
    alert('Submission failed. Please check your connection and try again.');
  }
}

// Connect Wallet
function connectWallet() {
  alert('Wallet connection coming soon! We will support MetaMask, Phantom, and more.');
}

// Load Glossary Terms
let currentLetterFilter = null;

function loadGlossary() {
  const glossaryGrid = document.getElementById('glossaryGrid');
  
  if (!glossaryGrid) return;
  
  if (typeof GLOSSARY_DATA === 'undefined') {
    console.error('GLOSSARY_DATA not loaded');
    return;
  }
  
  createAlphabetNav();
  renderGlossaryTerms();
  
  window.addEventListener('personaChanged', () => {
    renderGlossaryTerms();
  });
  
  const searchInput = document.getElementById('glossarySearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      
      if (query.trim() === '') {
        currentLetterFilter = null;
        renderGlossaryTerms();
      } else {
        const sections = document.querySelectorAll('.glossary-section');
        const cards = document.querySelectorAll('.glossary-card');
        
        sections.forEach(section => section.style.display = 'none');
        
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          if (text.includes(query)) {
            card.style.display = 'block';
            card.parentElement.parentElement.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });
  }
}

function createAlphabetNav() {
  const alphabetNav = document.getElementById('alphabetNav');
  if (!alphabetNav) return;
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const termsFirstLetters = new Set(
    Object.keys(GLOSSARY_DATA).map(term => term[0].toUpperCase())
  );
  
  alphabetNav.innerHTML = alphabet.map(letter => {
    const hasTerms = termsFirstLetters.has(letter);
    const activeClass = currentLetterFilter === letter ? ' active' : '';
    return `<button 
      class="alphabet-btn${activeClass}${hasTerms ? '' : ' disabled'}" 
      onclick="filterByLetter('${letter}')"
      ${!hasTerms ? 'disabled' : ''}
    >${letter}</button>`;
  }).join('');
}

function filterByLetter(letter) {
  currentLetterFilter = currentLetterFilter === letter ? null : letter;
  
  const searchInput = document.getElementById('glossarySearch');
  if (searchInput) searchInput.value = '';
  
  createAlphabetNav();
  renderGlossaryTerms();
  
  if (currentLetterFilter) {
    const targetSection = document.getElementById(`section-${currentLetterFilter}`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderGlossaryTerms() {
  const glossaryGrid = document.getElementById('glossaryGrid');
  if (!glossaryGrid || typeof GLOSSARY_DATA === 'undefined') return;
  
  glossaryGrid.innerHTML = '';
  
  const persona = window.personaManager ? personaManager.getPersona() : 'business';
  
  const groupedTerms = {};
  Object.entries(GLOSSARY_DATA).forEach(([term, data]) => {
    const firstLetter = term[0].toUpperCase();
    if (!groupedTerms[firstLetter]) {
      groupedTerms[firstLetter] = [];
    }
    groupedTerms[firstLetter].push({ term, data });
  });
  
  const sortedLetters = Object.keys(groupedTerms).sort();
  
  sortedLetters.forEach(letter => {
    if (currentLetterFilter && currentLetterFilter !== letter) {
      return;
    }
    
    const section = document.createElement('div');
    section.className = 'glossary-section';
    section.id = `section-${letter}`;
    
    const header = document.createElement('div');
    header.className = 'glossary-section-header';
    header.innerHTML = `<h3>${letter}</h3><span class="term-count">${groupedTerms[letter].length} terms</span>`;
    section.appendChild(header);
    
    const termsContainer = document.createElement('div');
    termsContainer.className = 'glossary-section-terms';
    
    groupedTerms[letter]
      .sort((a, b) => a.term.localeCompare(b.term))
      .forEach(({ term, data }) => {
        const definition = persona === 'casual' ? data.smartass : data.plain;
        const category = data.category || '';
        
        const card = document.createElement('div');
        card.className = 'glossary-card';
        card.innerHTML = `
          <h4>${term}</h4>
          ${category ? `<span class="glossary-category">${category}</span>` : ''}
          <p>${definition}</p>
        `;
        termsContainer.appendChild(card);
      });
    
    section.appendChild(termsContainer);
    glossaryGrid.appendChild(section);
  });
}

// Payment & Subscription Functions
let userSubscription = null;
let userFeatures = [];

async function loadPricingPlans() {
  try {
    const response = await fetch('/api/payments/plans');
    const data = await response.json();
    
    const subResponse = await fetch('/api/user/subscription');
    const subData = await subResponse.json();
    
    userSubscription = subData.subscription;
    userFeatures = subData.features || [];
    
    renderPricingPlans(data.plans || []);
  } catch (error) {
    console.error('Error loading pricing plans:', error);
  }
}

function renderPricingPlans(plans) {
  const pricingGrid = document.getElementById('pricingGrid');
  if (!pricingGrid) return;
  
  pricingGrid.innerHTML = '';
  
  plans.forEach((plan, index) => {
    const isCurrentPlan = userSubscription && userSubscription.plan_id === plan.id;
    const isFree = plan.price === 0;
    const isPopular = plan.name === 'premium';
    
    const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
    
    const card = document.createElement('div');
    card.className = `pricing-card${isPopular ? ' popular' : ''}${isCurrentPlan ? ' current' : ''}`;
    
    card.innerHTML = `
      ${isPopular ? '<div class="pricing-badge">POPULAR</div>' : ''}
      ${isCurrentPlan ? '<div class="pricing-badge current-badge">CURRENT</div>' : ''}
      <div class="plan-name">${plan.display_name}</div>
      <div class="plan-price${isFree ? ' free' : ''}">$${(plan.price / 100).toFixed(2)}</div>
      <div class="plan-interval">per ${plan.interval}</div>
      <ul class="plan-features">
        ${features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      ${isFree || isCurrentPlan ? `
        <button class="plan-cta current" disabled>
          ${isCurrentPlan ? 'CURRENT PLAN' : 'FREE'}
        </button>
      ` : `
        <button class="plan-cta stripe" onclick="subscribePlan(${plan.id}, 'stripe')">
          💳 PAY WITH CARD
        </button>
        <div class="payment-divider">or</div>
        <button class="plan-cta coinbase" onclick="subscribePlan(${plan.id}, 'coinbase')">
          ₿ PAY WITH CRYPTO
        </button>
      `}
    `;
    
    pricingGrid.appendChild(card);
  });
}

// Subscription Tier Payment Modal Functions
let selectedTier = null;
const tierPlans = {
  'beta_v1': { id: 1, name: 'BETA V1', price: '$4/mo' },
  'base': { id: 2, name: 'BASE', price: '$4/mo' },
  'premium': { id: 3, name: 'PREMIUM', price: '$4/mo' }
};

function showPaymentOptions(tier) {
  selectedTier = tier;
  const modal = document.getElementById('paymentModal');
  const modalTitle = document.getElementById('modalTitle');
  
  if (modal && modalTitle) {
    modalTitle.textContent = `Subscribe to ${tierPlans[tier].name} - ${tierPlans[tier].price}`;
    modal.style.display = 'flex';
  }
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.style.display = 'none';
  }
  selectedTier = null;
}

async function initiatePayment(provider) {
  if (!selectedTier) {
    alert('Please select a subscription tier');
    return;
  }
  
  const planId = tierPlans[selectedTier].id;
  console.log(`💳 Initiating ${provider} payment for tier: ${selectedTier}, plan ID: ${planId}`);
  
  // Call the existing subscribePlan function
  await subscribePlan(planId, provider);
  closePaymentModal();
}

async function subscribePlan(planId, provider) {
  try {
    const endpoint = provider === 'stripe' 
      ? '/api/payments/stripe/create-session'
      : '/api/payments/coinbase/create-charge';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      alert(`Payment error: ${data.error}`);
      return;
    }
    
    if (provider === 'stripe' && data.url) {
      window.location.href = data.url;
    } else if (provider === 'coinbase' && data.hostedUrl) {
      window.location.href = data.hostedUrl;
    }
  } catch (error) {
    console.error('Subscription error:', error);
    alert('Failed to initiate payment. Please try again.');
  }
}

function checkPremiumAccess() {
  return userFeatures.includes('ai_analysis') || userFeatures.includes('advanced_alerts');
}

// Action Button Functions
function openSubscribe() {
  const walletBtn = document.querySelector('[data-tab="wallet"]');
  if (walletBtn) walletBtn.click();
}

function openWallet() {
  const walletBtn = document.querySelector('[data-tab="wallet"]');
  if (walletBtn) walletBtn.click();
}

function resetSession() {
  if (confirm('Reset your session? This will clear chat history.')) {
    const messagesDiv = document.getElementById('catMessages');
    messagesDiv.innerHTML = `
      <div class="cat-msg">
        <strong>Crypto Cat:</strong> Hey there! I'm your trading advisor. Ask me about tokens, strategies, or market trends.
      </div>
    `;
    console.log('🔄 Session reset');
  }
}

function refresh() {
  location.reload();
}

// ==========================================
// NO POPUPS FOR ADMIN LOGIN - USER REQUEST
// ==========================================
// Admin login flow must be silent - no alerts, no confirms, no popups
function openAdmin() {
  // Removed popup - admin access via Settings tab login only
  console.log('Admin access available via Settings tab');
}

// ==========================================
// ADMIN LOGIN - NO POPUPS ALLOWED
// ==========================================
// This function handles admin authentication
// CRITICAL: NO alert(), confirm(), or popups of any kind
// All feedback must be shown in the status element only
// Show simple admin login prompt
function showAdminLogin() {
  const accessCode = prompt('👑 Enter Admin Access Code:');
  
  if (!accessCode || !accessCode.trim()) {
    return; // User cancelled or entered nothing
  }
  
  // Call the admin login with the entered code
  adminLoginWithCode(accessCode.trim());
}

async function adminLoginWithCode(accessCode) {
  console.log('🔑 Admin login attempt with code length:', accessCode.length);
  
  if (!accessCode) {
    alert('⚠️ Please enter access code');
    return;
  }
  
  try {
    // First, validate the code
    console.log('1️⃣ Step 1: Validating admin code...');
    const validateResponse = await fetch('/api/admin/validate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode })
    });
    
    const validateData = await validateResponse.json();
    console.log('✅ Step 1 result:', validateData);
    
    if (validateResponse.ok && validateData.valid) {
      // Now login with the credential
      console.log('2️⃣ Step 2: Logging in with admin credentials...');
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: accessCode })
      });
      
      const loginData = await loginResponse.json();
      console.log('✅ Step 2 result:', loginData);
      console.log('📋 Response headers:', loginResponse.headers);
      console.log('🍪 Document cookies:', document.cookie);
      
      if (loginResponse.ok && loginData.success) {
        console.log('✅ Step 2 SUCCESS! User:', loginData.user);
        alert('✅ Admin access granted! Redirecting to admin dashboard...');
        
        // Redirect to admin dashboard
        console.log('3️⃣ Step 3: Redirecting to /admin...');
        window.location.href = '/admin';
      } else {
        console.error('❌ Step 2 FAILED:', loginData.error || 'Unknown error');
        alert('❌ Login failed. Please try again.');
      }
    } else {
      console.error('❌ Step 1 FAILED: Invalid admin code');
      alert('❌ Invalid admin code');
    }
  } catch (error) {
    console.error('💥 Admin login error:', error);
    alert('❌ Login failed. Please try again.');
  }
}

// OLD adminLogin function kept for backward compatibility (if called from anywhere else)
async function adminLogin() {
  const accessCodeInput = document.getElementById('adminAccessCode');
  const statusElement = document.getElementById('adminLoginStatus');
  
  // If elements exist, use old flow
  if (accessCodeInput && statusElement) {
    const accessCode = accessCodeInput.value.trim();
    if (accessCode) {
      await adminLoginWithCode(accessCode);
    } else {
      alert('⚠️ Please enter access code');
    }
  } else {
    // Otherwise show prompt
    showAdminLogin();
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = event.target;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
    button.title = 'Hide password';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
    button.title = 'Show password';
  }
}

// Gauge State Singleton
window.gaugeState = {
  fearGreed: 25,
  altSeason: 75,
  updateFearGreed(value) {
    this.fearGreed = value;
  },
  updateAltSeason(value) {
    this.altSeason = value;
  }
};

// Initialize Gauges
async function initGauges() {
  const altSeasonCanvas = document.getElementById('altSeasonGauge');
  if (altSeasonCanvas) {
    drawAltSeasonGauge(altSeasonCanvas, window.gaugeState.altSeason, { mode: 'dashboard' });
    
    // Set altSeason value display
    const altSeasonValueElement = document.getElementById('altSeasonValue');
    if (altSeasonValueElement) {
      altSeasonValueElement.textContent = window.gaugeState.altSeason;
    }
  }
  
  await loadFearGreedIndex();
  
  // Listen for persona changes to refresh gauges
  window.addEventListener('personaChanged', function() {
    refreshAllGauges();
  });
}

function refreshAllGauges() {
  // Refresh dashboard gauges
  if (typeof drawFearGreedGauge === 'function') {
    drawFearGreedGauge('fearGreedGauge', window.gaugeState.fearGreed, { mode: 'dashboard' });
  }
  
  const altSeasonCanvas = document.getElementById('altSeasonGauge');
  if (altSeasonCanvas && typeof drawAltSeasonGauge === 'function') {
    drawAltSeasonGauge(altSeasonCanvas, window.gaugeState.altSeason, { mode: 'dashboard' });
    
    // Update altSeason value display
    const altSeasonValueElement = document.getElementById('altSeasonValue');
    if (altSeasonValueElement) {
      altSeasonValueElement.textContent = window.gaugeState.altSeason;
    }
  }
  
  // Refresh popup gauge if open
  const popupCanvas = document.getElementById('gaugePopupCanvas');
  const popup = document.getElementById('gaugePopup');
  if (popup && popup.style.display !== 'none' && popupCanvas && window.currentGaugeType) {
    if (window.currentGaugeType === 'feargreed') {
      // Use LIVE Fear & Greed value from API (same as popup uses)
      const liveFearGreedValue = window.currentFearGreedData ? window.currentFearGreedData.value : window.gaugeState.fearGreed;
      if (typeof drawFearGreedGauge === 'function') {
        drawFearGreedGauge('gaugePopupCanvas', liveFearGreedValue, { mode: 'popup' });
      }
    } else if (window.currentGaugeType === 'altseason') {
      // Use LIVE Altcoin Season value (same as popup uses)
      const liveAltSeasonValue = window.gaugeState ? window.gaugeState.altSeason : 75;
      if (typeof drawAltSeasonGauge === 'function') {
        drawAltSeasonGauge(popupCanvas, liveAltSeasonValue, { mode: 'popup' });
      }
    }
  }
}

async function loadFearGreedIndex() {
  try {
    // Use retry with backoff for backend startup delays
    const data = await retryWithBackoff(async () => {
      const response = await fetch('/api/sentiment/fear-greed?limit=1');
      if (!response.ok) {
        throw new Error('Failed to fetch Fear & Greed Index');
      }
      return await response.json();
    }, 5, 1000); // 5 retries, starting at 1s delay (1s, 2s, 4s, 8s, 16s)
    
    console.log('📊 Fear & Greed API response:', JSON.stringify(data));
    
    if (data && data.data && data.data[0]) {
      const fgiData = data.data[0];
      // Handle both camelCase and snake_case field names from API
      const rawValue = fgiData.value ?? fgiData.score ?? 50;
      const value = parseInt(rawValue) || 50;
      const classification = fgiData.valueClassification || fgiData.value_classification || 'Neutral';
      
      console.log(`📊 Fear & Greed parsed: value=${value}, classification=${classification}`);
      
      if (!isNaN(value) && value >= 0 && value <= 100) {
        window.gaugeState.updateFearGreed(value);
        
        // Update dashboard gauge with LIVE value
        if (typeof drawFearGreedGaugeClean === 'function') {
          drawFearGreedGaugeClean('fearGreedGauge', value);
        }
        
        // Update the text value on dashboard
        const fearGreedValueElement = document.getElementById('fearGreedValue');
        if (fearGreedValueElement) {
          fearGreedValueElement.textContent = value;
          console.log('✅ Fear & Greed value element updated to:', value);
        }
        
        // Update subtitle text
        const fearGreedSubtitleElement = document.getElementById('fearGreedSubtitle');
        if (fearGreedSubtitleElement) {
          fearGreedSubtitleElement.textContent = classification;
        }
        
        window.currentFearGreedData = {
          value,
          classification,
          timestamp: fgiData.timestamp
        };
        
        console.log(`✅ Fear & Greed Index updated: ${value} (${classification})`);
      }
    }
  } catch (error) {
    console.error('Failed to load Fear & Greed Index after retries:', error);
    window.gaugeState.updateFearGreed(50);
    
    // Update the text value on dashboard with fallback
    const fearGreedValueElement = document.getElementById('fearGreedValue');
    if (fearGreedValueElement) {
      fearGreedValueElement.textContent = '50';
    }
    
    // Update dashboard gauge with fallback value
    if (typeof drawFearGreedGaugeClean === 'function') {
      drawFearGreedGaugeClean('fearGreedGauge', 50);
    }
  }
}

// Draw Alt Season Gauge (supports cat needle toggle)
function drawAltSeasonGaugeBackground(ctx, centerX, centerY, radius, lineWidth) {
  // Draw background arc with smooth gradient from gold (Bitcoin) to cyan (Altcoin)
  const numSegments = 20; // Smooth gradient with many small segments
  const totalAngle = Math.PI; // 180 degrees
  const segmentAngle = totalAngle / numSegments;
  
  for (let i = 0; i < numSegments; i++) {
    const startAngle = Math.PI + (i * segmentAngle);
    const endAngle = startAngle + segmentAngle;
    const segmentValue = (i / (numSegments - 1)) * 100; // 0 to 100
    
    // Gold to Cyan gradient
    const ratio = segmentValue / 100;
    const r = Math.round(255 * (1 - ratio)); // Red decreases from 255 to 0
    const g = Math.round(215 + (255 - 215) * ratio); // Green increases from 215 to 255
    const b = Math.round(0 + 255 * ratio); // Blue increases from 0 to 255
    const segmentColor = `rgb(${r}, ${g}, ${b})`;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = segmentColor;
    ctx.stroke();
  }
}

function drawAltSeasonRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength, value = 50) {
  // Gold to Cyan gradient based on value
  const ratio = value / 100;
  const r = Math.round(255 * (1 - ratio)); // Red decreases from 255 to 0
  const g = Math.round(215 + (255 - 215) * ratio); // Green increases from 215 to 255
  const b = Math.round(0 + 255 * ratio); // Blue increases from 0 to 255
  const needleColor = `rgb(${r}, ${g}, ${b})`;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(needleLength, 0);
  ctx.lineTo(0, 12);
  ctx.closePath();
  
  ctx.fillStyle = needleColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
}

function drawAltSeasonCatNeedle(ctx, centerX, centerY, radius, angle, needleLength, value, scaleFactor = 1) {
  // SIMPLIFIED: Just gradient needle + cat face (no arm)
  if (!businessCatAltSeasonImages.loaded) {
    drawAltSeasonRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength, value);
    return;
  }
  
  // Use same cat face for both business and casual modes (grumpy face)
  const catFace = businessCatAltSeasonImages.grumpyFace;
  
  if (!catFace) {
    drawAltSeasonRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength, value);
    return;
  }
  
  // 1. Draw gradient needle
  drawAltSeasonRegularNeedle(ctx, centerX, centerY, radius, angle, needleLength, value);
  
  // 2. Draw cat face on baseline (bottom edge at centerY - the gauge pivot point)
  const faceWidth = 50 * scaleFactor;
  const faceScale = faceWidth / catFace.width;
  const faceHeight = catFace.height * faceScale;
  const faceX = centerX - faceWidth / 2; // Centered horizontally
  const faceY = centerY - faceHeight; // Bottom at centerY baseline
  
  ctx.drawImage(catFace, faceX, faceY, faceWidth, faceHeight);
}

function drawAltSeasonGauge(canvas, value, options = {}) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const radius = Math.min(width, height) / 2 - 15;
  const centerY = height - 10;
  const lineWidth = Math.max(8, radius / 3);
  
  ctx.clearRect(0, 0, width, height);
  
  drawAltSeasonGaugeBackground(ctx, centerX, centerY, radius, lineWidth);
  
  const needleAngle = Math.PI + (value / 100) * Math.PI;
  const needleLength = radius + 5;
  
  // Check persona mode: Business/Casual = cat needles, Off = regular needles
  const isDashboard = options.mode === 'dashboard';
  const personaMode = window.currentCatMode || 'off';
  const catNeedleEnabled = !isDashboard && (personaMode === 'business' || personaMode === 'casual');
  
  console.log('Drawing Altcoin Season needle:', { value, angle: needleAngle, catMode: catNeedleEnabled, personaMode, mode: options.mode });
  
  // Scale factor: popup mode gets 2.2x larger cat images for visibility
  const scaleFactor = options.mode === 'popup' ? 2.2 : 1;
  
  if (catNeedleEnabled) {
    drawAltSeasonCatNeedle(ctx, centerX, centerY, radius, needleAngle, needleLength, value, scaleFactor);
    // NO CENTER DOT for cat needle - cat body covers it
  } else {
    drawAltSeasonRegularNeedle(ctx, centerX, centerY, radius, needleAngle, needleLength, value);
    // Draw center circle only for regular needle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#3861FB';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Draw value number - COMMENTED OUT: values now displayed in gauge-value-display div above canvas
  // ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  // ctx.fillStyle = '#FFFFFF';
  // ctx.textAlign = 'center';
  // ctx.textBaseline = 'middle';
  // ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  // ctx.shadowBlur = 4;
  // ctx.shadowOffsetX = 0;
  // ctx.shadowOffsetY = 0;
  // ctx.fillText(Math.round(value), centerX, centerY - 35);
  // ctx.shadowBlur = 0;
}

// Get random Crypto Cat image based on persona
function getRandomCatImage() {
  const businessCatImages = [
    '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png',
    '/trading-cards/Grumpy_cat_arms_crossed_f8e46099.png',
    '/trading-cards/Grumpy_cat_facepalm_pose_2fdc5a6a.png',
    '/trading-cards/Grumpy_cat_angry_pose_63318575.png'
  ];
  
  // Random selection from business cat images
  const randomIndex = Math.floor(Math.random() * businessCatImages.length);
  return businessCatImages[randomIndex];
}

// Get random first-person quote from Crypto Cat
function getRandomCatQuote(persona, gaugeType) {
  const businessQuotes = {
    feargreed: [
      "💼 Listen up - extreme fear is when I buy my best positions. The herd panics, I accumulate.",
      "📊 Market fear at these levels? I'm analyzing entry points while others are selling.",
      "🎯 Professional traders know: fear creates opportunity. I'm watching the data, not the noise.",
      "💡 Here's what I've learned: when fear peaks, that's when fortunes are made. Stay disciplined."
    ],
    altseason: [
      "📈 Alt season is my hunting ground. I follow the capital flows, not the hype.",
      "🔍 When alts pump like this, I'm taking profits and managing risk. Professional discipline wins.",
      "💼 Bitcoin dominance tells me where smart money is moving. I follow the institutional flows.",
      "⚖️ Market rotation is all about timing. I watch the data and execute with precision."
    ]
  };
  
  const casualQuotes = {
    feargreed: [
      "😼 LOL everyone's panic-selling while I'm shopping for discounts. Fear = my Black Friday sale!",
      "🐱 Y'all freaking out? Perfect. More cheap coins for me while you're crying into your wallets.",
      "😹 Extreme fear? That's just the market asking 'who wants to get rich?' and I'm raising my paw.",
      "🎭 Fear and panic everywhere? Sweet, my favorite time to stack. Keep selling, I'll keep buying!"
    ],
    altseason: [
      "🚀 Alt season baby! Time to watch my portfolio go brrrrr while Bitcoin maxis cry.",
      "😎 Alts pumping harder than a gym bro on pre-workout. I'm loving this chaos!",
      "🌙 When alts moon like this, I'm already planning my exit. Buy rumors, sell news, baby!",
      "🎰 Alt season = casino mode activated. I'm taking profits while degen traders YOLO their life savings."
    ]
  };
  
  const quotes = persona === 'business' ? businessQuotes : casualQuotes;
  const typeQuotes = quotes[gaugeType] || quotes.feargreed;
  const randomIndex = Math.floor(Math.random() * typeQuotes.length);
  return typeQuotes[randomIndex];
}

// Gauge Popup Functions with Crypto Cat Integration
function openGaugePopup(gaugeType) {
  const popup = document.getElementById('gaugePopup');
  const title = document.getElementById('gaugePopupTitle');
  const description = document.getElementById('gaugePopupDescription');
  const commentary = document.getElementById('gaugePopupCommentary');
  const value = document.getElementById('gaugePopupValue');
  const catImage = document.getElementById('gaugePopupCatImage');
  
  // Track current gauge type for refreshing when persona changes
  window.currentGaugeType = gaugeType;
  
  // Get current persona mode
  const persona = window.personaManager ? personaManager.getPersona() : 'business';
  
  // Set random cat image and quote based on persona
  const gaugePopupCat = document.querySelector('.gauge-popup-cat');
  const scrollArrow = document.querySelector('.scroll-arrow-btn');
  const catQuote = document.getElementById('catQuote');
  
  if (persona === 'business' || persona === 'casual') {
    // Show cat, arrow, and quote
    if (catImage) {
      catImage.src = getRandomCatImage();
    }
    if (gaugePopupCat) gaugePopupCat.style.display = 'block';
    if (scrollArrow) scrollArrow.style.display = 'block';
    
    // Add first-person quote from Crypto Cat
    if (catQuote) {
      const quote = getRandomCatQuote(persona, gaugeType);
      catQuote.innerHTML = `<strong>🐱 Crypto Cat:</strong> "${quote}"`;
      catQuote.style.display = 'block';
    }
  } else {
    // Hide cat, arrow, and quote in OFF mode
    if (gaugePopupCat) gaugePopupCat.style.display = 'none';
    if (scrollArrow) scrollArrow.style.display = 'none';
    if (catQuote) catQuote.style.display = 'none';
  }
  
  // Get LIVE values from window state
  const liveFearGreedValue = window.currentFearGreedData ? window.currentFearGreedData.value : (window.gaugeState ? window.gaugeState.fearGreed : 25);
  const liveFearGreedLabel = window.currentFearGreedData ? window.currentFearGreedData.classification : 'Unknown';
  const liveAltSeasonValue = window.gaugeState ? window.gaugeState.altSeason : 75;
  
  // Calculate alt season label based on value
  let altSeasonLabel = 'Bitcoin Season';
  if (liveAltSeasonValue >= 75) altSeasonLabel = 'Alt Season';
  else if (liveAltSeasonValue >= 50) altSeasonLabel = 'Mixed Market';
  
  // Get dynamic commentary using rotation system
  const baseDefinition = window.commentaryManager ? commentaryManager.getBaseDefinition(gaugeType) : '';
  const catComment = window.commentaryManager ? commentaryManager.getRandomComment(gaugeType, persona) : '';
  
  // Generate market conditions commentary based on current values
  function getMarketCommentary(type, val) {
    if (type === 'feargreed') {
      if (val <= 20) return '🔴 <strong>Extreme Fear Alert:</strong> The market is in panic mode. Investors are selling aggressively. Historically, this can signal buying opportunities for long-term holders, but expect high volatility.';
      if (val <= 40) return '⚠️ <strong>Fear Dominates:</strong> Sentiment is negative with widespread uncertainty. Traders are cautious, and sell-offs are occurring. Risk-averse conditions prevail.';
      if (val <= 60) return '🟡 <strong>Neutral Territory:</strong> Market sentiment is balanced. Neither fear nor greed is driving decisions. Trading activity is moderate with mixed signals.';
      if (val <= 80) return '🟢 <strong>Greed Building:</strong> Optimism is rising. Investors are confident and buying pressure is increasing. Watch for overheating as FOMO begins to emerge.';
      return '🔥 <strong>Extreme Greed Warning:</strong> The market is euphoric! Excessive optimism and FOMO are driving prices. Historically, this signals a potential correction ahead. Exercise caution.';
    } else if (type === 'altseason') {
      if (val <= 25) return '₿ <strong>Bitcoin Dominance Season:</strong> Bitcoin is outperforming altcoins significantly. Capital is flowing into BTC as the safe-haven crypto. Altcoins are bleeding against BTC.';
      if (val <= 45) return '⚖️ <strong>Bitcoin Leaning Market:</strong> Bitcoin is stronger than most altcoins, but some major alts are holding ground. Mixed performance across the altcoin market.';
      if (val <= 65) return '🔄 <strong>Transitional Phase:</strong> The market is shifting. Some altcoins are starting to outperform Bitcoin. Watch for rotation from BTC profits into altcoins.';
      if (val <= 85) return '🚀 <strong>Alt Season Emerging:</strong> Altcoins are outperforming Bitcoin! Capital is rotating from BTC into alts. High-risk, high-reward conditions for altcoin traders.';
      return '🌟 <strong>Peak Alt Season:</strong> Altcoins are massively outperforming Bitcoin! Extreme speculation and gains across most alts. Watch for exhaustion signals.';
    }
    return '';
  }
  
  // Define static data for each gauge type
  const gaugeData = {
    feargreed: {
      title: 'Fear & Greed Index',
      description: baseDefinition,
      value: liveFearGreedValue,
      label: liveFearGreedLabel
    },
    altseason: {
      title: 'Alt Season Index',
      description: baseDefinition,
      value: liveAltSeasonValue,
      label: altSeasonLabel
    },
    marketcap: {
      title: 'Total Market Capitalization',
      description: baseDefinition,
      value: '3.5T',
      label: '+3.2% (24h)'
    }
  };
  
  const data = gaugeData[gaugeType];
  
  // Update popup content (check elements exist first)
  if (title) title.textContent = data.title;
  
  // Show market conditions commentary for gauge types
  if (commentary && (gaugeType === 'feargreed' || gaugeType === 'altseason')) {
    const marketCommentaryText = getMarketCommentary(gaugeType, data.value);
    if (marketCommentaryText) {
      commentary.innerHTML = marketCommentaryText;
      commentary.style.display = 'block';
    } else {
      commentary.style.display = 'none';
    }
  } else if (commentary) {
    commentary.style.display = 'none';
  }
  
  // Build description with dynamic commentary
  const fullDescription = catComment 
    ? data.description + '\n\n💬 Crypto Cat says: ' + catComment
    : data.description;
  
  if (description) description.textContent = fullDescription;
  if (value) value.textContent = `${data.value} - ${data.label}`;
  
  // Show popup
  popup.style.display = 'flex';
}

function closeGaugePopup() {
  document.getElementById('gaugePopup').style.display = 'none';
  window.currentGaugeType = null; // Clear gauge type when popup closes
}

// Scroll to gauge content when arrow is clicked
function scrollToGaugeContent() {
  const popup = document.querySelector('.gauge-popup-content');
  if (popup) {
    const title = popup.querySelector('#gaugePopupTitle');
    if (title) {
      title.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function showGaugePopup(gaugeType) {
  openGaugePopup(gaugeType);
}

// Show metric explanations with gauge visualizations
// Volume Flow Explanation with Persona Awareness
function showVolumeFlowExplanation() {
  const personaMode = window.currentCatMode || 'off';
  const flowPercent = window.currentVolumeFlowPercent || 0;
  const isInflow = flowPercent > 0;
  const isOutflow = flowPercent < 0;
  const isNeutral = Math.abs(flowPercent) < 0.1;
  
  let term = 'Volume Flow Indicator';
  let definition = '';
  
  if (personaMode === 'business' || personaMode === 'casual') {
    // Crypto Cat mode - persona-aware commentary
    if (isNeutral) {
      term = '⚖️ Neutral Volume Flow';
      definition = personaMode === 'business' 
        ? `Market liquidity remains stable with minimal directional bias. Volume equilibrium suggests consolidation phase—prime conditions for position accumulation before the next trend develops. Monitor for breakout signals.`
        : `Volume's chillin' like a villain right now. No major money moving in or out—just sideways action. Perfect time to stack before the next pump or dump. Stay frosty! 😎`;
    } else if (isInflow) {
      term = `📈 +${Math.abs(flowPercent).toFixed(1)}% Volume Inflow`;
      definition = personaMode === 'business'
        ? `Capital inflow detected: ${Math.abs(flowPercent).toFixed(1)}% increase in trading volume indicates institutional accumulation or retail FOMO entry. GREEN signal = bullish momentum building. Higher volume validates uptrend strength. Watch for continuation.`
        : `💰 MONEY PRINTER GO BRRR! ${Math.abs(flowPercent).toFixed(1)}% more volume flowing IN means people are BUYING THE DIP or FOMO'ing in. Green means go—bulls are charging! Ride the wave but don't get wrecked! 🚀`;
    } else if (isOutflow) {
      term = `📉 -${Math.abs(flowPercent).toFixed(1)}% Volume Outflow`;
      definition = personaMode === 'business'
        ? `Capital outflow detected: ${Math.abs(flowPercent).toFixed(1)}% decrease in trading volume suggests profit-taking or risk-off positioning. RED signal = bearish pressure. Lower volume may indicate weakening trend or consolidation ahead.`
        : `🔥 PAPER HANDS SELLING! ${Math.abs(flowPercent).toFixed(1)}% less volume means people are DUMPING or taking profits. Red means STOP—bears are feasting. Might be a buying opportunity or a falling knife. Don't catch it! 🐻`;
    }
  } else {
    // Persona OFF - plain educational description
    if (isNeutral) {
      term = 'Neutral Volume Flow';
      definition = 'Trading volume is stable with no significant change. This indicates market equilibrium where buying and selling pressure are balanced. Often occurs during consolidation periods before the next major move.';
    } else if (isInflow) {
      term = `+${Math.abs(flowPercent).toFixed(1)}% Volume Inflow`;
      definition = `Trading volume has INCREASED by ${Math.abs(flowPercent).toFixed(1)}% compared to the previous period. Volume inflow (shown in GREEN) means more capital is entering the market through increased buying activity. This typically signals growing interest and potential upward price pressure. Higher volume during uptrends confirms trend strength.`;
    } else if (isOutflow) {
      term = `-${Math.abs(flowPercent).toFixed(1)}% Volume Outflow`;
      definition = `Trading volume has DECREASED by ${Math.abs(flowPercent).toFixed(1)}% compared to the previous period. Volume outflow (shown in RED) means less capital is circulating in the market, often due to profit-taking or reduced interest. Lower volume can signal weakening trends or consolidation periods. Watch for volume spikes to confirm new trend direction.`;
    }
  }
  
  // Show popup using agent popup system
  if (typeof showAgentPopup === 'function') {
    showAgentPopup(term, definition);
  } else if (typeof showCatPopup === 'function') {
    showCatPopup(term, definition);
  }
}

function showMetricExplanation(metricType) {
  // Only show gauges for feargreed and altseason, use regular cat popup for others
  if (metricType === 'feargreed' || metricType === 'altseason') {
    showGaugePopup(metricType);
    return;
  }
  
  const explanations = {
    marketcap: {
      term: 'Total Market Cap',
      definition: 'The combined value of ALL cryptocurrencies. This shows the total money invested in the crypto market. When it\'s GREEN, the market is growing (bullish). When it\'s RED, money is leaving (bearish). Think of it like the temperature of the entire crypto economy!'
    },
    volume: {
      term: '24h Trading Volume',
      definition: 'The total amount of crypto traded in the last 24 hours. HIGH volume means lots of buying and selling action (volatile, exciting times). LOW volume means the market is quiet (boring, but sometimes safer). More volume usually means bigger price movements!'
    },
    volume24h: {
      term: '24h Volume Inflow/Outflow',
      definition: 'Shows how much money is FLOWING into or out of the crypto market. GREEN (+) means INFLOW = more money entering the market (bullish!). RED (-) means OUTFLOW = money leaving the market (bearish!). The percentage shows the change vs yesterday, and the dollar amount shows exactly how much capital moved. Big inflows = institutions buying. Big outflows = panic selling or profit-taking!'
    },
    btcdom: {
      term: 'Bitcoin Dominance',
      definition: 'What percentage of the total crypto market is Bitcoin. When BTC dominance is HIGH (>50%), Bitcoin is king and altcoins struggle. When it\'s LOW (<40%), it\'s ALT SEASON and altcoins pump! This tells you where the money is flowing.'
    },
    ethdom: {
      term: 'Ethereum Dominance',
      definition: 'What percentage of the total crypto market is Ethereum. ETH is the #2 cryptocurrency and the king of smart contracts. When ETH dominance rises, it means money is flowing into DeFi, NFTs, and Ethereum-based projects. When it falls, money might be moving to Bitcoin or other altcoins.'
    }
  };
  
  const metric = explanations[metricType];
  if (metric && typeof showAgentPopup === 'function') {
    showAgentPopup(metric.term, metric.definition);
  } else if (metric && typeof showCatPopup === 'function') {
    showCatPopup(metric.term, metric.definition);
  }
}

// Stock Index Explanations
function showIndexExplanation(indexType) {
  const explanations = {
    nasdaq: {
      term: 'NASDAQ Composite',
      definition: 'The NASDAQ is a stock market index tracking over 3,000 companies, heavily focused on TECHNOLOGY and GROWTH stocks like Apple, Microsoft, Tesla, and NVIDIA. When NASDAQ is UP, tech stocks are thriving. When it\'s DOWN, tech is struggling. This is your go-to index for tracking the tech sector and innovation-driven companies!'
    },
    dji: {
      term: 'Dow Jones Industrial Average (DJI)',
      definition: 'The Dow Jones tracks 30 of the largest, most ESTABLISHED companies in America like Boeing, Coca-Cola, and McDonald\'s. Think of it as the "blue chip" index - these are OLD, RELIABLE companies. When the Dow moves, it shows how traditional American business is doing. It\'s less volatile than NASDAQ but represents the backbone of the economy!'
    },
    sp500: {
      term: 'S&P 500 Index',
      definition: 'The S&P 500 tracks the top 500 LARGEST companies in the U.S. across ALL sectors - tech, healthcare, finance, energy, everything! This is considered the BEST measure of overall U.S. stock market health. When investors say "the market is up," they usually mean the S&P 500. It\'s the gold standard for tracking American stock performance!'
    }
  };
  
  const index = explanations[indexType];
  if (index && typeof showAgentPopup === 'function') {
    showAgentPopup(index.term, index.definition);
  } else if (index && typeof showCatPopup === 'function') {
    showCatPopup(index.term, index.definition);
  }
}

// Bitcoin Chart Explanation
function showBitcoinProxyExplanation() {
  const term = 'Bitcoin (BTC) - The King of Crypto';
  const btcDom = document.getElementById('btcDominance')?.textContent || '52%';
  const definition = `Bitcoin is the most important asset in crypto. When BTC moves, the entire market follows. This chart shows real-time Bitcoin price action using professional-grade data. Bitcoin currently holds ${btcDom} market dominance, making every tick of this chart crucial for understanding crypto market direction. Watch this chart to stay ahead of the market.`;
  
  if (typeof showAgentPopup === 'function') {
    showAgentPopup(term, definition);
  } else if (typeof showCatPopup === 'function') {
    showCatPopup(term, definition);
  }
}

// Project Likes State Management
window.projectLikesState = {};

// Toggle Project Like
async function toggleProjectLike(event, projectId) {
  event.stopPropagation(); // Prevent opening coin popup
  
  const btn = event.currentTarget;
  const icon = btn.querySelector('.featured-coin-like-icon');
  const countEl = btn.querySelector('.featured-coin-like-count');
  
  const currentState = window.projectLikesState[projectId] || { liked: false, likes: 0 };
  const newLiked = !currentState.liked;
  
  // Optimistic update
  btn.classList.toggle('liked', newLiked);
  icon.textContent = newLiked ? '❤️' : '🤍';
  
  try {
    const url = `/api/projects/${projectId}/likes`;
    const method = newLiked ? 'POST' : 'DELETE';
    
    const response = await fetch(url, { method });
    
    if (!response.ok) {
      throw new Error('Failed to update like');
    }
    
    const data = await response.json();
    
    // Update state and UI with server response
    window.projectLikesState[projectId] = { liked: data.liked, likes: data.likes };
    countEl.textContent = data.likes;
    btn.classList.toggle('liked', data.liked);
    icon.textContent = data.liked ? '❤️' : '🤍';
    
    console.log(`${newLiked ? '❤️' : '💔'} Project ${projectId} like updated:`, data);
  } catch (error) {
    console.error('Error toggling like:', error);
    
    // Revert optimistic update on error
    btn.classList.toggle('liked', currentState.liked);
    icon.textContent = currentState.liked ? '❤️' : '🤍';
    countEl.textContent = currentState.likes;
  }
}

// Fetch Like Status for All Projects
async function fetchProjectLikes(projectIds) {
  const results = {};
  
  // Fetch likes for each project in parallel
  const promises = projectIds.map(async (id) => {
    try {
      const response = await fetch(`/api/projects/${id}/likes`);
      if (response.ok) {
        const data = await response.json();
        results[id] = data;
      } else {
        results[id] = { liked: false, likes: 0 };
      }
    } catch (error) {
      console.error(`Error fetching likes for project ${id}:`, error);
      results[id] = { liked: false, likes: 0 };
    }
  });
  
  await Promise.all(promises);
  return results;
}

// Project Coins Grid Loader (Separate Carousels by Category)
async function loadProjectCoins() {
  try {
    const response = await fetch('/coins/project-coins.json');
    const coins = await response.json();
    
    // Group coins by category
    const categories = {
      cryptocat: coins.filter(c => c.category === 'cryptocat'),
      conspiracy: coins.filter(c => c.category === 'conspiracy'),
      spiritual: coins.filter(c => c.category === 'spiritual'),
      meme: coins.filter(c => c.category === 'meme')
    };
    
    // Render each category carousel
    const renderCategory = (gridId, categoryCoins) => {
      const grid = document.getElementById(gridId);
      if (!grid || categoryCoins.length === 0) return;
      
      grid.innerHTML = categoryCoins.map(coin => `
        <div class="featured-coin-card" onclick="openCoinPopup(${coin.id})">
          <img src="${coin.image}" alt="${coin.name}" class="featured-coin-image" onerror="this.src='/darkwave-coin.png'" />
          <div class="featured-coin-ticker">$${coin.ticker}</div>
        </div>
      `).join('');
    };
    
    renderCategory('cryptocatGrid', categories.cryptocat);
    renderCategory('conspiracyGrid', categories.conspiracy);
    renderCategory('spiritualGrid', categories.spiritual);
    renderCategory('memeGrid', categories.meme);
    
    window.projectCoinsData = coins;
    
    // Fetch like counts for all coins + Coming Soon projects
    const coinIds = coins.map(c => c.id);
    const comingSoonIds = [9999, 10000]; // Coming Soon project IDs
    const allIds = [...coinIds, ...comingSoonIds];
    const likesData = await fetchProjectLikes(allIds);
    
    // Store like data globally (will be used in popups)
    window.projectLikesState = likesData;
    
    console.log('✅ Project coins loaded in category carousels:', {
      cryptocat: categories.cryptocat.length,
      conspiracy: categories.conspiracy.length,
      spiritual: categories.spiritual.length,
      meme: categories.meme.length
    });
  } catch (error) {
    console.error('Error loading project coins:', error);
  }
}

// Open Coin Detail Popup with Cat Integration (Full-Screen Two-Panel)
function openCoinPopup(coinId) {
  const coin = window.projectCoinsData?.find(c => c.id === coinId);
  if (!coin) return;
  
  // NO CRYPTO CAT POPUPS on Projects page (accessible to everyone) - but coin details are allowed
  const currentTab = document.querySelector('.tab-pane.active');
  const isProjectsPage = currentTab && currentTab.id === 'projects';
  
  // Check if user has access to coin popups (paid subscribers only) - unless on Projects page
  if (!isProjectsPage && typeof hasFeatureAccess === 'function' && !hasFeatureAccess('cryptoCatCoinPopups')) {
    console.log('🔒 Coin popups restricted to paid subscribers');
    return;
  }
  
  // Get current persona mode - force OFF on Projects page (no Crypto Cat)
  const persona = isProjectsPage ? 'off' : (window.currentCatMode || 'off');
  
  const overlay = document.createElement('div');
  overlay.className = 'coin-popup-overlay cat-popup';
  overlay.onclick = (e) => {
    if (e.target.classList.contains('cat-popup-close')) closeCoinPopup();
  };
  
  // Single panel with optional cat (only if mode is selected)
  const catImage = persona !== 'off' 
    ? (persona === 'business' 
      ? '/trading-cards/Grumpy_cat_neutral_pose_ba4a1b4d.png'
      : '/trading-cards/Grumpy_cat_sideeye_pose_5e52df88.png')
    : null;
  
  const catHtml = catImage ? `
    <div class="cat-popup-cat">
      <img src="${catImage}" alt="Crypto Cat" />
    </div>
  ` : '';
  
  overlay.innerHTML = `
    <div class="cat-popup-content ${persona === 'off' ? 'cat-popup-simple' : ''}">
      <button class="cat-popup-close" onclick="closeCoinPopup()" aria-label="Close">×</button>
      
      ${catHtml}
      
      <div class="cat-popup-panel">
        <div class="coin-popup-header">
          <img src="${coin.image}" alt="${coin.name}" class="coin-popup-image" onerror="this.src='/darkwave-coin.png'" />
          <div class="coin-popup-info">
            <h3>${coin.name}</h3>
            <div class="coin-popup-ticker">$${coin.ticker}</div>
          </div>
          <button 
            class="popup-like-btn" 
            onclick="toggleProjectLike(event, ${coin.id})"
            aria-label="Like project"
            data-project-id="${coin.id}"
          >
            <span class="popup-like-icon">🤍</span>
            <span class="popup-like-count">0</span>
          </button>
        </div>
        
        <div class="coin-popup-ca">
          <strong>Contract Address:</strong><br>
          ${coin.contractAddress}
        </div>
        
        <div class="coin-popup-actions">
          <a href="${coin.buyUrl}" target="_blank" rel="noopener noreferrer" class="coin-action-btn">
            🚀 Buy on Jupiter
          </a>
          <button onclick="copyCoinCA(event, '${coin.contractAddress}')" class="coin-action-btn secondary">
            📋 Copy CA
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = '1', 10);
  
  // Update like button state from stored data
  const likeBtn = overlay.querySelector('.popup-like-btn');
  if (likeBtn && window.projectLikesState && window.projectLikesState[coinId]) {
    const likeData = window.projectLikesState[coinId];
    const icon = likeBtn.querySelector('.popup-like-icon');
    const countEl = likeBtn.querySelector('.popup-like-count');
    
    likeBtn.classList.toggle('liked', likeData.liked);
    icon.textContent = likeData.liked ? '❤️' : '🤍';
    countEl.textContent = likeData.likes;
  }
}


// Close Coin Popup
function closeCoinPopup() {
  const popup = document.querySelector('.coin-popup-overlay');
  if (popup) {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 200);
  }
}

// Open Coming Soon Popup
function openComingSoonPopup(projectId) {
  const comingSoonData = {
    10000: {
      name: "DarkWave Coin",
      ticker: "DWAV",
      image: "/darkwave-coin.png",
      description: "🚀 THE MOST REVOLUTIONARY ECOSYSTEM TOKEN IN CRYPTO HISTORY. DarkWave Coin isn't just another token - it's the Netflix of decentralized finance, the iPhone of Web3, and the greatest innovation since Bitcoin itself. This isn't hype. This is the future of sustainable, revenue-backed tokenomics. While other meme coins pump and dump with zero utility, DWAV delivers REAL hourly rewards funded by REAL platform revenue. Staking that actually pays. Airdrops that reward loyalty. A multi-token platform that lets YOU earn passive income from ANY coin you love. This is what crypto was always meant to be - and it launches Christmas Day 2025. The revolution starts here. 🎄⚡",
      launchDate: "December 25th, 2025",
      details: [
        "🎄 Christmas Day 2025 launch - The gift that keeps giving",
        "💎 1 Billion total supply - Deflationary & scarce",
        "⚡ HOURLY staking rewards - Not monthly, not daily, HOURLY",
        "🏆 Multi-token staking platform - Earn passive income from ANY coin",
        "💰 Revenue-backed rewards - Funded by real DarkWave platform profits",
        "📊 Built on Solana - Lightning-fast, ultra-low fees",
        "🔥 Automatic holder airdrops - Just hold DWAV, get rewarded",
        "🎯 4-tier staking pools (2-50% APY) - From casual to whale",
        "🖼️ Custom avatar NFTs - Upload & customize your own",
        "🌊 Multi-chain expansion - SOL, ETH, POLY, BSC coming soon",
        "🚫 NOT a worthless meme coin - Real utility, real rewards, real future"
      ]
    },
    9999: {
      name: "$CRAZY",
      ticker: "CRAZY",
      image: "/crazy-coin.jpg",
      description: "The ultimate meme coin for the chronically online. If you have 47 browser tabs open right now, 12 Discord servers pinging you, and your screen time report makes you cry - this coin is YOU. Too many notifications, too much dopamine, not enough sleep. We're all overstimulated, we're all degenerates, and honestly? We're all in this together. This isn't productivity culture - this is chaos culture. And if you feel personally attacked by this description, congratulations: you're already one of us. 🎯⚡🎵",
      launchDate: "December 10th, 2024",
      details: [
        "⏳ December 10th, 2024 launch",
        "🎯 For the chronically online generation",
        "🚀 Pure meme coin energy, zero pretense",
        "🎪 Community-driven chaos factory",
        "💥 Built on Pump.fun vibes",
        "🎨 Custom meme NFT collection coming",
        "📱 47 tabs, 12 apps, 1 coin",
        "🧠 Embrace the overstimulated life",
        "⚡ No utility, just vibes and culture",
        "🎵 A lifestyle, not just a token"
      ]
    }
  };
  
  const project = comingSoonData[projectId];
  if (!project) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'coin-popup-overlay cat-popup';
  overlay.onclick = (e) => {
    if (e.target.classList.contains('cat-popup-close')) closeCoinPopup();
  };
  
  overlay.innerHTML = `
    <div class="cat-popup-content cat-popup-simple">
      <button class="cat-popup-close" onclick="closeCoinPopup()" aria-label="Close">×</button>
      <div class="cat-popup-panel">
        <div class="coin-popup-header">
          <img src="${project.image}" alt="${project.name}" class="coin-popup-image" onerror="this.src='/darkwave-coin.png'" />
          <div class="coin-popup-info">
            <h3>${project.name}</h3>
            <div class="coin-popup-ticker">$${project.ticker}</div>
          </div>
          <button 
            class="popup-like-btn" 
            onclick="toggleProjectLike(event, ${projectId})"
            aria-label="Like project"
            data-project-id="${projectId}"
          >
            <span class="popup-like-icon">🤍</span>
            <span class="popup-like-count">0</span>
          </button>
        </div>
        
        <div class="coming-soon-popup-details">
          <div class="coming-soon-launch-date">
            <strong>🗓️ Launch Date:</strong> ${project.launchDate}
          </div>
          
          <div class="coming-soon-description">
            ${project.description}
          </div>
          
          <div class="coming-soon-features">
            <strong>Key Features:</strong>
            <ul>
              ${project.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
          </div>
          
          <div class="coming-soon-cta">
            <p>❤️ Like this project to stay updated on the launch!</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = '1', 10);
  
  // Update like button state
  const likeBtn = overlay.querySelector('.popup-like-btn');
  if (likeBtn && window.projectLikesState && window.projectLikesState[projectId]) {
    const likeData = window.projectLikesState[projectId];
    const icon = likeBtn.querySelector('.popup-like-icon');
    const countEl = likeBtn.querySelector('.popup-like-count');
    
    likeBtn.classList.toggle('liked', likeData.liked);
    icon.textContent = likeData.liked ? '❤️' : '🤍';
    countEl.textContent = likeData.likes;
  }
}

// Category Filter Function (FULLY FUNCTIONAL)
let currentCoinCategory = 'top';
let currentTimeframe = '24h'; // For gainers/losers

async function filterCoinCategory(category) {
  currentCoinCategory = category;
  
  // Update active button
  document.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show/hide timeframe toggle based on category
  const timeframeToggle = document.getElementById('timeframeToggle');
  if (category === 'gainers' || category === 'losers') {
    timeframeToggle.style.display = 'flex';
  } else {
    timeframeToggle.style.display = 'none';
  }
  
  // Show loading state
  const tableBody = document.getElementById('coinTableBody');
  tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Loading...</td></tr>';
  
  // Fetch and display coins for this category
  await loadCoinsByCategory(category);
}

// Toggle timeframe for gainers/losers
function toggleTimeframe(event, timeframe) {
  currentTimeframe = timeframe;
  
  // Update active button
  document.querySelectorAll('.timeframe-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Reload current category with new timeframe
  loadCoinsByCategory(currentCoinCategory);
}

// Load coins by category
async function loadCoinsByCategory(category, forceRefresh = false) {
  try {
    const categoryMap = {
      'top': { endpoint: '/api/crypto/category/top', label: 'Top 10 Cryptocurrencies' },
      'meme': { endpoint: '/api/crypto/category/meme', label: 'Top Meme Coins' },
      'defi': { endpoint: '/api/crypto/category/defi', label: 'Top DeFi Tokens' },
      'bluechip': { endpoint: '/api/crypto/category/bluechip', label: 'Blue Chip Cryptocurrencies' },
      'gainers': { endpoint: `/api/crypto/category/gainers?timeframe=${currentTimeframe}`, label: `Top ${currentTimeframe} Gainers` },
      'losers': { endpoint: `/api/crypto/category/losers?timeframe=${currentTimeframe}`, label: `Top ${currentTimeframe} Losers` }
    };
    
    const config = categoryMap[category];
    if (!config) return;
    
    let endpoint = config.endpoint;
    if (forceRefresh) {
      const separator = endpoint.includes('?') ? '&' : '?';
      endpoint += `${separator}_t=${Date.now()}`;
    }
    
    const response = await fetch(endpoint);
    const coins = await response.json();
    
    renderCoinTable(coins, config.label);
  } catch (error) {
    console.error('Error loading coins:', error);
    const tableBody = document.getElementById('coinTableBody');
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: var(--text-dim);">Error loading coins. Please try again.</td></tr>';
  }
}

// Force refresh current category (bypasses cache)
async function refreshCurrentCategory() {
  const tableBody = document.getElementById('coinTableBody');
  tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Refreshing...</td></tr>';
  await loadCoinsByCategory(currentCoinCategory, true);
}

// Get coin logo URL
function getCoinLogo(coin) {
  // If image URL is provided by API, use it
  if (coin.image) {
    return coin.image;
  }
  
  // Comprehensive mapping for major coins
  const logoMap = {
    'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    'XRP': 'https://assets.coingecko.com/coins/images/44/large/xrp-icon.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    'SHIB': 'https://assets.coingecko.com/coins/images/11939/large/shib.png',
    'PEPE': 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png',
    'BONK': 'https://assets.coingecko.com/coins/images/28600/large/bonk_200x200.png',
    'WIF': 'https://assets.coingecko.com/coins/images/33677/large/dogwifhat.png',
    'UNI': 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    'LINK': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    'AAVE': 'https://assets.coingecko.com/coins/images/13016/large/aave-token-square.png',
    'MKR': 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/large/usd-coin-usdc.png',
    'DAI': 'https://assets.coingecko.com/coins/images/9956/large/dai.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/9072/large/avalanche.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic.png',
    'FTM': 'https://assets.coingecko.com/coins/images/4001/large/fantom.png',
    'ATOM': 'https://assets.coingecko.com/coins/images/1481/large/cosmos.png',
    'NEAR': 'https://assets.coingecko.com/coins/images/10365/large/near.png',
    'ICP': 'https://assets.coingecko.com/coins/images/14495/large/icp2.png',
    'FIL': 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
    'XLM': 'https://assets.coingecko.com/coins/images/100/large/stellar.png',
    'THETA': 'https://assets.coingecko.com/coins/images/2538/large/theta.png',
    'RUNE': 'https://assets.coingecko.com/coins/images/6595/large/thorchain.png',
    'BCH': 'https://assets.coingecko.com/coins/images/780/large/bitcoincash.png',
    'LTC': 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    'ETC': 'https://assets.coingecko.com/coins/images/453/large/ethereum-classic.png',
    'DYDX': 'https://assets.coingecko.com/coins/images/17500/large/dydx.png',
    'GMX': 'https://assets.coingecko.com/coins/images/18323/large/arb.png',
    'ARB': 'https://assets.coingecko.com/coins/images/16792/large/arbitrum.png',
    'OP': 'https://assets.coingecko.com/coins/images/25244/large/optimism.png',
    'BLUR': 'https://assets.coingecko.com/coins/images/28453/large/blur.png',
    'SEI': 'https://assets.coingecko.com/coins/images/28205/large/sei.png',
    'INJ': 'https://assets.coingecko.com/coins/images/12882/large/inj.png'
  };
  
  const logoUrl = logoMap[coin.symbol];
  if (logoUrl) return logoUrl;
  
  // If not in map, try to construct a generic fallback using coin name
  // Return null for truly unknown coins to show letter fallback
  return null;
}

// Render coin table with category data
function renderCoinTable(coins, categoryLabel) {
  const tableBody = document.getElementById('coinTableBody');
  
  if (!coins || coins.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: var(--text-dim);">No coins found.</td></tr>';
    return;
  }
  
  tableBody.innerHTML = coins.map(coin => {
    const changeClass = coin.change24h >= 0 ? 'positive' : 'negative';
    const changeSign = coin.change24h >= 0 ? '+' : '';
    const blockchain = coin.blockchain || 'multi';
    const blockchainBadge = getBlockchainBadge(blockchain);
    const logoUrl = getCoinLogo(coin);
    
    const logoHTML = logoUrl 
      ? `<img src="${logoUrl}" alt="${coin.symbol}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`
      : `<div style="width: 24px; height: 24px; border-radius: 50%; background: var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">${coin.symbol.substring(0, 1)}</div>`;
    
    return `
      <tr class="clickable-row" data-symbol="${escapeHtml(coin.symbol)}" data-name="${escapeHtml(coin.name)}">
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${logoHTML}
            <strong>${coin.symbol}</strong>
            ${blockchainBadge}
          </div>
        </td>
        <td class="${changeClass}">$${formatPrice(coin.price)}</td>
        <td class="${changeClass}" style="font-weight: bold;">${changeSign}${coin.change24h.toFixed(2)}%</td>
        <td class="${changeClass}">${formatVolume(coin.volume)}</td>
      </tr>
    `;
  }).join('');
  
  // Attach event listeners to clickable rows
  attachCoinTableListeners();
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Attach click listeners to coin table rows
function attachCoinTableListeners() {
  const rows = document.querySelectorAll('.clickable-row');
  rows.forEach(row => {
    row.removeEventListener('click', handleCoinRowClick);
    row.addEventListener('click', handleCoinRowClick);
  });
}

// Handle coin table row clicks
function handleCoinRowClick(event) {
  const row = event.currentTarget;
  const symbol = row.getAttribute('data-symbol');
  const name = row.getAttribute('data-name');
  
  if (symbol && name && typeof analysisModalController !== 'undefined') {
    analysisModalController.openAnalysisModal({ symbol, name });
  } else {
    console.warn('❌ Unable to open analysis: missing data or analysisModalController not ready');
  }
}

// Get blockchain badge
function getBlockchainBadge(blockchain) {
  const badges = {
    'solana': '<span class="blockchain-badge sol">SOL</span>',
    'ethereum': '<span class="blockchain-badge eth">ETH</span>',
    'polygon': '<span class="blockchain-badge poly">POLY</span>',
    'bsc': '<span class="blockchain-badge bsc">BSC</span>',
    'multi': '<span class="blockchain-badge multi">Multi</span>'
  };
  return badges[blockchain.toLowerCase()] || badges['multi'];
}

// Format price with appropriate decimals
function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

// Format volume (simplified)
function formatVolume(volume) {
  if (volume >= 1e9) return '$' + (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return '$' + (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return '$' + (volume / 1e3).toFixed(2) + 'K';
  return '$' + volume.toFixed(2);
}

// V2 Feature Lock Modal
function showV2FeatureLock(featureName, description) {
  const overlay = document.createElement('div');
  overlay.className = 'v2-feature-lock-overlay';
  overlay.innerHTML = `
    <div class="v2-feature-lock-modal">
      <button class="cat-popup-close" onclick="closeV2FeatureLock()" aria-label="Close">×</button>
      <div class="v2-lock-icon">🔒</div>
      <h2>VERSION 2 FEATURE</h2>
      <h3>${featureName}</h3>
      <p class="v2-lock-description">${description}</p>
      
      <div class="v2-lock-features">
        <div class="v2-lock-feature-item">
          <span class="v2-feature-icon">🎪</span>
          <span>Filter by Memes, DeFi, Blue Chips</span>
        </div>
        <div class="v2-lock-feature-item">
          <span class="v2-feature-icon">📈</span>
          <span>Top Gainers & Losers tracking</span>
        </div>
        <div class="v2-lock-feature-item">
          <span class="v2-feature-icon">🌐</span>
          <span>Multi-blockchain support (Solana, Ethereum, Polygon, BSC)</span>
        </div>
        <div class="v2-lock-feature-item">
          <span class="v2-feature-icon">🚀</span>
          <span>One-click buy links for every token</span>
        </div>
      </div>
      
      <div class="v2-lock-launch">
        <p class="v2-lock-date">🎄 LAUNCHING DECEMBER 25TH, 2025 🎄</p>
        <p class="v2-lock-upgrade-text">Subscribe now to unlock V2 features on launch day!</p>
      </div>
      
      <button class="v2-lock-upgrade-btn" onclick="switchTab('settings')">
        UPGRADE FOR V2 ACCESS →
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = '1', 10);
}

function closeV2FeatureLock() {
  const modal = document.querySelector('.v2-feature-lock-overlay');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 200);
  }
}

// Copy Contract Address
function copyCoinCA(evt, address) {
  navigator.clipboard.writeText(address).then(() => {
    const btn = evt.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    btn.style.background = 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy address. Please copy manually.');
  });
}

// Load project coins when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProjectCoins);
} else {
  loadProjectCoins();
}

// ========================================
// PORTFOLIO TAB FUNCTIONALITY
// ========================================

// Portfolio State
let currentWalletAddress = null;
let portfolioData = null;

// Check subscription access for Portfolio tab
function checkPortfolioAccess() {
  const portfolioGate = document.getElementById('portfolioGate');
  const portfolioContent = document.getElementById('portfolioContent');
  
  // Check if user is subscribed (BASE or TOP tier)
  const userTier = localStorage.getItem('userTier') || 'trial';
  
  if (userTier === 'trial') {
    // Show gate, hide content
    portfolioGate.style.display = 'flex';
    portfolioContent.style.display = 'none';
  } else {
    // Hide gate, show content
    portfolioGate.style.display = 'none';
    portfolioContent.style.display = 'block';
    
    // Load saved wallet if exists
    loadSavedWallet();
  }
}

// Check subscription access for Educational tab (Knowledge Base + Glossary)
function checkEducationalAccess() {
  const educationalGate = document.getElementById('educationalGate');
  const educationalContent = document.getElementById('educationalContent');
  
  // Check if user is subscribed (BASE or TOP tier) OR whitelisted
  const userTier = localStorage.getItem('userTier') || 'trial';
  const dwpUser = JSON.parse(localStorage.getItem('dwp_user') || '{}');
  const isWhitelisted = dwpUser.isWhitelisted || false;
  
  if (userTier === 'trial' && !isWhitelisted) {
    // Free trial - show gate, hide content
    educationalGate.style.display = 'flex';
    educationalContent.style.display = 'none';
  } else {
    // Subscribed OR whitelisted - hide gate, show content
    educationalGate.style.display = 'none';
    educationalContent.style.display = 'block';
  }
}

// Load saved wallet from localStorage
function loadSavedWallet() {
  const savedAddress = localStorage.getItem('walletAddress');
  if (savedAddress) {
    currentWalletAddress = savedAddress;
    showConnectedState(savedAddress);
    loadPortfolio(savedAddress);
  }
}

// Connect Phantom Wallet
async function connectPhantomWallet() {
  try {
    // Check if Phantom is installed
    if (!window.solana || !window.solana.isPhantom) {
      alert('Phantom wallet not found! Please install Phantom browser extension or use manual address input.');
      return;
    }
    
    // Connect to Phantom
    const resp = await window.solana.connect();
    const walletAddress = resp.publicKey.toString();
    
    // Save wallet
    currentWalletAddress = walletAddress;
    localStorage.setItem('walletAddress', walletAddress);
    
    // Update UI
    showConnectedState(walletAddress);
    
    // Load portfolio
    await loadPortfolio(walletAddress);
    
  } catch (error) {
    console.error('Phantom connection error:', error);
    alert('Failed to connect Phantom wallet. Please try again.');
  }
}

// Track manual address
async function trackManualAddress() {
  const input = document.getElementById('manualWalletAddress');
  const address = input.value.trim();
  
  if (!address) {
    alert('Please enter a valid Solana address');
    return;
  }
  
  // Basic validation (Solana addresses are typically 32-44 chars)
  if (address.length < 32 || address.length > 44) {
    alert('Invalid Solana address format');
    return;
  }
  
  // Save wallet
  currentWalletAddress = address;
  localStorage.setItem('walletAddress', address);
  
  // Update UI
  showConnectedState(address);
  
  // Load portfolio
  await loadPortfolio(address);
}

// Disconnect wallet
function disconnectWallet() {
  currentWalletAddress = null;
  portfolioData = null;
  localStorage.removeItem('walletAddress');
  
  // Reset UI
  document.getElementById('walletDisconnected').style.display = 'block';
  document.getElementById('walletConnected').style.display = 'none';
  document.getElementById('portfolioStats').style.display = 'none';
  document.getElementById('holdingsSection').style.display = 'none';
  document.getElementById('darkwaveSection').style.display = 'none';
  
  // Clear manual input
  document.getElementById('manualWalletAddress').value = '';
}

// Show connected state
function showConnectedState(address) {
  // Truncate address for display (ABC1...XYZ9)
  const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;
  
  document.getElementById('walletDisconnected').style.display = 'none';
  document.getElementById('walletConnected').style.display = 'block';
  document.getElementById('connectedAddress').textContent = truncated;
}

// Load portfolio holdings
async function loadPortfolio(walletAddress) {
  try {
    // Show loading state
    const tbody = document.getElementById('holdingsTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row">Loading portfolio...</td></tr>';
    
    // For V1, we'll use demo data
    // In V2, this will query real Solana blockchain
    const demoPortfolio = await getDemoPortfolioData();
    
    // Update portfolio data
    portfolioData = demoPortfolio;
    
    // Display stats
    displayPortfolioStats(demoPortfolio);
    
    // Display holdings table
    displayHoldingsTable(demoPortfolio.tokens);
    
    // Check for DarkWave tokens
    const dwavToken = demoPortfolio.tokens.find(t => t.symbol === 'DWAV');
    if (dwavToken) {
      displayDarkWaveSection(dwavToken);
    }
    
  } catch (error) {
    console.error('Portfolio loading error:', error);
    const tbody = document.getElementById('holdingsTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row" style="color: var(--red);">Failed to load portfolio. Please try again.</td></tr>';
  }
}

// Get demo portfolio data (V1 placeholder)
async function getDemoPortfolioData() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    totalValue: 12450.32,
    change24h: 5.2,
    changeValue: 542.18,
    totalTokens: 4,
    tokens: [
      {
        symbol: 'DWAV',
        name: 'DarkWave Coin',
        balance: 250000,
        price: 0.005,
        value: 1250.00,
        change24h: 12.5,
        logo: '/darkwave-coin.png'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: 45,
        price: 140.00,
        value: 6300.00,
        change24h: 2.1,
        logo: 'https://cryptologos.cc/logos/solana-sol-logo.png'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 5000,
        price: 1.00,
        value: 5000.00,
        change24h: 0.01,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      },
      {
        symbol: 'BONK',
        name: 'Bonk',
        balance: 1200000,
        price: 0.00002,
        value: 24.00,
        change24h: -5.3,
        logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
      }
    ]
  };
}

// Display portfolio stats
function displayPortfolioStats(portfolio) {
  document.getElementById('portfolioStats').style.display = 'block';
  
  // Total value
  document.getElementById('totalValue').textContent = `$${portfolio.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  // 24h change
  const changeEl = document.getElementById('totalChange');
  const changeSign = portfolio.change24h >= 0 ? '+' : '';
  changeEl.textContent = `${changeSign}$${portfolio.changeValue.toFixed(2)} (${changeSign}${portfolio.change24h.toFixed(2)}%)`;
  changeEl.className = portfolio.change24h >= 0 ? 'stat-change positive' : 'stat-change negative';
  
  // 24h change percentage only
  const change24hEl = document.getElementById('change24h');
  change24hEl.textContent = `${changeSign}${portfolio.change24h.toFixed(2)}%`;
  change24hEl.className = portfolio.change24h >= 0 ? 'stat-value positive' : 'stat-value negative';
  
  // Total tokens
  document.getElementById('totalTokens').textContent = portfolio.totalTokens;
}

// Display holdings table
function displayHoldingsTable(tokens) {
  document.getElementById('holdingsSection').style.display = 'block';
  
  const tbody = document.getElementById('holdingsTableBody');
  tbody.innerHTML = '';
  
  tokens.forEach(token => {
    const row = document.createElement('tr');
    
    // Add special class for DarkWave
    if (token.symbol === 'DWAV') {
      row.classList.add('darkwave-row');
    }
    
    const changeClass = token.change24h >= 0 ? 'positive' : 'negative';
    const changeSign = token.change24h >= 0 ? '+' : '';
    
    row.innerHTML = `
      <td>
        <div class="token-info">
          <img src="${token.logo}" alt="${token.symbol}" class="token-logo" onerror="this.style.display='none'" />
          <div>
            <div style="font-weight: 700;">${token.symbol}</div>
            <div style="font-size: 11px; color: var(--text-dim);">${token.name}</div>
          </div>
        </div>
      </td>
      <td>${token.balance.toLocaleString('en-US')}</td>
      <td>$${token.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 6})}</td>
      <td>$${token.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td class="${changeClass}">${changeSign}${token.change24h.toFixed(2)}%</td>
    `;
    
    // Make row clickable to show token details (future feature)
    row.onclick = () => {
      if (token.symbol !== 'DWAV') {
        showComingSoon(`${token.name} detailed analysis`);
      }
    };
    
    tbody.appendChild(row);
  });
}

// Display DarkWave special section
function displayDarkWaveSection(dwavToken) {
  document.getElementById('darkwaveSection').style.display = 'block';
  
  // Update balance
  document.getElementById('dwavBalance').textContent = `${dwavToken.balance.toLocaleString('en-US')} DWAV`;
  document.getElementById('dwavValue').textContent = `$${dwavToken.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  // Show airdrop banner if eligible (100k+ tokens)
  const airdropBanner = document.getElementById('airdropBanner');
  if (dwavToken.balance >= 100000) {
    airdropBanner.style.display = 'block';
  } else {
    airdropBanner.style.display = 'none';
  }
}

// Show coming soon modal for V2 features
function showComingSoon(featureName) {
  alert(`${featureName} is coming in Version 2!\n\nThis feature will be available after the DarkWave Coin launch on December 25th, 2025.`);
}

// Initialize Portfolio and Educational tabs when switching to them
// NOTE: This wrapper extends switchTab with additional tab-specific logic
// It's called AFTER the main switchTab function is defined
(function() {
  // Wait for DOM to be ready to ensure switchTab is defined
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSwitchTabWrapper);
  } else {
    setupSwitchTabWrapper();
  }
  
  function setupSwitchTabWrapper() {
    // Only wrap if switchTab exists and isn't already wrapped
    if (typeof switchTab !== 'function') {
      console.warn('switchTab not found, wrapper not applied');
      return;
    }
    
    const originalSwitchTab = switchTab;
    
    window.switchTab = function(tabId) {
      // Call original switchTab
      originalSwitchTab(tabId);
      
      // Check portfolio access when switching to portfolio tab
      if (tabId === 'portfolio') {
        if (typeof checkPortfolioAccess === 'function') {
          checkPortfolioAccess();
        }
      }
      
      // Check educational access when switching to glossary/guide tab
      if (tabId === 'glossary') {
        if (typeof checkEducationalAccess === 'function') {
          checkEducationalAccess();
        }
      }
      
      // Initialize comments when switching to projects tab
      if (tabId === 'projects') {
        if (typeof initializeCommentSection === 'function') {
          initializeCommentSection();
        }
      }
    };
    
    console.log('✅ switchTab wrapper applied');
  }
})();

// Initialize comment section based on subscription status
function initializeCommentSection() {
  const access = typeof getUserAccessLevel === 'function' ? getUserAccessLevel() : { isPaid: false };
  const commentGate = document.getElementById('commentSubscriptionGate');
  const commentForm = document.getElementById('commentForm');
  
  if (access.isPaid) {
    // Show comment form for subscribers
    commentGate.style.display = 'none';
    commentForm.style.display = 'block';
    
    // Setup character counter
    const textarea = document.getElementById('commentTextarea');
    const counter = document.getElementById('commentCharCounter');
    
    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length}/500`;
    });
    
    // Load comments
    loadProjectComments();
  } else {
    // Show subscription gate for trial users
    commentGate.style.display = 'block';
    commentForm.style.display = 'none';
  }
}

// Load comments for general suggestions (project ID 0 = general platform suggestions)
async function loadProjectComments(projectId = 0) {
  try {
    const response = await fetch(`/api/projects/${projectId}/comments`);
    const data = await response.json();
    
    const commentsList = document.getElementById('commentsList');
    
    if (!data.comments || data.comments.length === 0) {
      commentsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px; font-size: 12px;">No comments yet. Be the first to share your suggestions!</p>';
      return;
    }
    
    commentsList.innerHTML = data.comments.map(comment => {
      const date = new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const authorClass = comment.is_whitelisted ? 'whitelisted' : (comment.subscription_tier !== 'trial' ? 'subscriber' : '');
      const authorLabel = comment.is_whitelisted ? ' 🌟' : (comment.subscription_tier === 'top' ? ' 💎' : (comment.subscription_tier === 'base' ? ' ⭐' : ''));
      
      return `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author ${authorClass}">${comment.email ? comment.email.split('@')[0] : 'User'}${authorLabel}</span>
            <span class="comment-date">${date}</span>
          </div>
          <div class="comment-text">${escapeHtml(comment.comment_text)}</div>
        </div>
      `;
    }).join('');
    
    console.log(`✅ Loaded ${data.comments.length} comments`);
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

// Submit a new comment
async function submitComment() {
  const textarea = document.getElementById('commentTextarea');
  const submitBtn = document.getElementById('submitCommentBtn');
  const commentText = textarea.value.trim();
  
  if (!commentText) {
    alert('Please enter a comment');
    return;
  }
  
  if (commentText.length > 500) {
    alert('Comment must be 500 characters or less');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Posting...';
  
  try {
    const response = await fetch('/api/projects/0/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ commentText })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('✅ Comment submitted for review! It will appear after approval.');
      textarea.value = '';
      document.getElementById('commentCharCounter').textContent = '0/500';
    } else {
      if (response.status === 401 || response.status === 403) {
        alert('⚠️ Subscription required to comment. Please upgrade to BASE or TOP tier.');
      } else if (response.status === 429) {
        alert('⚠️ ' + data.error);
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to submit comment'));
      }
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('❌ Failed to submit comment. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post Comment';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Logout functionality
async function handleLogout() {
  const confirmLogout = confirm('Are you sure you want to log out?');
  
  if (!confirmLogout) {
    return;
  }
  
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Clear local storage
      localStorage.removeItem('dwp_user');
      localStorage.removeItem('walletAddress');
      
      console.log('✅ Logged out successfully');
      
      // Redirect to login page
      window.location.href = '/';
    } else {
      console.error('Logout failed:', response.status);
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
}


// ============================================
// BUSINESS DOCUMENTS SYSTEM (Admin Only)
// ============================================

// Document content mapping
const businessDocuments = {
  'time-sensitive': {
    title: '⏰ TIME-SENSITIVE ITEMS (Week 1)',
    filename: 'TIME_SENSITIVE_ITEMS.md',
    url: '/business-docs/TIME_SENSITIVE_ITEMS.md'
  },
  'executive-summary': {
    title: 'Executive Summary',
    filename: 'DARKWAVE_EXECUTIVE_SUMMARY.md',
    url: '/business-docs/DARKWAVE_EXECUTIVE_SUMMARY.md'
  },
  'business-plan': {
    title: 'Full Business Plan',
    filename: 'DARKWAVE_PULSE_BUSINESS_PLAN.md',
    url: '/business-docs/DARKWAVE_PULSE_BUSINESS_PLAN.md'
  },
  'roadmap': {
    title: 'Complete Roadmap (2025-2028)',
    filename: 'DARKWAVE_COMPLETE_ROADMAP_2025-2028.md',
    url: '/business-docs/DARKWAVE_COMPLETE_ROADMAP_2025-2028.md'
  },
  'wallet-ecosystem': {
    title: 'Wallet Ecosystem Vision',
    filename: 'DARKWAVE_WALLET_ECOSYSTEM.md',
    url: '/business-docs/DARKWAVE_WALLET_ECOSYSTEM.md'
  },
  'bootstrap-plan': {
    title: 'Bootstrap Launch Plan',
    filename: 'BOOTSTRAP_LAUNCH_PLAN.md',
    url: '/business-docs/BOOTSTRAP_LAUNCH_PLAN.md'
  },
  'listing-guide': {
    title: 'Token Listing Guide',
    filename: 'TOKEN_LISTING_GUIDE.md',
    url: '/business-docs/TOKEN_LISTING_GUIDE.md'
  },
  'twitter-strategy': {
    title: 'Twitter Growth Strategy',
    filename: 'TWITTER_GROWTH_STRATEGY.md',
    url: '/business-docs/TWITTER_GROWTH_STRATEGY.md'
  },
  'livfi-tokenomics': {
    title: 'LIVFI Tokenomics',
    filename: 'LIVFI_TOKENOMICS.md',
    url: '/business-docs/LIVFI_TOKENOMICS.md'
  }
};

// Open business document in modal
async function openBusinessDoc(docId) {
  const doc = businessDocuments[docId];
  if (!doc) {
    alert('Document not found');
    return;
  }

  try {
    // Fetch the document
    const response = await fetch(doc.url);
    if (!response.ok) {
      throw new Error('Failed to load document');
    }
    const content = await response.text();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'businessDocModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 100000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      overflow: auto;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #0ea5e9;
        border-radius: 16px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 50px rgba(14, 165, 233, 0.5);
      ">
        <!-- Header -->
        <div style="
          padding: 20px;
          border-bottom: 1px solid rgba(14, 165, 233, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h2 style="margin: 0; color: #0ea5e9; font-size: 18px; font-weight: 700;">
            📄 ${doc.title}
          </h2>
          <button onclick="closeBusinessDocModal()" style="
            background: rgba(255, 59, 48, 0.2);
            border: 1px solid #ff3b30;
            color: #ff3b30;
            font-size: 24px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
          ">×</button>
        </div>

        <!-- Content -->
        <div style="
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #0a0a0a;
        ">
          <pre style="
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.6;
            color: #e0e0e0;
            margin: 0;
          ">${content}</pre>
        </div>

        <!-- Footer - Download Button -->
        <div style="
          padding: 20px;
          border-top: 1px solid rgba(14, 165, 233, 0.3);
          display: flex;
          gap: 10px;
        ">
          <button onclick="downloadBusinessDoc('${docId}')" style="
            flex: 1;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            color: white;
            padding: 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            <span style="font-size: 18px;">📥</span>
            DOWNLOAD AS .TXT FILE
          </button>
          <button onclick="copyBusinessDoc('${docId}')" style="
            flex: 1;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border: none;
            color: white;
            padding: 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-center;
            gap: 8px;
          ">
            <span style="font-size: 18px;">📋</span>
            COPY TO CLIPBOARD
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Store content for download/copy
    modal.dataset.content = content;
    modal.dataset.filename = doc.filename;

  } catch (error) {
    console.error('Error loading document:', error);
    alert('Failed to load document. Please try again.');
  }
}

// Close business document modal
function closeBusinessDocModal() {
  const modal = document.getElementById('businessDocModal');
  if (modal) {
    modal.remove();
  }
}

// Open whitepaper hub in new tab
function openWhitepaperHub() {
  window.open('/whitepaper-hub.html', '_blank');
}

// Download business document
function downloadBusinessDoc(docId) {
  const modal = document.getElementById('businessDocModal');
  if (!modal) return;

  const content = modal.dataset.content;
  const filename = modal.dataset.filename;

  // Create blob and download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.md', '.txt'); // Save as .txt for universal compatibility
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  // Show success message
  alert(`✅ Downloaded: ${filename}\n\nYou can now text/email this file to anyone!`);
}

// Copy business document to clipboard
async function copyBusinessDoc(docId) {
  const modal = document.getElementById('businessDocModal');
  if (!modal) return;

  const content = modal.dataset.content;

  try {
    await navigator.clipboard.writeText(content);
    alert('✅ Copied to clipboard!\n\nYou can now paste this into an email, text message, or document.');
  } catch (error) {
    console.error('Failed to copy:', error);
    alert('Failed to copy to clipboard. Please try downloading instead.');
  }
}

// Admin Checklist Progress Management
function saveChecklistProgress() {
  const checkboxes = ['check_stripe', 'check_domain', 'check_testing', 'check_twilio'];
  const progress = {};
  
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      progress[id] = checkbox.checked;
    }
  });
  
  localStorage.setItem('adminChecklistProgress', JSON.stringify(progress));
  updateChecklistProgress();
  console.log('✅ Checklist progress saved');
}

function loadChecklistProgress() {
  const saved = localStorage.getItem('adminChecklistProgress');
  if (!saved) return;
  
  try {
    const progress = JSON.parse(saved);
    Object.keys(progress).forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = progress[id];
      }
    });
    updateChecklistProgress();
    console.log('✅ Checklist progress loaded');
  } catch (error) {
    console.error('Failed to load checklist progress:', error);
  }
}

function updateChecklistProgress() {
  const checkboxes = ['check_stripe', 'check_domain', 'check_testing', 'check_twilio'];
  const completed = checkboxes.filter(id => {
    const checkbox = document.getElementById(id);
    return checkbox && checkbox.checked;
  }).length;
  
  const progressText = document.getElementById('checklistProgress');
  if (progressText) {
    progressText.textContent = `${completed} of ${checkboxes.length} completed`;
    
    if (completed === checkboxes.length) {
      progressText.textContent += ' 🎉 WEEK 1 COMPLETE!';
      progressText.style.color = '#10b981';
      progressText.style.fontWeight = '700';
    }
  }
}

// Show business docs section when admin logs in
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is admin and show business docs section
  const checkAdminStatus = () => {
    const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
    const businessDocsSection = document.getElementById('businessDocsSection');
    
    if (businessDocsSection && session.isAdmin) {
      businessDocsSection.style.display = 'block';
      // Load checklist progress after showing dashboard
      setTimeout(loadChecklistProgress, 100);
    }
  };

  // Check on load
  checkAdminStatus();

  // Also check when admin logs in
  const originalAdminLogin = window.adminLogin;
  if (originalAdminLogin) {
    window.adminLogin = async function() {
      await originalAdminLogin.call(this);
      setTimeout(checkAdminStatus, 100); // Check after login completes
    };
  }
});

// ============================================================================
// ANALYSIS NOTEPAD FUNCTIONS (Premium Feature)
// ============================================================================

let currentNotepadSymbol = null;

// Verify premium access via server (cached for performance)
let premiumAccessCache = { valid: false, timestamp: 0 };
async function verifyPremiumAccess() {
  const now = Date.now();
  const cacheExpiry = 60000; // 1 minute cache
  
  // Return cached result if still valid
  if (premiumAccessCache.timestamp && (now - premiumAccessCache.timestamp) < cacheExpiry) {
    return premiumAccessCache.valid;
  }
  
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      premiumAccessCache = { valid: false, timestamp: now };
      return false;
    }
    
    const result = await response.json();
    const isPremium = result.valid && result.user && result.user.subscriptionTier === 'premium';
    
    premiumAccessCache = { valid: isPremium, timestamp: now };
    return isPremium;
  } catch (error) {
    console.error('Failed to verify premium access:', error);
    premiumAccessCache = { valid: false, timestamp: now };
    return false;
  }
}

// Toggle notepad expand/collapse
function toggleNotepad() {
  const content = document.getElementById('notepadContent');
  const icon = document.getElementById('notepadToggleIcon');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▲';
  } else {
    content.style.display = 'none';
    icon.textContent = '▼';
  }
}

// Initialize notepad for current asset (with server-side premium validation)
async function initNotepadForAsset(symbol) {
  currentNotepadSymbol = symbol;
  
  const notepadGate = document.getElementById('notepadGate');
  const notepadEditor = document.getElementById('notepadEditor');
  
  // Use cached premium verification (secure server-side check)
  const isPremium = await verifyPremiumAccess();
  
  if (isPremium) {
    // Show editor, hide gate
    notepadGate.style.display = 'none';
    notepadEditor.style.display = 'block';
    
    // Load existing notes for this asset
    loadNotesForAsset(symbol);
  } else {
    // Show gate, hide editor (default for non-premium or errors)
    notepadGate.style.display = 'block';
    notepadEditor.style.display = 'none';
  }
}

// Load notes from localStorage for specific asset
function loadNotesForAsset(symbol) {
  const textarea = document.getElementById('notepadTextarea');
  const storageKey = `analysis_notes_${symbol}`;
  
  const savedData = localStorage.getItem(storageKey);
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      textarea.value = data.notes || '';
      updateCharCount();
      updateTimestamp(data.timestamp);
    } catch (e) {
      textarea.value = '';
      updateCharCount();
      updateTimestamp(null);
    }
  } else {
    textarea.value = '';
    updateCharCount();
    updateTimestamp(null);
  }
}

// Auto-save notes as user types (premium users only)
async function autoSaveNotes() {
  if (!currentNotepadSymbol) return;
  
  // Verify premium access before saving
  const hasPremium = await verifyPremiumAccess();
  if (!hasPremium) {
    console.warn('Attempted to save notes without premium access');
    return;
  }
  
  const textarea = document.getElementById('notepadTextarea');
  let notes = textarea.value;
  
  // Enforce character limit
  const maxChars = 2000;
  if (notes.length > maxChars) {
    notes = notes.substring(0, maxChars);
    textarea.value = notes;
  }
  
  // Update character count
  updateCharCount();
  
  // Save to localStorage
  const storageKey = `analysis_notes_${currentNotepadSymbol}`;
  const timestamp = new Date().toISOString();
  
  localStorage.setItem(storageKey, JSON.stringify({
    notes: notes,
    timestamp: timestamp,
    symbol: currentNotepadSymbol
  }));
  
  // Update timestamp display
  updateTimestamp(timestamp);
}

// Update character counter
function updateCharCount() {
  const textarea = document.getElementById('notepadTextarea');
  const charCount = document.getElementById('notepadCharCount');
  const count = textarea.value.length;
  charCount.textContent = `${count}/2000`;
  
  // Color code if approaching limit
  if (count > 1900) {
    charCount.style.color = '#EA3943';
  } else if (count > 1700) {
    charCount.style.color = '#FFA500';
  } else {
    charCount.style.color = 'var(--text-dim)';
  }
}

// Update timestamp display
function updateTimestamp(timestamp) {
  const timestampEl = document.getElementById('notepadTimestamp');
  
  if (!timestamp) {
    timestampEl.textContent = 'Not saved';
    return;
  }
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    timestampEl.textContent = 'Saved just now';
  } else if (diffMins < 60) {
    timestampEl.textContent = `Saved ${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      timestampEl.textContent = `Saved ${diffHours}h ago`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      timestampEl.textContent = `Saved ${month}/${day}`;
    }
  }
}

// Export notes to clipboard (premium users only)
async function exportNotes() {
  // Verify premium access
  const hasPremium = await verifyPremiumAccess();
  if (!hasPremium) {
    alert('Premium subscription required to export notes');
    return;
  }
  
  const textarea = document.getElementById('notepadTextarea');
  const notes = textarea.value;
  
  if (!notes.trim()) {
    alert('No notes to export');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(notes);
    
    // Show success feedback
    const exportBtn = event.target;
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '✓ Copied!';
    exportBtn.style.background = '#16C784';
    
    setTimeout(() => {
      exportBtn.textContent = originalText;
      exportBtn.style.background = '';
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    textarea.select();
    document.execCommand('copy');
    alert('Notes copied to clipboard!');
  }
}

// Clear all notes with confirmation (premium users only)
async function clearNotes() {
  // Verify premium access
  const hasPremium = await verifyPremiumAccess();
  if (!hasPremium) {
    alert('Premium subscription required to manage notes');
    return;
  }
  
  const textarea = document.getElementById('notepadTextarea');
  
  if (!textarea.value.trim()) {
    return;
  }
  
  const confirmed = confirm(`Delete all notes for ${currentNotepadSymbol}?\n\nThis action cannot be undone.`);
  
  if (confirmed) {
    textarea.value = '';
    updateCharCount();
    
    // Remove from localStorage
    const storageKey = `analysis_notes_${currentNotepadSymbol}`;
    localStorage.removeItem(storageKey);
    
    updateTimestamp(null);
  }
}

// Make functions globally accessible
window.toggleNotepad = toggleNotepad;
window.initNotepadForAsset = initNotepadForAsset;
window.autoSaveNotes = autoSaveNotes;
window.exportNotes = exportNotes;
window.clearNotes = clearNotes;

// V2 Modal & Feature Functions
window.openV2FeaturesModal = openV2FeaturesModal;
window.closeV2FeaturesModal = closeV2FeaturesModal;
window.openFeatureDetail = openFeatureDetail;
window.closeFeatureDetail = closeFeatureDetail;
window.submitV2Waitlist = submitV2Waitlist;

// Chart Controls
window.toggleChart = toggleChart;
window.toggleChartDataType = toggleChartDataType;
window.toggleChartMode = toggleChartMode;
window.updateMainChart = updateMainChart;

// Category Filter Functions
window.filterCoinCategory = filterCoinCategory;
window.refreshCurrentCategory = refreshCurrentCategory;

// Utility Functions
window.clearInput = clearInput;
window.clearSelect = clearSelect;
window.showCycleIndicatorPopup = showCycleIndicatorPopup;

// Gauge Popup Functions
window.showMetricExplanation = showMetricExplanation;
window.showGaugePopup = showGaugePopup;
window.openGaugePopup = openGaugePopup;
window.closeGaugePopup = closeGaugePopup;
window.showVolumeFlowExplanation = showVolumeFlowExplanation;

// ========================================
// LEGACY FOUNDER COUNTDOWN TIMER
// ========================================
function updateFounderCountdown() {
  const launchDate = new Date('2025-12-25T00:00:00');
  const now = new Date();
  const diff = launchDate - now;
  
  if (diff <= 0) {
    const countdownEl = document.getElementById('founderCountdown');
    if (countdownEl) {
      countdownEl.textContent = 'CLOSED';
      countdownEl.style.color = '#EF4444';
    }
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const countdownEl = document.getElementById('founderCountdown');
  if (countdownEl) {
    if (days > 0) {
      countdownEl.textContent = `${days} day${days === 1 ? '' : 's'}`;
    } else {
      countdownEl.textContent = `${hours} hour${hours === 1 ? '' : 's'}`;
    }
  }
}

// Update countdown every minute
setInterval(updateFounderCountdown, 60000);
updateFounderCountdown(); // Run immediately on load

// ========================================
// GIFT SUBSCRIPTION SYSTEM
// ========================================
function openGiftModal() {
  const modal = document.getElementById('giftModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
}

function closeGiftModal() {
  const modal = document.getElementById('giftModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

async function handleGiftPurchase(event) {
  event.preventDefault();
  
  const giverName = document.getElementById('giftGiverName').value;
  const recipientName = document.getElementById('giftRecipientName').value;
  const recipientEmail = document.getElementById('giftRecipientEmail').value;
  const giftMessage = document.getElementById('giftMessage').value || `Happy Holidays! I hope you enjoy DarkWave Pulse. - ${giverName}`;
  
  console.log('🎁 Processing gift subscription...', {
    from: giverName,
    to: recipientName,
    email: recipientEmail
  });
  
  try {
    // Create Stripe checkout session for gift
    const response = await fetch('/api/payments/stripe/create-gift-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        giverName,
        recipientName,
        recipientEmail,
        giftMessage,
        priceId: 'beta_v1', // Will use BETA_V1_PRICE_ID from backend
        amount: 2400 // $24.00 in cents
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create gift checkout session');
    }
    
    const data = await response.json();
    
    if (data.url) {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } else if (data.error) {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Gift purchase error:', error);
    alert('There was an error processing your gift. Please try again or contact support.');
  }
}

// Export gift functions to global scope
window.openGiftModal = openGiftModal;
window.closeGiftModal = closeGiftModal;
window.handleGiftPurchase = handleGiftPurchase;

// ========================================
// BUG REPORT SYSTEM
// ========================================
function openBugReportModal() {
  const modal = document.getElementById('bugReportModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeBugReportModal() {
  const modal = document.getElementById('bugReportModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset form
    document.getElementById('bugReportForm').reset();
  }
}

async function handleBugReport(event) {
  event.preventDefault();
  
  const title = document.getElementById('bugTitle').value;
  const description = document.getElementById('bugDescription').value;
  const reporterEmail = document.getElementById('bugReporterEmail').value;
  const screenshotFile = document.getElementById('bugScreenshot').files[0];
  
  console.log('🐛 Opening email client for bug report...', { title, hasScreenshot: !!screenshotFile });
  
  // Get user session info for context
  const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
  const userEmail = session.user?.email || 'Not logged in';
  const userId = session.user?.id || 'N/A';
  
  // Prepare email body
  const emailBody = `
BUG REPORT: ${title}

DESCRIPTION:
${description}

---
Reporter Email: ${reporterEmail || 'Not provided'}
User Email: ${userEmail}
User ID: ${userId}
Current URL: ${window.location.href}
Browser: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

${screenshotFile ? '\n⚠️ Note: Screenshot selected but cannot be attached via mailto. Please attach it manually or paste into email.' : ''}
  `.trim();
  
  // Create mailto link
  const mailtoLink = `mailto:${encodeURIComponent('jason@darkwavepulse.com')}?subject=${encodeURIComponent('🐛 Bug Report: ' + title)}&body=${encodeURIComponent(emailBody)}`;
  
  // Open user's email client
  window.location.href = mailtoLink;
  
  // Show success message and close modal after a short delay
  setTimeout(() => {
    alert('✅ Your email client should open. Please send the email to submit your bug report. Thank you!');
    closeBugReportModal();
  }, 500);
}

// Export bug report functions to global scope
window.openBugReportModal = openBugReportModal;
window.closeBugReportModal = closeBugReportModal;
window.handleBugReport = handleBugReport;

// ===============================================
// ONBOARDING MODAL SYSTEM
// ===============================================

let currentOnboardingSlide = 0;

function showOnboardingModal() {
  const modal = document.getElementById('onboardingModal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  currentOnboardingSlide = 0;
  updateOnboardingSlide();
  console.log('🚀 Onboarding modal opened');
}

function closeOnboarding() {
  const dontShowAgain = document.getElementById('dontShowOnboardingAgain');
  if (dontShowAgain && dontShowAgain.checked) {
    localStorage.setItem('onboardingCompleted', 'true');
    console.log('✅ Onboarding marked as completed - won\'t show again');
  }
  
  document.getElementById('onboardingModal').style.display = 'none';
  console.log('👋 Onboarding modal closed');
}

function skipOnboarding() {
  localStorage.setItem('onboardingCompleted', 'true');
  document.getElementById('onboardingModal').style.display = 'none';
  console.log('⏭️ Onboarding skipped by user');
}

function nextOnboardingSlide() {
  if (currentOnboardingSlide < 5) {
    currentOnboardingSlide++;
    updateOnboardingSlide();
  }
}

function prevOnboardingSlide() {
  if (currentOnboardingSlide > 0) {
    currentOnboardingSlide--;
    updateOnboardingSlide();
  }
}

function updateOnboardingSlide() {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.onboarding-dot');
  
  slides.forEach((slide, index) => {
    slide.style.display = index === currentOnboardingSlide ? 'block' : 'none';
  });
  
  dots.forEach((dot, index) => {
    if (index === currentOnboardingSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
  
  console.log(`📄 Onboarding slide ${currentOnboardingSlide + 1}/6 displayed`);
}

function checkAndShowOnboarding() {
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
  
  if (!onboardingCompleted && session.user) {
    setTimeout(() => {
      showOnboardingModal();
    }, 1500);
  }
}

// Join Our Socials Popup Functions
function showSocialsPopup() {
  const popup = document.getElementById('socialsPopup');
  const catImg = document.getElementById('socialsPopupCatImg');
  
  // Sync cat persona if available
  const mainCatImg = document.getElementById('catImage');
  if (mainCatImg) {
    catImg.src = mainCatImg.src;
  }
  
  if (popup) {
    popup.style.display = 'flex';
    console.log('📱 Join Our Socials popup opened');
    
    // Initialize features
    updateV2Countdown();
    loadUserReferralCode();
  }
}

function updateV2Countdown() {
  // Founders Launch - static display, no countdown needed
  // This function now just updates checklist progress
  updateV2ChecklistProgress();
}

function updateV2ChecklistProgress() {
  const allChecks = document.querySelectorAll('.v2-check');
  const checkedCount = document.querySelectorAll('.v2-check:checked').length;
  const totalCount = allChecks.length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  
  const progressFill = document.getElementById('v2ProgressFill');
  const progressText = document.getElementById('v2ProgressText');
  
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  if (progressText) {
    progressText.textContent = `${checkedCount} of ${totalCount} tasks complete (${percentage}%)`;
  }
  
  const state = Array.from(allChecks)
    .filter(cb => cb.dataset.task)
    .map(cb => ({ task: cb.dataset.task, checked: cb.checked }));
  
  if (state.length > 0) {
    localStorage.setItem('v2ChecklistState', JSON.stringify(state));
  }
}

function loadV2ChecklistState() {
  const saved = localStorage.getItem('v2ChecklistState');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      state.forEach(item => {
        const checkbox = document.querySelector(`.v2-check[data-task="${item.task}"]`);
        if (checkbox) {
          checkbox.checked = item.checked;
        }
      });
    } catch (e) {
      console.warn('Failed to load V2 checklist state');
    }
  }
  updateV2ChecklistProgress();
}

function initV2Checklist() {
  const checkboxes = document.querySelectorAll('.v2-check');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', updateV2ChecklistProgress);
  });
  loadV2ChecklistState();
}

function closeSocialsPopup() {
  const popup = document.getElementById('socialsPopup');
  if (popup) {
    popup.style.display = 'none';
    localStorage.setItem('socialsPopupSeen', 'true');
    console.log('📱 Join Our Socials popup closed');
  }
}

function copySocialLink(url, button) {
  navigator.clipboard.writeText(url).then(() => {
    const originalText = button.textContent;
    button.textContent = '✓';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 1500);
    
    console.log('📋 Social link copied:', url);
  }).catch(err => {
    console.error('❌ Failed to copy:', err);
    alert('Failed to copy link. Try again or click to open directly.');
  });
}

function checkAndShowSocialsPopup() {
  const socialsPopupSeen = localStorage.getItem('socialsPopupSeen');
  const session = JSON.parse(localStorage.getItem('darkwaveSession') || '{}');
  
  if (!socialsPopupSeen && session.user) {
    setTimeout(() => {
      showSocialsPopup();
    }, 2500);
  }
}

// QR Code generation for social links
function toggleQRCode(platform) {
  const container = document.getElementById(`${platform}-qr`);
  const canvas = document.getElementById(`${platform}-qr-canvas`);
  
  if (container.style.display === 'none') {
    container.style.display = 'flex';
    
    // Generate QR code if not already generated
    if (canvas.width === 0) {
      const urls = {
        twitter: 'https://x.com/coin_solma41145',
        telegram: 'https://t.me/darkwavepulse',
        discord: 'https://discord.gg/darkwavepulse',
        website: 'https://darkwavepulse.com'
      };
      
      generateQRCode(urls[platform], canvas);
      console.log(`📱 Generated QR for ${platform}`);
    }
  } else {
    container.style.display = 'none';
  }
}

function generateQRCode(text, canvas) {
  if (typeof QRCode !== 'undefined') {
    new QRCode(canvas, {
      text: text,
      width: 140,
      height: 140,
      colorDark: '#FFFFFF',
      colorLight: '#1a1a1a',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

// Newsletter subscription
function subscribeNewsletter() {
  const emailInput = document.getElementById('newsletterEmail');
  const email = emailInput.value.trim();
  const msgDiv = document.getElementById('newsletterMsg');
  
  if (!email || !email.includes('@')) {
    msgDiv.textContent = '⚠️ Enter valid email';
    msgDiv.style.color = '#EF4444';
    return;
  }
  
  msgDiv.textContent = '⏳ Subscribing...';
  msgDiv.style.color = '#FFD700';
  
  fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include'
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      msgDiv.textContent = '✅ Subscribed! Check your email';
      msgDiv.style.color = '#10B981';
      emailInput.value = '';
      setTimeout(() => {
        msgDiv.textContent = '';
      }, 3000);
    } else {
      msgDiv.textContent = `❌ ${data.error || 'Failed'}`;
      msgDiv.style.color = '#EF4444';
    }
  })
  .catch(err => {
    msgDiv.textContent = '❌ Error';
    msgDiv.style.color = '#EF4444';
    console.error('Newsletter error:', err);
  });
}

// Referral code management
function loadUserReferralCode() {
  fetch('/api/referrals/my-code', {
    method: 'GET',
    credentials: 'include'
  })
  .then(r => r.json())
  .then(data => {
    const display = document.getElementById('referralCodeDisplay');
    if (display && data.code) {
      display.textContent = data.code;
      console.log('📌 Loaded referral code:', data.code);
    }
  })
  .catch(err => {
    console.error('Failed to load referral code:', err);
    const display = document.getElementById('referralCodeDisplay');
    if (display) {
      display.textContent = 'GEN...';
    }
  });
}

function copyReferralCode() {
  const codeDisplay = document.getElementById('referralCodeDisplay');
  const code = codeDisplay.textContent;
  
  if (code && code !== 'Loading...' && code !== 'GEN...') {
    const referralLink = `https://darkwavepulse.com?ref=${code}`;
    const text = `Join me on DarkWave Pulse! Use code ${code} for extra trial days. ${referralLink}`;
    
    navigator.clipboard.writeText(text).then(() => {
      const btn = event.target;
      const original = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('copied');
      
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1500);
      
      console.log('📋 Referral code copied:', code);
    }).catch(err => {
      alert('Failed to copy referral code');
      console.error(err);
    });
  }
}

// Floating AI Modal Functions
function openFloatingAI() {
  const modal = document.getElementById('floatingAIModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeFloatingAI() {
  const modal = document.getElementById('floatingAIModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('floatingAIModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeFloatingAI();
      }
    });
  }
});

// Community Chat Functions
let chatPollingInterval = null;

// Theme to color mapping for avatars
const themeColorMap = {
  'dark': '#60a5fa',      // Blue
  'light': '#fbbf24',     // Amber
  'jupiter': '#8b5cf6',   // Purple
  'pink-blossom': '#ec4899', // Pink
  'sunny-field': '#f59e0b', // Orange
  'space': '#06b6d4'      // Cyan
};

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function getThemeColor(theme) {
  return themeColorMap[theme] || '#60a5fa';
}

function loadChatMessages() {
  const chatMessagesDiv = document.getElementById('chatMessages');
  if (!chatMessagesDiv) return;
  
  fetch('/api/community-chat/messages?limit=50')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.messages) {
        chatMessagesDiv.innerHTML = '';
        
        if (data.messages.length === 0) {
          chatMessagesDiv.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No messages yet. Be the first to start the conversation!</div>';
          return;
        }
        
        data.messages.forEach(msg => {
          const initials = getInitials(msg.display_name);
          const themeColor = getThemeColor(msg.theme || 'dark');
          
          const msgEl = document.createElement('div');
          msgEl.style.cssText = 'background: rgba(56, 97, 251, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #10b981; display: flex; gap: 10px; align-items: flex-start;';
          
          const timeString = new Date(msg.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
          
          // Asset holder badge
          const assetBadge = msg.isAssetHolder ? 
            `<span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34, 197, 94, 0.2); border: 1px solid #10b981; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.3px; margin-left: 6px;">✓ Holder</span>` 
            : '';
          
          msgEl.innerHTML = `
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${themeColor}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; position: relative;">
              ${initials}
              ${msg.isAssetHolder ? '<div style="position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: #10b981; border: 2px solid rgba(56, 97, 251, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: white;">✓</div>' : ''}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;">
                <strong style="color: ${themeColor};">${msg.display_name}</strong>
                ${assetBadge}
                <span style="font-size: 10px; color: #888;">${timeString}</span>
              </div>
              <span style="color: #ddd; word-break: break-word; font-size: 13px; line-height: 1.4;">${msg.message}</span>
            </div>
          `;
          chatMessagesDiv.appendChild(msgEl);
        });
        
        // Auto-scroll to bottom
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
      }
    })
    .catch(err => console.error('Error loading chat messages:', err));
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const statusDiv = document.getElementById('chatStatus');
  const message = input.value.trim();
  
  if (!message) {
    if (statusDiv) statusDiv.textContent = 'Message cannot be empty';
    return;
  }
  
  // Get user ID from session
  const userId = window.currentUser?.id || localStorage.getItem('userId');
  if (!userId) {
    if (statusDiv) statusDiv.textContent = 'Not authenticated. Please log in.';
    return;
  }
  
  if (statusDiv) statusDiv.textContent = 'Sending...';
  
  fetch('/api/community-chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'Cookie': document.cookie
    },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        input.value = '';
        if (statusDiv) statusDiv.textContent = '';
        loadChatMessages(); // Refresh messages
      } else {
        if (statusDiv) statusDiv.textContent = data.error || 'Failed to send message';
      }
    })
    .catch(err => {
      console.error('Error sending message:', err);
      if (statusDiv) statusDiv.textContent = 'Error sending message';
    });
}

// Username Management
function loadUsername() {
  const usernameInput = document.getElementById('usernameInput');
  if (!usernameInput) return;
  
  // Try to get from local storage or user object
  const savedUsername = window.currentUser?.displayName || localStorage.getItem('userDisplayName');
  if (savedUsername) {
    usernameInput.value = savedUsername;
  }
}

function saveUsername() {
  const usernameInput = document.getElementById('usernameInput');
  const displayName = usernameInput.value.trim();
  
  if (!displayName) {
    alert('Please enter a display name');
    return;
  }
  
  const userId = window.currentUser?.id || localStorage.getItem('userId');
  if (!userId) {
    alert('Not authenticated. Please log in.');
    return;
  }
  
  fetch('/api/user/update-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'Cookie': document.cookie
    },
    body: JSON.stringify({ displayName })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('userDisplayName', displayName);
        if (window.currentUser) {
          window.currentUser.displayName = displayName;
        }
        
        const btn = event.target;
        const original = btn.textContent;
        btn.textContent = '✓ Saved';
        setTimeout(() => {
          btn.textContent = original;
        }, 1500);
        
        loadChatMessages(); // Refresh chat to show new username
      } else {
        alert(data.error || 'Failed to save username');
      }
    })
    .catch(err => {
      console.error('Error saving username:', err);
      alert('Error saving username');
    });
}

// Start polling for new messages when community tab is active
document.addEventListener('DOMContentLoaded', () => {
  const communityTab = document.getElementById('community');
  if (communityTab) {
    const observer = new MutationObserver(() => {
      if (!communityTab.style.display || communityTab.style.display === 'block') {
        if (!chatPollingInterval) {
          loadChatMessages();
          chatPollingInterval = setInterval(loadChatMessages, 5000); // Poll every 5 seconds
        }
      } else {
        if (chatPollingInterval) {
          clearInterval(chatPollingInterval);
          chatPollingInterval = null;
        }
      }
    });
    
    observer.observe(communityTab, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
  }
  
  // Load username when settings tab is accessed
  const settingsTab = document.getElementById('settings');
  if (settingsTab) {
    const settingsObserver = new MutationObserver(() => {
      loadUsername();
    });
    settingsObserver.observe(settingsTab, { attributes: true, attributeFilter: ['style'] });
  }
});

window.showOnboardingModal = showOnboardingModal;
window.closeOnboarding = closeOnboarding;
window.skipOnboarding = skipOnboarding;
window.nextOnboardingSlide = nextOnboardingSlide;
window.prevOnboardingSlide = prevOnboardingSlide;
window.checkAndShowOnboarding = checkAndShowOnboarding;
window.openWhitepaperHub = openWhitepaperHub;
window.showSocialsPopup = showSocialsPopup;
window.closeSocialsPopup = closeSocialsPopup;
window.copySocialLink = copySocialLink;
window.checkAndShowSocialsPopup = checkAndShowSocialsPopup;
window.toggleQRCode = toggleQRCode;
window.generateQRCode = generateQRCode;
window.subscribeNewsletter = subscribeNewsletter;
window.loadUserReferralCode = loadUserReferralCode;
window.copyReferralCode = copyReferralCode;
window.updateV2Countdown = updateV2Countdown;
window.updateV2ChecklistProgress = updateV2ChecklistProgress;
window.initV2Checklist = initV2Checklist;
window.loadV2ChecklistState = loadV2ChecklistState;
window.openFloatingAI = openFloatingAI;
window.closeFloatingAI = closeFloatingAI;
window.loadChatMessages = loadChatMessages;
window.sendChatMessage = sendChatMessage;
window.saveUsername = saveUsername;
window.loadUsername = loadUsername;

// V2 Details Countdown Timer
function initV2Countdown() {
  const updateCountdown = () => {
    const now = new Date();
    const v2Launch = new Date('2025-12-25T00:00:00Z');
    const diff = v2Launch - now;
    
    if (diff <= 0) {
      document.getElementById('v2Countdown').textContent = '🎉 LIVE NOW!';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('v2Countdown').textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
    
    // Also update legacy founder countdown if visible
    if (document.getElementById('legacyDaysLeft')) {
      document.getElementById('legacyDaysLeft').textContent = `${days} days`;
    }
  };
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Start countdown when tab is opened
window.addEventListener('load', () => {
  initV2Countdown();
});

// Mobile Search Modal Functions
function openMobileSearchModal() {
  if (window.innerWidth <= 640) {
    document.getElementById('mobileSearchModal').style.display = 'flex';
    document.getElementById('mobileSearchInput').focus();
  }
}

function closeMobileSearchModal() {
  document.getElementById('mobileSearchModal').style.display = 'none';
}

function performMobileSearch() {
  const query = document.getElementById('mobileSearchInput').value;
  if (query.trim()) {
    document.getElementById('web3SearchInput').value = query;
    searchWeb3();
    closeMobileSearchModal();
  }
}

// Close modal when pressing Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('mobileSearchModal').style.display !== 'none') {
    closeMobileSearchModal();
  }
});
