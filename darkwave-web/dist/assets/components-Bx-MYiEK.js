import{r as n,j as e,W as Jt,P as Xt,w as Qt,Q as He,f as $a,g as xa,I as Pe,h as Zt}from"./ThemeContext-ZEHC_FNP.js";function ye({title:t,icon:a,children:i,isOpen:s,onToggle:o}){return e.jsxs("div",{className:`accordion-item ${s?"open":""}`,children:[e.jsxs("button",{className:"accordion-header",onClick:o,children:[e.jsxs("span",{className:"accordion-title",children:[a&&e.jsx("span",{children:a}),t]}),e.jsx("span",{className:"accordion-arrow",children:e.jsx("svg",{viewBox:"0 0 24 24",width:"14",height:"14",stroke:"currentColor",strokeWidth:"2",fill:"none",children:e.jsx("path",{d:"M6 9l6 6 6-6"})})})]}),e.jsx("div",{className:"accordion-content",children:e.jsx("div",{className:"accordion-body",children:i})})]})}function Oa({children:t,singleOpen:a=!0,defaultOpen:i=null}){const[s,o]=n.useState(i!==null?[i]:[]),p=Array.isArray(t)?t:[t],h=x=>{o(a?u=>u.includes(x)?[]:[x]:u=>u.includes(x)?u.filter(c=>c!==x):[...u,x])};return e.jsx("div",{className:"accordion",children:p.map((x,u)=>x.type===ye?e.jsx(ye,{...x.props,isOpen:s.includes(u),onToggle:()=>h(u)},u):x)})}const Je={Address:{category:"Crypto",smartass:"Your blockchain mailbox. If you lose it, you're emotionally homeless.",plain:"A unique string used to send or receive crypto assets, like a bank account number.",pose:"neutral"},Airdrop:{category:"Crypto",smartass:"Free tokens raining from the sky. Usually followed by disappointment.",plain:"Distribution of free tokens to promote a project or reward users.",pose:"sideeye"},Altcoin:{category:"Crypto",smartass:"Anything that's not Bitcoin. Some are brilliant. Most are memes.",plain:"Any cryptocurrency other than Bitcoin.",pose:"sideeye"},APR:{category:"Finance",smartass:"Annual Pain Rate. What you earn before compounding. Still not enough.",plain:"Annual interest rate earned on investments, excluding compounding.",pose:"neutral"},APY:{category:"Finance",smartass:"Annual Profit You'll never see. Includes compounding. Still disappointing.",plain:"Annual return on investment including compounding interest.",pose:"sideeye"},ATH:{category:"Crypto",smartass:"All-Time High. The moment you brag and forget to sell.",plain:"The highest price ever reached by an asset.",pose:"fist"},ATL:{category:"Crypto",smartass:"All-Time Low. The moment you disappear from Discord.",plain:"The lowest price ever reached by an asset.",pose:"facepalm"},"Bear Market":{category:"Finance",smartass:"Prices falling. Everyone's grumpy. Crypto Cat thrives here.",plain:"A market condition where asset prices decline over time.",pose:"walking"},Blockchain:{category:"Crypto",smartass:"A permanent receipt for everything. Like your browser history, but worse.",plain:"A decentralized, distributed digital ledger that records transactions.",pose:"neutral"},Bluechip:{category:"Crypto",smartass:"Crypto royalty. BTC, ETH, SOL. Emotionally stable-ish.",plain:"Established, high-value cryptocurrencies with strong reputations.",pose:"thumbsup"},"Bull Market":{category:"Finance",smartass:"Prices rising. Everyone's a genius. Until they're not.",plain:"A market condition where asset prices increase over time.",pose:"fist"},Burn:{category:"Crypto",smartass:"Token destruction ritual. Emotional cleansing for supply control.",plain:"The process of permanently removing tokens from circulation.",pose:"pointing"},DeFi:{category:"Crypto",smartass:"Finance without suits. Same greed, fewer middlemen.",plain:"Decentralized Finance - financial services built on blockchain technology.",pose:"neutral"},DEX:{category:"Crypto",smartass:"Decentralized exchange. Trade with strangers, trust the code.",plain:"A peer-to-peer exchange that doesn't require a central authority.",pose:"neutral"},"Diamond Hands":{category:"Crypto Slang",smartass:"Refusing to sell. Either brave or delusional. Time will tell.",plain:"Holding an asset through extreme volatility without selling.",pose:"fist"},DYOR:{category:"Crypto Slang",smartass:"Do Your Own Research. What people say before you lose money.",plain:"Advice to research before investing rather than following others.",pose:"pointing"},EMA:{category:"Technical Analysis",smartass:"Exponential Moving Average. The smooth talker of indicators.",plain:"A moving average that gives more weight to recent prices.",pose:"neutral"},"Fear & Greed Index":{category:"Crypto",smartass:"Emotional temperature of the market. Usually wrong at extremes.",plain:"An index measuring market sentiment from extreme fear to extreme greed.",pose:"sideeye"},FOMO:{category:"Crypto Slang",smartass:"Fear Of Missing Out. The reason you bought at the top.",plain:"Anxiety that others are making money while you're not participating.",pose:"facepalm"},FUD:{category:"Crypto Slang",smartass:"Fear, Uncertainty, Doubt. When Twitter becomes a horror show.",plain:"Negative information spread to cause panic selling.",pose:"sideeye"},Gas:{category:"Crypto",smartass:"Transaction fees. The blockchain's appetite for your money.",plain:"The fee required to execute transactions on a blockchain network.",pose:"pointing"},HODL:{category:"Crypto Slang",smartass:"Hold On for Dear Life. A typo that became a religion.",plain:"Long-term holding strategy regardless of market conditions.",pose:"fist"},Leverage:{category:"Finance",smartass:"Borrowed money to amplify gains. Or losses. Mostly losses.",plain:"Using borrowed capital to increase potential returns on investment.",pose:"pointing"},Liquidity:{category:"Finance",smartass:"How easily you can sell without crashing the price. Usually not enough.",plain:"The ease with which an asset can be bought or sold without affecting its price.",pose:"neutral"},MACD:{category:"Technical Analysis",smartass:"Moving Average Convergence Divergence. Sounds smart, often lies.",plain:"A momentum indicator showing relationship between two moving averages.",pose:"neutral"},"Market Cap":{category:"Crypto",smartass:"Total value if everyone could sell at once. Spoiler: they can't.",plain:"Total market value of a cryptocurrency (price x circulating supply).",pose:"neutral"},Moon:{category:"Crypto Slang",smartass:"Extreme price increase. Where all your coins are supposedly going.",plain:"Significant upward price movement in a cryptocurrency.",pose:"fist"},NFT:{category:"Crypto",smartass:"Non-Fungible Token. Digital receipts for JPEGs. Some worth millions.",plain:"Unique digital assets representing ownership of specific items.",pose:"neutral"},"Paper Hands":{category:"Crypto Slang",smartass:"Selling at the first sign of trouble. The opposite of diamond hands.",plain:"Selling assets quickly when prices drop due to fear.",pose:"facepalm"},"Pump and Dump":{category:"Crypto",smartass:"Artificially inflate, sell to idiots, disappear. Classic scam.",plain:"A scheme where the price is inflated before insiders sell their holdings.",pose:"pointing"},Resistance:{category:"Technical Analysis",smartass:"Price ceiling where sellers gather. Like a party, but sadder.",plain:"A price level where an asset tends to face selling pressure.",pose:"neutral"},RSI:{category:"Technical Analysis",smartass:"Relative Strength Index. 0-100 scale of market emotions.",plain:"A momentum oscillator measuring speed and change of price movements.",pose:"neutral"},"Rug Pull":{category:"Crypto",smartass:"Developers steal everything and vanish. Welcome to DeFi.",plain:"A scam where developers abandon a project and take investors' funds.",pose:"facepalm"},"Seed Phrase":{category:"Crypto",smartass:"12-24 magic words. Lose them and your crypto is gone forever.",plain:"A series of words that can be used to recover a cryptocurrency wallet.",pose:"pointing"},Slippage:{category:"Finance",smartass:"The difference between expected and actual price. Always worse.",plain:"The difference between expected and executed trade price.",pose:"sideeye"},"Smart Contract":{category:"Crypto",smartass:"Code that executes automatically. Until it gets hacked.",plain:"Self-executing contracts with terms written directly into code.",pose:"neutral"},Staking:{category:"Crypto",smartass:"Lock up tokens, earn rewards. Like a savings account, but riskier.",plain:"Locking cryptocurrency to support network operations and earn rewards.",pose:"thumbsup"},Support:{category:"Technical Analysis",smartass:"Price floor where buyers gather. Until it breaks.",plain:"A price level where an asset tends to find buying interest.",pose:"neutral"},Volatility:{category:"Finance",smartass:"Wild price swings. The reason crypto is exciting and terrifying.",plain:"The degree of price variation in an asset over time.",pose:"sideeye"},Volume:{category:"Finance",smartass:"How much is being traded. More volume = more conviction.",plain:"The total amount of an asset traded during a specific period.",pose:"neutral"},Wallet:{category:"Crypto",smartass:"Your digital vault. Cold or hot, just don't lose the keys.",plain:"Software or hardware used to store and manage cryptocurrency.",pose:"neutral"},Whale:{category:"Crypto",smartass:"Someone with enough crypto to move markets. Probably not you.",plain:"An individual or entity holding a large amount of cryptocurrency.",pose:"pointing"},"Yield Farming":{category:"DeFi",smartass:"Chasing the highest APY. Like musical chairs with your money.",plain:"Strategies to maximize returns by moving assets between DeFi protocols.",pose:"sideeye"}},Tn=["All","Crypto","Finance","DeFi","Technical Analysis","Crypto Slang"];function Ua(t){const a=Object.keys(Je).find(i=>i.toLowerCase()===t.toLowerCase());return a?{term:a,...Je[a]}:null}function An(t){if(!t)return Object.entries(Je).map(([i,s])=>({term:i,...s}));const a=t.toLowerCase();return Object.entries(Je).filter(([i,s])=>i.toLowerCase().includes(a)||s.plain.toLowerCase().includes(a)||s.smartass.toLowerCase().includes(a)).map(([i,s])=>({term:i,...s}))}const ea="pulse-sass-mode",ga=n.createContext(null);function zn({children:t}){const[a,i]=n.useState(null),[s,o]=n.useState({x:0,y:0}),[p,h]=n.useState(()=>localStorage.getItem(ea)!=="false"),[x,u]=n.useState([]),c=n.useCallback((F,m)=>{const v=Ua(F);if(!v)return;let f=0,D=0;if(m){const L=m.target.getBoundingClientRect();f=L.left+L.width/2,D=L.bottom+8,f>window.innerWidth-180&&(f=window.innerWidth-180),f<20&&(f=20),D>window.innerHeight-200&&(D=L.top-8)}o({x:f,y:D}),i(v)},[]),j=n.useCallback(()=>{i(null)},[]),g=n.useCallback(()=>{h(F=>{const m=!F;return localStorage.setItem(ea,String(m)),window.dispatchEvent(new CustomEvent("pulse-sass-mode-changed",{detail:m})),m})},[]),y=n.useCallback(F=>(u(m=>[...m,F]),()=>{u(m=>m.filter(v=>v!==F))}),[]);return n.useEffect(()=>{a&&x.forEach(F=>F(a))},[a,x]),e.jsx(ga.Provider,{value:{activeTerm:a,position:s,sassMode:p,showDefinition:c,hideDefinition:j,toggleSassMode:g,onTermShow:y},children:t})}function Bn(){const t=n.useContext(ga);if(!t)throw new Error("useGlossary must be used within a GlossaryProvider");return t}const S="v2",St=[{id:1,name:"Agent Marcus",gender:"male",race:"black",age:"young",hair:"fade",build:"athletic",image:`/agents/marcus_pixar-style_friendly_agent.png?${S}`},{id:2,name:"Agent Aria",gender:"female",race:"asian",age:"young",hair:"black-long",build:"petite",image:`/agents/aria_pixar-style_friendly_agent.png?${S}`},{id:3,name:"Agent Devon",gender:"male",race:"mixed",age:"young",hair:"brown",build:"athletic",image:`/agents/devon_pixar-style_friendly_agent.png?${S}`},{id:4,name:"Agent Claire",gender:"female",race:"white",age:"young",hair:"blonde",build:"athletic",image:`/agents/claire_pixar-style_friendly_agent.png?${S}`},{id:5,name:"Agent Gloria",gender:"female",race:"black",age:"senior",hair:"gray",build:"elegant",image:`/agents/african_american_female_agent.png?${S}`},{id:6,name:"Agent Raj",gender:"male",race:"indian",age:"young",hair:"black",build:"slim",image:`/agents/asian_male_agent_headshot.png?${S}`},{id:7,name:"Agent Layla",gender:"female",race:"middle-eastern",age:"middle",hair:"dark-wavy",build:"medium",image:`/agents/middle-aged_middle_eastern_woman.png?${S}`},{id:8,name:"Agent James",gender:"male",race:"white",age:"middle",hair:"brown-gray",build:"athletic",facial:"beard",image:`/agents/middle-aged_white_man_beard.png?${S}`},{id:9,name:"Agent Walter",gender:"male",race:"white",age:"senior",hair:"bald",build:"stocky",image:`/agents/african_american_bald_male.png?${S}`},{id:10,name:"Agent Ken",gender:"male",race:"asian",age:"young",hair:"undercut",build:"slim",image:`/agents/asian_male_agent_headshot.png?${S}`},{id:11,name:"Agent Sarah",gender:"female",race:"white",age:"young",hair:"blonde-ponytail",build:"tall-athletic",image:`/agents/caucasian_blonde_female.png?${S}`},{id:12,name:"Agent Darius",gender:"male",race:"black",age:"middle",hair:"bald",build:"muscular",facial:"goatee",image:`/agents/middle-aged_black_man_goatee_bald.png?${S}`},{id:13,name:"Agent Emma",gender:"female",race:"white",age:"young",hair:"red-pixie",build:"petite",image:`/agents/caucasian_red-haired_female.png?${S}`},{id:14,name:"Agent Carlos",gender:"male",race:"hispanic",age:"senior",hair:"gray",build:"medium",facial:"mustache",image:`/agents/latino_male_agent.png?${S}`},{id:15,name:"Agent Zara",gender:"female",race:"black",age:"young",hair:"natural-afro",build:"curvy",image:`/agents/african_american_female_agent.png?${S}`},{id:16,name:"Agent Priya",gender:"female",race:"indian",age:"young",hair:"brown-long",build:"curvy",image:`/agents/asian_female_agent.png?${S}`},{id:17,name:"Agent Richard",gender:"male",race:"white",age:"middle",hair:"gray",build:"heavyset",facial:"full-beard",image:`/agents/middle-aged_white_man_gray_beard_heavyset.png?${S}`},{id:18,name:"Agent Koa",gender:"male",race:"polynesian",age:"young",hair:"black-bun",build:"muscular",image:`/agents/mixed_black-latino_male.png?${S}`},{id:19,name:"Agent Yuki",gender:"female",race:"asian",age:"senior",hair:"white-updo",build:"slim-petite",image:`/agents/middle-aged_japanese_woman_bob_cut.png?${S}`},{id:20,name:"Agent Ryan",gender:"male",race:"white",age:"young",hair:"brown-wavy",build:"athletic",facial:"stubble",image:`/agents/caucasian_brown-haired_male.png?${S}`},{id:21,name:"Agent Kwame",gender:"male",race:"african",age:"young",hair:"black-designs",build:"tall-slim",image:`/agents/african_american_bald_male.png?${S}`},{id:22,name:"Agent Akiko",gender:"female",race:"japanese",age:"middle",hair:"black-bob",build:"slim",image:`/agents/middle-aged_japanese_woman_bob_cut.png?${S}`},{id:23,name:"Agent Blake",gender:"male",race:"white",age:"young",hair:"platinum-spiky",build:"medium",image:`/agents/caucasian_blonde_male_agent.png?${S}`},{id:24,name:"Agent Earl",gender:"male",race:"black",age:"senior",hair:"white",build:"medium",image:`/agents/african_american_bald_male.png?${S}`},{id:25,name:"Agent Luna",gender:"female",race:"hispanic",age:"young",hair:"dark-highlights",build:"petite-slim",image:`/agents/latina_female_agent.png?${S}`},{id:26,name:"Agent Sofia",gender:"female",race:"hispanic",age:"young",hair:"brown-curly",build:"curvy",image:`/agents/latina_female_agent.png?${S}`},{id:27,name:"Agent Mei",gender:"female",race:"asian",age:"young",hair:"black-long",build:"petite",image:`/agents/asian_female_agent.png?${S}`},{id:28,name:"Agent Tyler",gender:"male",race:"white",age:"young",hair:"brown",build:"athletic",image:`/agents/caucasian_brown-haired_male.png?${S}`},{id:29,name:"Agent Aisha",gender:"female",race:"black",age:"young",hair:"braids",build:"athletic",image:`/agents/african_american_female_agent.png?${S}`},{id:30,name:"Agent Nina",gender:"female",race:"mixed",age:"young",hair:"curly",build:"slim",image:`/agents/mixed_black-caucasian_female.png?${S}`},{id:31,name:"Agent Chen",gender:"male",race:"asian",age:"middle",hair:"black",build:"medium",image:`/agents/asian_male_agent_headshot.png?${S}`},{id:32,name:"Agent Rosa",gender:"female",race:"hispanic",age:"middle",hair:"dark",build:"medium",image:`/agents/latina_female_agent.png?${S}`},{id:33,name:"Agent Victor",gender:"male",race:"white",age:"senior",hair:"gray",build:"distinguished",image:`/agents/middle-aged_white_man_gray_beard_heavyset.png?${S}`},{id:34,name:"Agent Maya",gender:"female",race:"indian",age:"middle",hair:"dark-long",build:"elegant",image:`/agents/asian_female_agent.png?${S}`},{id:35,name:"Agent Dante",gender:"male",race:"hispanic",age:"young",hair:"dark",build:"muscular",image:`/agents/latino_male_agent.png?${S}`},{id:36,name:"Agent Mia",gender:"female",race:"mixed",age:"young",hair:"wavy",build:"athletic",image:`/agents/mixed_latina-asian_female.png?${S}`},{id:37,name:"Agent Oscar",gender:"male",race:"black",age:"young",hair:"locs",build:"athletic",image:`/agents/african_american_bald_male.png?${S}`},{id:38,name:"Agent Hannah",gender:"female",race:"white",age:"young",hair:"brown",build:"petite",image:`/agents/caucasian_brown-haired_female.png?${S}`},{id:39,name:"Agent Leo",gender:"male",race:"mixed",age:"young",hair:"curly",build:"slim",image:`/agents/mixed_black-caucasian_male.png?${S}`},{id:40,name:"Agent Fatima",gender:"female",race:"middle-eastern",age:"young",hair:"dark",build:"slim",image:`/agents/middle-aged_middle_eastern_woman.png?${S}`},{id:41,name:"Agent Jordan",gender:"male",race:"black",age:"middle",hair:"short",build:"athletic",image:`/agents/middle-aged_black_man_goatee_bald.png?${S}`},{id:42,name:"Agent Olivia",gender:"female",race:"white",age:"young",hair:"blonde",build:"tall",image:`/agents/caucasian_blonde_female.png?${S}`},{id:43,name:"Agent Sam",gender:"male",race:"asian",age:"young",hair:"styled",build:"slim",image:`/agents/asian_male_agent_headshot.png?${S}`},{id:44,name:"Agent Keisha",gender:"female",race:"black",age:"middle",hair:"natural",build:"curvy",image:`/agents/african_american_female_agent.png?${S}`},{id:45,name:"Agent Miguel",gender:"male",race:"hispanic",age:"middle",hair:"dark",build:"stocky",image:`/agents/latino_male_agent.png?${S}`},{id:46,name:"Agent Lily",gender:"female",race:"asian",age:"young",hair:"straight",build:"petite",image:`/agents/asian_female_agent.png?${S}`},{id:47,name:"Agent Nathan",gender:"male",race:"white",age:"young",hair:"red",build:"athletic",image:`/agents/caucasian_redhead_male_agent.png?${S}`},{id:48,name:"Agent Jade",gender:"female",race:"mixed",age:"young",hair:"dark",build:"athletic",image:`/agents/mixed_asian-caucasian_female.png?${S}`},{id:49,name:"Agent Kofi",gender:"male",race:"african",age:"young",hair:"short",build:"tall",image:`/agents/african_american_bald_male.png?${S}`},{id:50,name:"Agent Isabella",gender:"female",race:"hispanic",age:"young",hair:"long",build:"slim",image:`/agents/latina_female_agent.png?${S}`},{id:51,name:"Agent Andre",gender:"male",race:"black",age:"young",hair:"fade",build:"tall",image:`/agents/african_american_bald_male.png?${S}`},{id:52,name:"Agent Grace",gender:"female",race:"white",age:"middle",hair:"auburn",build:"elegant",image:`/agents/caucasian_red-haired_female.png?${S}`},{id:53,name:"Agent Jin",gender:"male",race:"asian",age:"young",hair:"black",build:"athletic",image:`/agents/asian_male_agent_headshot.png?${S}`},{id:54,name:"Agent Serena",gender:"female",race:"black",age:"young",hair:"long",build:"tall",image:`/agents/african_american_female_agent.png?${S}`}],ta=[{id:1,name:"Agent Marcus",image:`/agents/pixar/marcus.png?${S}`},{id:2,name:"Agent Aria",image:`/agents/pixar/aria.png?${S}`},{id:3,name:"Agent Devon",image:`/agents/pixar/devon.png?${S}`},{id:4,name:"Agent Claire",image:`/agents/pixar/claire.png?${S}`},{id:5,name:"CryptoCat",image:`/agents/pixar/cryptocat.png?${S}`}],Va=()=>St[Math.floor(Math.random()*St.length)],ua=n.createContext({isTelegram:!1,telegramUser:null,isReady:!1,webApp:null,platform:null,themeParams:null,colorScheme:"dark"});function Dn({children:t}){const[a,i]=n.useState(!1),[s,o]=n.useState(null),[p,h]=n.useState(null),[x,u]=n.useState(null),[c,j]=n.useState("dark"),g=n.useMemo(()=>typeof window>"u"?null:window.Telegram?.WebApp||null,[]),y=n.useMemo(()=>typeof window>"u"?!1:new URLSearchParams(window.location.search).get("tg")==="1"?!0:!!window.Telegram?.WebApp?.initData,[]);n.useEffect(()=>{if(typeof window>"u")return;const v=new URLSearchParams(window.location.search).get("tg")==="1";if((v||g?.initData)&&document.body.classList.add("telegram-mode"),v&&!g){o({id:123456789,first_name:"Test",last_name:"User",username:"testuser",language_code:"en",is_premium:!1}),u("web"),h({bg_color:"#1a1a2e",text_color:"#ffffff",hint_color:"#aaaaaa",link_color:"#00d4ff",button_color:"#00d4ff",button_text_color:"#ffffff"}),j("dark"),i(!0);return}if(!g){i(!0);return}try{g.ready(),g.expand();const f=g.initDataUnsafe;f?.user&&o({id:f.user.id,first_name:f.user.first_name||"",last_name:f.user.last_name||"",username:f.user.username||"",language_code:f.user.language_code||"en",is_premium:f.user.is_premium||!1,photo_url:f.user.photo_url||null});const D=g.platform||"unknown";u(D),g.themeParams&&h(g.themeParams),j(g.colorScheme||"dark"),g.onEvent?.("themeChanged",()=>{g.themeParams&&h({...g.themeParams}),j(g.colorScheme||"dark")}),i(!0)}catch(f){console.error("Error initializing Telegram WebApp:",f),i(!0)}},[g]);const F=n.useMemo(()=>({isTelegram:y,telegramUser:s,isReady:a,webApp:g,platform:x,themeParams:p,colorScheme:c}),[y,s,a,g,x,p,c]);return e.jsx(ua.Provider,{value:F,children:t})}function Ha(){const t=n.useContext(ua);if(t===void 0)throw new Error("useTelegram must be used within a TelegramProvider");return t}const qa={free:0,base:1,"rm-plus":2,founder:3,premium:4},aa=n.createContext(null);function na(t){return qa[t]??0}function Ga(t,a){return na(t)>=na(a)}function Ka({isOpen:t,onClose:a,featureName:i,requiredTier:s}){const{webApp:o,isTelegram:p}=Ha();if(!t)return null;const h={base:"Base","rm-plus":"RM+",founder:"Legacy Founder",premium:"Premium"},x=()=>{const c="/pricing";p&&o?.openLink?o.openLink(window.location.origin+c):window.location.href=c,a()},u=c=>{c.target===c.currentTarget&&a()};return e.jsxs("div",{className:"subscription-gate-modal-backdrop",onClick:u,children:[e.jsxs("div",{className:"subscription-gate-modal",children:[e.jsx("button",{className:"subscription-gate-modal-close",onClick:a,children:"×"}),e.jsx("div",{className:"subscription-gate-modal-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),e.jsx("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]})}),e.jsxs("h2",{className:"subscription-gate-modal-title",children:["Unlock ",i||"Premium Feature"]}),e.jsxs("p",{className:"subscription-gate-modal-description",children:["This feature requires a ",e.jsx("strong",{children:h[s]||s})," subscription or higher. Upgrade now to unlock this and many more premium features!"]}),e.jsxs("div",{className:"subscription-gate-modal-benefits",children:[e.jsxs("div",{className:"subscription-gate-benefit",children:[e.jsx("span",{className:"subscription-gate-benefit-icon",children:"✓"}),e.jsx("span",{children:"Advanced AI Analysis"})]}),e.jsxs("div",{className:"subscription-gate-benefit",children:[e.jsx("span",{className:"subscription-gate-benefit-icon",children:"✓"}),e.jsx("span",{children:"StrikeAgent Trading Bot"})]}),e.jsxs("div",{className:"subscription-gate-benefit",children:[e.jsx("span",{className:"subscription-gate-benefit-icon",children:"✓"}),e.jsx("span",{children:"Real-time Alerts"})]})]}),e.jsx("button",{className:"subscription-gate-modal-cta",onClick:x,children:"Subscribe to Unlock"}),e.jsx("button",{className:"subscription-gate-modal-secondary",onClick:a,children:"Maybe Later"})]}),e.jsx("style",{children:`
        .subscription-gate-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .subscription-gate-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          position: relative;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.1);
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .subscription-gate-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
          transition: color 0.2s;
        }
        
        .subscription-gate-modal-close:hover {
          color: #fff;
        }
        
        .subscription-gate-modal-icon {
          color: #00d4ff;
          margin-bottom: 16px;
        }
        
        .subscription-gate-modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px 0;
        }
        
        .subscription-gate-modal-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        
        .subscription-gate-modal-description strong {
          color: #00d4ff;
        }
        
        .subscription-gate-modal-benefits {
          background: rgba(0, 212, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }
        
        .subscription-gate-benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }
        
        .subscription-gate-benefit-icon {
          color: #10b981;
          font-weight: bold;
        }
        
        .subscription-gate-modal-cta {
          width: 100%;
          background: linear-gradient(135deg, #00d4ff, #00a8cc);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          padding: 14px 24px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
        }
        
        .subscription-gate-modal-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 212, 255, 0.4);
        }
        
        .subscription-gate-modal-secondary {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          padding: 12px 24px;
          cursor: pointer;
          margin-top: 12px;
          transition: background 0.2s, color 0.2s;
        }
        
        .subscription-gate-modal-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
        }
      `})]})}function Rn({children:t,requiredTier:a="rm-plus",featureName:i="",mode:s="overlay",currentTier:o}){const[p,h]=n.useState(!1),x=o||"free",u=Ga(x,a),c=n.useMemo(()=>({currentTier:x,showUpgradeModal:()=>h(!0)}),[x]),j=F=>{u||(F.preventDefault(),F.stopPropagation(),h(!0))};if(u)return e.jsx(aa.Provider,{value:c,children:t});if(s==="hide")return null;const g={overlay:{container:{position:"relative",cursor:"pointer"},overlay:{position:"absolute",inset:0,background:"linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"20px",paddingBottom:"40px",borderRadius:"12px",zIndex:10},content:{opacity:.6,pointerEvents:"none"}},blur:{container:{position:"relative",cursor:"pointer"},overlay:{position:"absolute",inset:0,backdropFilter:"blur(8px)",background:"rgba(0, 0, 0, 0.3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",borderRadius:"12px",zIndex:10},content:{filter:"blur(4px)",pointerEvents:"none"}}},y=g[s]||g.overlay;return e.jsxs(aa.Provider,{value:c,children:[e.jsxs("div",{style:y.container,onClick:j,children:[e.jsx("div",{style:y.content,children:t}),e.jsxs("div",{style:y.overlay,children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"},children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"#00d4ff",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2",ry:"2"}),e.jsx("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})]}),e.jsx("span",{style:{color:"#fff",fontSize:"0.9rem",fontWeight:"600"},children:i||"Premium Feature"})]}),e.jsx("button",{style:{background:"linear-gradient(135deg, #00d4ff, #00a8cc)",border:"none",borderRadius:"8px",color:"#fff",fontSize:"0.85rem",fontWeight:"600",padding:"10px 20px",cursor:"pointer",boxShadow:"0 4px 15px rgba(0, 212, 255, 0.3)"},children:"Subscribe to Unlock"})]})]}),e.jsx(Ka,{isOpen:p,onClose:()=>h(!1),featureName:i,requiredTier:a})]})}const Ft="/api";async function Ya(t){try{const a=t.toLowerCase()==="btc"?"bitcoin":t.toLowerCase()==="eth"?"ethereum":t.toLowerCase()==="sol"?"solana":t.toLowerCase()==="xrp"?"ripple":t.toLowerCase()==="bnb"?"binancecoin":t.toLowerCase()==="doge"?"dogecoin":t.toLowerCase()==="ada"?"cardano":t.toLowerCase()==="trx"?"tron":t.toLowerCase()==="avax"?"avalanche-2":t.toLowerCase(),i=await fetch(`${Ft}/crypto/btc-history?days=30&coinId=${a}`);let s=[],o=0,p=0,h=0;if(i.ok){const c=await i.json();if(Array.isArray(c)&&c.length>0){s=c.map(g=>g.close||g[1]||g),o=s[s.length-1]||0;const j=s[Math.max(0,s.length-6)]||o;p=o-j,h=j>0?(o-j)/j*100:0}else if(c.prices&&c.prices.length>0){s=c.prices.map(g=>g[1]||g),o=s[s.length-1]||0;const j=s[Math.max(0,s.length-24)]||o;p=o-j,h=j>0?(o-j)/j*100:0}}if(s.length<10)return{success:!1,error:"Insufficient price data"};const x=await fetch(`${Ft}/analyze`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ticker:t.toUpperCase(),currentPrice:o,priceChange24h:p,priceChangePercent24h:h,prices:s})});if(!x.ok)throw new Error(`API error: ${x.status}`);const u=await x.json();return{success:!0,data:{rsi:u.rsi,macd:u.macd,ema9:u.ema9,ema21:u.ema21,ema50:u.ema50,ema200:u.ema200,sma50:u.sma50,sma200:u.sma200,bollingerBands:u.bollingerBands,support:u.support,resistance:u.resistance,recommendation:u.recommendation,signals:u.signals,signalCount:u.signalCount,volatility:u.volatility,spikeScore:u.spikeScore}}}catch(a){return console.error("[API] fetchCoinAnalysis failed:",a),{success:!1,error:a.message}}}async function Pn(){try{const t=await fetch(`${Ft}/crypto/coin-prices`);if(!t.ok)throw new Error(`API error: ${t.status}`);return{success:!0,predictions:(await t.json()).slice(0,3).map(s=>{const o=parseFloat(s.priceChangePercent24h||s.change24h||0);let p="HOLD",h=60;return o>5?(p="BUY",h=Math.min(85,65+Math.abs(o))):o<-5?(p="SELL",h=Math.min(85,65+Math.abs(o))):o>2?(p="BUY",h=55+Math.abs(o)*2):o<-2&&(p="SELL",h=55+Math.abs(o)*2),{symbol:s.symbol||s.ticker,name:s.name,price:s.price||s.currentPrice,change:o,signal:p,confidence:Math.round(h)}})}}catch(t){return console.error("[API] fetchTopPredictions failed:",t),{success:!1,predictions:[{symbol:"BTC",name:"Bitcoin",signal:"BUY",confidence:72,price:"$97,234",change:2.3},{symbol:"ETH",name:"Ethereum",signal:"HOLD",confidence:65,price:"$3,845",change:1.8},{symbol:"SOL",name:"Solana",signal:"SELL",confidence:58,price:"$242.50",change:-.5}]}}}const ve=[{id:"1S",label:"1S",days:0,isLive:!0},{id:"1D",label:"1D",days:1},{id:"7D",label:"7D",days:7},{id:"30D",label:"30D",days:30},{id:"1Y",label:"1Y",days:365},{id:"ALL",label:"ALL",days:"max"}],V={upColor:"#39FF14",downColor:"#FF4444",lineColor:"#00D4FF",areaTopColor:"rgba(0, 212, 255, 0.4)",areaBottomColor:"rgba(0, 212, 255, 0.05)"},Ae={sma:"#FFD700",ema:"#FF6B9D"};function Ja(t=30,a=100){const i=[],s=Math.floor(Date.now()/1e3),o=t<=1?3600:t<=7?3600*6:86400,p=t<=1?24:t<=7?28:Math.min(t,365);let h=a;for(let x=p-1;x>=0;x--){const u=s-x*o,j=(Math.random()-.5)*2*.03,g=h,y=g*(1+j),F=Math.max(g,y)*(1+Math.random()*.015),m=Math.min(g,y)*(1-Math.random()*.015);i.push({time:u,open:Math.round(g*100)/100,high:Math.round(F*100)/100,low:Math.round(m*100)/100,close:Math.round(y*100)/100}),h=y}return i}function sa(t,a){const i=[];for(let s=a-1;s<t.length;s++){let o=0;for(let p=0;p<a;p++)o+=t[s-p].close;i.push({time:t[s].time,value:o/a})}return i}function ra(t,a){const i=[],s=2/(a+1);let o=t[0].close;for(let p=0;p<t.length;p++)o=(t[p].close-o)*s+o,p>=a-1&&i.push({time:t[p].time,value:o});return i}function Xa({children:t,isOpen:a,onClose:i}){return a?$a.createPortal(e.jsx("div",{style:A.fullscreenOverlay,onClick:i,children:e.jsxs("div",{style:A.fullscreenContainer,onClick:s=>s.stopPropagation(),children:[e.jsx("button",{style:A.fullscreenClose,onClick:i,children:"✕"}),t]})}),document.body):null}function Qa({coin:t,activeIndicators:a={},fullWidth:i=!1}){const s=n.useRef(null),o=n.useRef(null),p=n.useRef(null),h=n.useRef(null),x=n.useRef(null),u=n.useRef(null),[c,j]=n.useState("candlestick"),[g,y]=n.useState("7D"),[F,m]=n.useState(!1),[v,f]=n.useState([]),[D,L]=n.useState(!0),[X,O]=n.useState({lastPrice:null,priceChange:null}),E=t?.symbol||"BTC",b=t?.price,H=!!a.sma,I=!!a.ema,Z=n.useCallback(async()=>{const w=E?.toUpperCase()||"BTC";try{const z=w==="BTC"?"/api/crypto/btc-price":`/api/crypto/coin-price?symbol=${w}`,q=await fetch(z);if(q.ok){const Q=await q.json(),R=Q?.price||Q?.current_price;if(R){const B=Math.floor(Date.now()/1e3);f(G=>{const $={time:B,open:R,high:R,low:R,close:R};if(G.length===0)return u.current=R,[$];const k=[...G],P=k[k.length-1];return B-P.time<1?(P.close=R,P.high=Math.max(P.high,R),P.low=Math.min(P.low,R)):(k.push($),k.length>120&&k.shift()),k}),O(G=>{const $=u.current?(R-u.current)/u.current*100:0;return{lastPrice:R,priceChange:$.toFixed(2)}})}}}catch{console.log("Live price fetch error")}},[E]);n.useEffect(()=>{let w=!1;const z=ve.find(Q=>Q.id===g);if(u.current=null,z?.isLive){f([]),L(!1);return}async function q(){const Q=z?.days==="max"?1825:z?.days||7,R=E?.toUpperCase()||"BTC";L(!0);try{const B=await fetch(`/api/crypto/coin-history?symbol=${R}&days=${Q}`);if(B.ok&&!w){const G=await B.json();if(G&&G.length>0){f(G),G[0]&&(u.current=G[0].open),L(!1);return}}}catch{console.log("API unavailable, using sample data")}if(!w){const B=parseFloat(b?.replace(/[$,]/g,"")||100),G=Ja(Q,B);f(G),G[0]&&(u.current=G[0].open),L(!1)}}return q(),()=>{w=!0}},[g,E,b]),n.useEffect(()=>{if(ve.find(z=>z.id===g)?.isLive){Z();const z=setInterval(Z,1e3);return()=>clearInterval(z)}},[g,Z]),n.useEffect(()=>{if(v.length>0){const w=v[v.length-1],z=v[0],q=(w.close-z.open)/z.open*100;O({lastPrice:w.close,priceChange:q.toFixed(2)})}},[v]),n.useEffect(()=>{if(!s.current)return;let w=null,z=!0;try{if(p.current){try{p.current.remove()}catch{}p.current=null,h.current=null}if(w=Jt(s.current,{layout:{background:{type:"solid",color:"transparent"},textColor:"rgba(255, 255, 255, 0.7)"},grid:{vertLines:{color:"rgba(255, 255, 255, 0.06)"},horzLines:{color:"rgba(255, 255, 255, 0.06)"}},crosshair:{mode:1,vertLine:{color:V.lineColor,width:1,style:2,labelBackgroundColor:V.lineColor},horzLine:{color:V.lineColor,width:1,style:2,labelBackgroundColor:V.lineColor}},rightPriceScale:{borderColor:"rgba(255, 255, 255, 0.1)",scaleMargins:{top:.1,bottom:.1}},timeScale:{borderColor:"rgba(255, 255, 255, 0.1)",timeVisible:!0,secondsVisible:!0},handleScale:{mouseWheel:!0,pinch:!0},handleScroll:{mouseWheel:!0,pressedMouseMove:!0,touch:!0}}),!z){w.remove();return}p.current=w;const q=ve.find($=>$.id===g),Q=c==="candlestick"&&!q?.isLive;let R;Q?R=w.addSeries(Xt,{upColor:V.upColor,downColor:V.downColor,borderUpColor:V.upColor,borderDownColor:V.downColor,wickUpColor:V.upColor,wickDownColor:V.downColor}):R=w.addSeries(Qt,{lineColor:V.lineColor,topColor:V.areaTopColor,bottomColor:V.areaBottomColor,lineWidth:2}),h.current=R;const B=()=>{if(s.current&&p.current)try{w.applyOptions({width:s.current.clientWidth,height:s.current.clientHeight})}catch{}};window.addEventListener("resize",B),B();const G=setTimeout(()=>{B(),p.current&&p.current.timeScale().fitContent()},100);return()=>{if(clearTimeout(G),z=!1,window.removeEventListener("resize",B),w)try{w.remove()}catch{}p.current=null,h.current=null}}catch(q){console.log("Chart initialization error:",q)}},[c,g]),n.useEffect(()=>{if(!(!h.current||!p.current))try{if(v.length>0){const w=ve.find(q=>q.id===g);c==="candlestick"&&!w?.isLive?h.current.setData(v):h.current.setData(v.map(q=>({time:q.time,value:q.close})))}if(H&&v.length>=20&&p.current){const w=sa(v,20);p.current.addSeries(He,{color:Ae.sma,lineWidth:1,lineStyle:0,priceLineVisible:!1}).setData(w)}if(I&&v.length>=12&&p.current){const w=ra(v,12);p.current.addSeries(He,{color:Ae.ema,lineWidth:1,lineStyle:0,priceLineVisible:!1}).setData(w)}p.current&&p.current.timeScale().fitContent()}catch(w){console.log("Chart data update error:",w)}},[v,c,g,H,I]),n.useEffect(()=>{if(!F||!o.current||v.length===0){if(x.current){try{x.current.remove()}catch{}x.current=null}return}const w=setTimeout(()=>{if(x.current)try{x.current.remove()}catch{}const z=Jt(o.current,{layout:{background:{type:"solid",color:"transparent"},textColor:"rgba(255, 255, 255, 0.7)"},grid:{vertLines:{color:"rgba(255, 255, 255, 0.06)"},horzLines:{color:"rgba(255, 255, 255, 0.06)"}},crosshair:{mode:1,vertLine:{color:V.lineColor,width:1,style:2,labelBackgroundColor:V.lineColor},horzLine:{color:V.lineColor,width:1,style:2,labelBackgroundColor:V.lineColor}},rightPriceScale:{borderColor:"rgba(255, 255, 255, 0.1)",scaleMargins:{top:.1,bottom:.1}},timeScale:{borderColor:"rgba(255, 255, 255, 0.1)",timeVisible:!0,secondsVisible:!0},handleScale:{mouseWheel:!0,pinch:!0},handleScroll:{mouseWheel:!0,pressedMouseMove:!0,touch:!0}});x.current=z;const q=ve.find(R=>R.id===g);if(c==="candlestick"&&!q?.isLive?z.addSeries(Xt,{upColor:V.upColor,downColor:V.downColor,borderUpColor:V.upColor,borderDownColor:V.downColor,wickUpColor:V.upColor,wickDownColor:V.downColor}).setData(v):z.addSeries(Qt,{lineColor:V.lineColor,topColor:V.areaTopColor,bottomColor:V.areaBottomColor,lineWidth:2}).setData(v.map(B=>({time:B.time,value:B.close}))),H&&v.length>=20){const R=sa(v,20);z.addSeries(He,{color:Ae.sma,lineWidth:1,priceLineVisible:!1}).setData(R)}if(I&&v.length>=12){const R=ra(v,12);z.addSeries(He,{color:Ae.ema,lineWidth:1,priceLineVisible:!1}).setData(R)}z.timeScale().fitContent();try{z.applyOptions({width:o.current.clientWidth,height:o.current.clientHeight})}catch{}},100);return()=>{if(clearTimeout(w),x.current){try{x.current.remove()}catch{}x.current=null}}},[F,v,c,g,H,I]);const Y=E?.toUpperCase()||"BTC",{lastPrice:se,priceChange:U}=X,ae=ve.find(w=>w.id===g)?.isLive,ne=()=>{const w=[];return H&&w.push({name:"SMA(20)",color:Ae.sma}),I&&w.push({name:"EMA(12)",color:Ae.ema}),w.length===0?null:e.jsx("div",{style:A.indicatorLegend,children:w.map(z=>e.jsxs("span",{style:A.legendItem,children:[e.jsx("span",{style:{...A.legendDot,background:z.color}}),z.name]},z.name))})},de=i?"320px":"220px";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:A.container,children:[e.jsxs("div",{style:A.chartHeader,children:[e.jsxs("div",{style:A.chartTitle,children:[e.jsxs("span",{style:A.symbol,children:[Y,"/USD"]}),ae&&e.jsxs("span",{style:A.liveBadge,children:[e.jsx("span",{style:A.liveDot}),"LIVE"]}),se&&e.jsxs("span",{style:A.priceInfo,children:[e.jsxs("span",{style:A.currentPrice,children:["$",se.toLocaleString()]}),U&&e.jsxs("span",{style:{...A.priceChange,color:parseFloat(U)>=0?"#39FF14":"#FF4444",background:parseFloat(U)>=0?"rgba(57, 255, 20, 0.15)":"rgba(255, 68, 68, 0.15)"},children:[parseFloat(U)>=0?"+":"",U,"%"]})]})]}),e.jsxs("div",{style:A.chartControls,children:[e.jsxs("div",{style:A.chartTypeToggle,children:[e.jsx("button",{style:{...A.toggleBtn,...c==="candlestick"?A.toggleBtnActive:{}},onClick:()=>j("candlestick"),title:"Candlestick",children:"📊"}),e.jsx("button",{style:{...A.toggleBtn,...c==="area"?A.toggleBtnActive:{}},onClick:()=>j("area"),title:"Area",children:"📈"})]}),e.jsx("div",{style:A.timeframeButtons,children:ve.map(w=>e.jsx("button",{style:{...A.tfBtn,...g===w.id?A.tfBtnActive:{},...w.isLive?A.tfBtnLive:{}},onClick:()=>y(w.id),children:w.label},w.id))}),e.jsx("button",{style:A.actionBtn,onClick:()=>m(!0),title:"Fullscreen",children:"⛶"})]})]}),ne(),e.jsxs("div",{style:{...A.chartWrapper,height:de},ref:s,children:[D&&!ae&&e.jsxs("div",{style:A.loading,children:[e.jsx("div",{style:A.spinner}),e.jsx("span",{children:"Loading chart..."})]}),ae&&v.length===0&&e.jsxs("div",{style:A.loading,children:[e.jsx("div",{style:A.spinner}),e.jsx("span",{children:"Connecting to live feed..."})]})]})]}),e.jsxs(Xa,{isOpen:F,onClose:()=>m(!1),children:[e.jsxs("div",{style:A.fullscreenHeader,children:[e.jsxs("div",{style:A.chartTitle,children:[e.jsxs("span",{style:A.symbol,children:[Y,"/USD"]}),ae&&e.jsxs("span",{style:A.liveBadge,children:[e.jsx("span",{style:A.liveDot}),"LIVE"]}),se&&e.jsx("span",{style:A.priceInfo,children:e.jsxs("span",{style:A.currentPrice,children:["$",se.toLocaleString()]})})]}),e.jsxs("div",{style:A.chartControls,children:[e.jsxs("div",{style:A.chartTypeToggle,children:[e.jsx("button",{style:{...A.toggleBtn,...c==="candlestick"?A.toggleBtnActive:{}},onClick:()=>j("candlestick"),children:"📊"}),e.jsx("button",{style:{...A.toggleBtn,...c==="area"?A.toggleBtnActive:{}},onClick:()=>j("area"),children:"📈"})]}),e.jsx("div",{style:A.timeframeButtons,children:ve.map(w=>e.jsx("button",{style:{...A.tfBtn,...g===w.id?A.tfBtnActive:{},...w.isLive?A.tfBtnLive:{}},onClick:()=>y(w.id),children:w.label},w.id))})]})]}),ne(),e.jsx("div",{style:A.fullscreenChart,ref:o})]})]})}const A={container:{background:"linear-gradient(145deg, #0f0f0f 0%, #141414 100%)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"12px",padding:"12px",marginBottom:"12px"},chartHeader:{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"10px",marginBottom:"10px"},chartTitle:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"},symbol:{fontSize:"16px",fontWeight:"700",color:"#fff"},liveBadge:{display:"flex",alignItems:"center",gap:"5px",background:"rgba(57, 255, 20, 0.15)",color:"#39FF14",fontSize:"10px",fontWeight:"700",padding:"4px 8px",borderRadius:"6px",textTransform:"uppercase",letterSpacing:"0.5px"},liveDot:{width:"6px",height:"6px",background:"#39FF14",borderRadius:"50%",animation:"pulse 1.5s infinite"},priceInfo:{display:"flex",alignItems:"center",gap:"8px"},currentPrice:{fontSize:"16px",fontWeight:"600",color:"#fff"},priceChange:{fontSize:"12px",fontWeight:"600",padding:"3px 8px",borderRadius:"6px"},chartControls:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},chartTypeToggle:{display:"flex",background:"rgba(255, 255, 255, 0.05)",borderRadius:"8px",padding:"2px"},toggleBtn:{padding:"6px 10px",background:"transparent",border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"14px",transition:"all 0.2s ease"},toggleBtnActive:{background:"rgba(0, 212, 255, 0.2)",boxShadow:"0 0 10px rgba(0, 212, 255, 0.3)"},timeframeButtons:{display:"flex",gap:"2px",background:"rgba(255, 255, 255, 0.05)",borderRadius:"8px",padding:"2px"},tfBtn:{padding:"5px 10px",background:"transparent",border:"none",borderRadius:"6px",color:"rgba(255, 255, 255, 0.6)",fontSize:"11px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s ease"},tfBtnActive:{background:"rgba(0, 212, 255, 0.2)",color:"#00D4FF",boxShadow:"0 0 8px rgba(0, 212, 255, 0.3)"},tfBtnLive:{color:"rgba(57, 255, 20, 0.8)"},actionBtn:{width:"32px",height:"32px",background:"rgba(255, 255, 255, 0.05)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"8px",cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",color:"#fff"},indicatorLegend:{display:"flex",gap:"12px",marginBottom:"8px",flexWrap:"wrap"},legendItem:{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:"rgba(255, 255, 255, 0.7)"},legendDot:{width:"8px",height:"8px",borderRadius:"50%"},chartWrapper:{height:"220px",position:"relative",borderRadius:"8px",overflow:"hidden"},loading:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px",background:"rgba(0, 0, 0, 0.6)",color:"rgba(255, 255, 255, 0.6)",fontSize:"13px"},spinner:{width:"28px",height:"28px",border:"3px solid rgba(0, 212, 255, 0.2)",borderTopColor:"#00D4FF",borderRadius:"50%",animation:"spin 1s linear infinite"},fullscreenOverlay:{position:"fixed",inset:0,background:"rgba(0, 0, 0, 0.95)",zIndex:99999,display:"flex",flexDirection:"column",padding:"20px"},fullscreenContainer:{flex:1,display:"flex",flexDirection:"column",background:"#0a0a0a",borderRadius:"12px",padding:"16px",position:"relative"},fullscreenClose:{position:"absolute",top:"12px",right:"12px",width:"36px",height:"36px",background:"rgba(255, 68, 68, 0.2)",border:"1px solid rgba(255, 68, 68, 0.4)",borderRadius:"50%",color:"#FF4444",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,transition:"all 0.2s ease"},fullscreenHeader:{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"12px",marginBottom:"12px",paddingRight:"50px"},fullscreenChart:{flex:1,minHeight:"300px",borderRadius:"8px",overflow:"hidden"}},Ct=document.createElement("style");Ct.textContent=`
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;document.querySelector("[data-analysis-chart-styles]")||(Ct.setAttribute("data-analysis-chart-styles","true"),document.head.appendChild(Ct));const ha=n.createContext(null);function Wn({children:t,userId:a}){const[i,s]=n.useState([]),[o,p]=n.useState(!0),[h,x]=n.useState(!1),u=n.useCallback(async()=>{if(!a){p(!1);return}try{const f=await fetch(`/api/users/${a}/favorites`);if(f.ok){const D=await f.json();s(D.favorites||[])}}catch(f){console.error("Failed to fetch favorites:",f)}finally{p(!1)}},[a]);n.useEffect(()=>{u()},[u]);const c=async f=>{if(!a)return!1;try{const D=await fetch(`/api/users/${a}/favorites`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assetId:f.id||f.symbol.toLowerCase(),assetType:f.assetType||"crypto",symbol:f.symbol.toUpperCase(),name:f.name})});if(D.ok){const L=await D.json();return s(X=>[...X,L.favorite]),!0}}catch(D){console.error("Failed to add favorite:",D)}return!1},j=async f=>{if(!a)return!1;try{if((await fetch(`/api/users/${a}/favorites/${f}`,{method:"DELETE"})).ok)return s(L=>L.filter(X=>X.id!==f)),!0}catch(D){console.error("Failed to remove favorite:",D)}return!1},g=f=>i.some(D=>D.symbol.toUpperCase()===f.toUpperCase()),y=f=>i.find(L=>L.symbol.toUpperCase()===f.toUpperCase())?.id,v={favorites:i,loading:o,showFavoritesOnly:h,setShowFavoritesOnly:x,addFavorite:c,removeFavorite:j,toggleFavorite:async f=>{const D=y(f.symbol);return D?await j(D):await c(f)},isFavorite:g,getFavoriteId:y,updateFavoriteOrder:async(f,D)=>{if(!a)return!1;try{if((await fetch(`/api/users/${a}/favorites/${f}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({displayOrder:D})})).ok)return await u(),!0}catch(L){console.error("Failed to update favorite order:",L)}return!1},refreshFavorites:u};return e.jsx(ha.Provider,{value:v,children:t})}function En(){const t=n.useContext(ha);if(!t)throw new Error("useFavorites must be used within a FavoritesProvider");return t}const vt=t=>{const a=new Uint8Array(t);let i="";for(const s of a)i+=String.fromCharCode(s);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")},ia=t=>{for(t=t.replace(/-/g,"+").replace(/_/g,"/");t.length%4;)t+="=";const a=atob(t),i=new Uint8Array(a.length);for(let s=0;s<a.length;s++)i[s]=a.charCodeAt(s);return i};function Ln({userId:t,userConfig:a,setUserConfig:i}){const[s,o]=n.useState(a?.defaultLandingTab||"dashboard"),[p,h]=n.useState(!1),x=n.useRef(null),[u,c]=n.useState(!1),[j,g]=n.useState([]),[y,F]=n.useState({biometric2faEnabled:!1,biometricWalletEnabled:!1}),[m,v]=n.useState(!0),[f,D]=n.useState(!1),[L,X]=n.useState(null),[O,E]=n.useState(null),[b,H]=n.useState({enabled:!1,mode:"observer",confidenceThreshold:70,accuracyThreshold:55,maxPerTrade:100,maxPerDay:500,maxOpenPositions:3,stopAfterLosses:3,isPaused:!1,pauseReason:null}),[I,Z]=n.useState({totalTrades:0,winRate:0,totalPnl:0}),[Y,se]=n.useState(!0),[U,le]=n.useState(!1);n.useEffect(()=>{t&&(z(),q())},[t]),n.useEffect(()=>{ae(),a?.sessionToken&&ne()},[a?.sessionToken]);const ae=async()=>{try{if(window.PublicKeyCredential&&typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable=="function"){const d=await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();c(d)}}catch(d){console.error("Biometric check failed:",d),c(!1)}},ne=async()=>{if(a?.sessionToken){v(!0);try{const d=await fetch("/api/webauthn/credentials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:a.sessionToken})});if(d.ok){const l=await d.json();g(l.credentials||[]),F(l.settings||{biometric2faEnabled:!1,biometricWalletEnabled:!1})}}catch(d){console.error("Failed to load biometric credentials:",d)}finally{v(!1)}}},de=async d=>{if(!(!a?.sessionToken||!u)){D(!0),X(null),E(null);try{const l=await fetch("/api/webauthn/registration/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:a.sessionToken,deviceName:navigator.userAgent.includes("Mac")?"Touch ID":navigator.userAgent.includes("Windows")?"Windows Hello":"Biometric Device",usedFor:d})});if(!l.ok){const ie=await l.json();throw new Error(ie.error||"Failed to start registration")}const{challengeId:C,options:W}=await l.json(),_={...W,challenge:ia(W.challenge),user:{...W.user,id:ia(W.user.id)}},K=await navigator.credentials.create({publicKey:_}),re={id:K.id,rawId:vt(K.rawId),type:K.type,response:{clientDataJSON:vt(K.response.clientDataJSON),attestationObject:vt(K.response.attestationObject),transports:K.response.getTransports?K.response.getTransports():["internal"]}},me=await fetch("/api/webauthn/registration/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:a.sessionToken,challengeId:C,credential:re,deviceName:navigator.userAgent.includes("Mac")?"Touch ID":navigator.userAgent.includes("Windows")?"Windows Hello":"Biometric Device",usedFor:d})});if(!me.ok){const ie=await me.json();throw new Error(ie.error||"Failed to complete registration")}E(d==="2fa"?"Biometric login enabled!":"Biometric wallet confirmation enabled!"),ne()}catch(l){console.error("Biometric enrollment failed:",l),X(l.message||"Enrollment failed. Please try again.")}finally{D(!1)}}},w=async d=>{if(a?.sessionToken)try{(await fetch("/api/webauthn/credentials/delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:a.sessionToken,credentialId:d})})).ok&&(ne(),E("Biometric credential removed"))}catch(l){console.error("Failed to remove credential:",l),X("Failed to remove credential")}},z=async()=>{if(t)try{const d=await fetch(`/api/auto-trade/config?userId=${t}`);if(d.ok){const l=await d.json();l.config&&H(C=>({...C,...l.config}))}}catch(d){console.error("Failed to load auto-trade config:",d)}finally{se(!1)}},q=async()=>{if(t)try{const d=await fetch(`/api/auto-trade/stats?userId=${t}`);if(d.ok){const l=await d.json();l.success&&Z({totalTrades:l.config?.totalTradesExecuted||0,winRate:l.winRate||0,totalPnl:parseFloat(l.config?.totalProfitLoss)||0})}}catch(d){console.error("Failed to load auto-trade stats:",d)}},Q=async()=>{if(!t)return;const d=!b.enabled;H(l=>({...l,enabled:d}));try{(await fetch("/api/auto-trade/toggle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t,enabled:d})})).ok||(H(C=>({...C,enabled:!d})),console.error("Failed to toggle auto-trade"))}catch(l){H(C=>({...C,enabled:!d})),console.error("Failed to toggle auto-trade:",l)}},R=async d=>{t&&(H(l=>({...l,mode:d})),await $({mode:d}))},B=(d,l)=>{H(C=>({...C,[d]:l}))},G=n.useCallback(d=>{x.current&&clearTimeout(x.current),x.current=setTimeout(()=>{$(d)},500)},[t]),$=async(d={})=>{if(t){le(!0);try{(await fetch("/api/auto-trade/config",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t,...b,...d})})).ok||console.error("Failed to save auto-trade config")}catch(l){console.error("Failed to save auto-trade config:",l)}finally{le(!1)}}},k=async()=>{if(!t)return;const d=b.isPaused?"/api/auto-trade/resume":"/api/auto-trade/pause";try{(await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t})})).ok&&H(C=>({...C,isPaused:!C.isPaused,pauseReason:C.isPaused?null:C.pauseReason}))}catch(l){console.error("Failed to pause/resume auto-trade:",l)}},P=async d=>{if(o(d),!!t){h(!0);try{const l=await fetch(`/api/users/${t}/dashboard`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({defaultLandingTab:d})});if(l.ok){const C=await l.json();i&&i(W=>({...W,defaultLandingTab:d}))}}catch(l){console.error("Failed to save landing tab:",l)}finally{h(!1)}}},J=[{id:"observer",icon:"🔍",label:"Observer",desc:"Watch AI recommendations only"},{id:"approval",icon:"✋",label:"Approval",desc:"Confirm each trade manually"},{id:"semi-auto",icon:"🔄",label:"Semi-Auto",desc:"Small trades with notifications"},{id:"full-auto",icon:"⚡",label:"Full Auto",desc:"Fully autonomous trading"}];return e.jsxs("div",{className:"settings-tab",children:[e.jsx("div",{className:"section-box mb-md",children:e.jsxs("div",{style:{padding:16,display:"flex",alignItems:"center",gap:16},children:[e.jsx("div",{style:{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg, #00D4FF, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},children:"👤"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,marginBottom:4},children:"Founder Account"}),a?.hallmarkId&&e.jsx("div",{style:{fontSize:11,color:"#00D4FF",marginBottom:2},children:a.hallmarkId}),e.jsx("div",{style:{fontSize:12,color:"#39FF14"},children:"✓ Beta V1 Access"}),e.jsx("div",{style:{fontSize:11,color:"#888"},children:"Member since 2025"})]})]})}),e.jsxs(Oa,{singleOpen:!1,children:[e.jsx(ye,{title:"Account Settings",icon:"👤",children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx("span",{children:"Email Notifications"}),e.jsx("label",{style:{width:44,height:24,background:"#39FF14",borderRadius:12,position:"relative",cursor:"pointer"},children:e.jsx("span",{style:{position:"absolute",right:4,top:4,width:16,height:16,background:"#fff",borderRadius:"50%"}})})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx("span",{children:"Push Notifications"}),e.jsx("label",{style:{width:44,height:24,background:"#333",borderRadius:12,position:"relative",cursor:"pointer"},children:e.jsx("span",{style:{position:"absolute",left:4,top:4,width:16,height:16,background:"#888",borderRadius:"50%"}})})]})]})}),e.jsx(ye,{title:"Dashboard Settings",icon:"🏠",defaultOpen:!0,children:e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:16},children:e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:600,marginBottom:8},children:"Default Landing Page"}),e.jsx("div",{style:{fontSize:11,color:"#888",marginBottom:12},children:"Choose which page to show when you open the app"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:8},children:[{id:"dashboard",icon:"🏠",label:"My Dashboard"},{id:"markets",icon:"📊",label:"Crypto Markets"},{id:"portfolio",icon:"💼",label:"Portfolio"},{id:"projects",icon:"🚀",label:"Projects"}].map(d=>e.jsxs("button",{onClick:()=>P(d.id),style:{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:s===d.id?"rgba(0, 212, 255, 0.15)":"rgba(255, 255, 255, 0.05)",border:s===d.id?"1px solid #00D4FF":"1px solid rgba(255, 255, 255, 0.1)",borderRadius:8,color:s===d.id?"#00D4FF":"#ccc",cursor:"pointer",fontSize:13,fontWeight:s===d.id?600:400,textAlign:"left"},children:[e.jsx("span",{style:{fontSize:16},children:d.icon}),e.jsx("span",{children:d.label}),s===d.id&&e.jsx("span",{style:{marginLeft:"auto",fontSize:14},children:"✓"})]},d.id))}),p&&e.jsx("div",{style:{fontSize:11,color:"#00D4FF",marginTop:8},children:"Saving..."})]})})}),e.jsx(ye,{title:"AI Trading",icon:"🤖",children:e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:20},children:Y?e.jsx("div",{style:{textAlign:"center",padding:20,color:"#888"},children:"Loading AI Trading settings..."}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:16,background:"#0f0f0f",borderRadius:12,border:b.enabled?"1px solid #39FF14":"1px solid #333"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{fontWeight:700,marginBottom:4,color:b.enabled?"#39FF14":"#fff"},children:["Auto-Trading ",b.enabled?"Enabled":"Disabled"]}),e.jsx("div",{style:{fontSize:11,color:"#888"},children:b.enabled?"AI is actively monitoring markets":"Enable to start autonomous trading"})]}),e.jsx("button",{onClick:Q,style:{width:52,height:28,background:b.enabled?"#39FF14":"#333",borderRadius:14,position:"relative",cursor:"pointer",border:"none",transition:"background 0.3s ease",boxShadow:b.enabled?"0 0 12px rgba(57, 255, 20, 0.4)":"none"},children:e.jsx("span",{style:{position:"absolute",left:b.enabled?26:4,top:4,width:20,height:20,background:"#fff",borderRadius:"50%",transition:"left 0.3s ease"}})})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:600,marginBottom:8},children:"Trading Mode"}),e.jsx("div",{style:{fontSize:11,color:"#888",marginBottom:12},children:"Choose how the AI should handle trades"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:8},children:J.map(d=>e.jsxs("button",{onClick:()=>R(d.id),style:{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:b.mode===d.id?"#1a1a1a":"#0f0f0f",border:b.mode===d.id?"1px solid #00D4FF":"1px solid #333",borderRadius:10,color:b.mode===d.id?"#00D4FF":"#ccc",cursor:"pointer",textAlign:"left",boxShadow:b.mode===d.id?"0 0 12px rgba(0, 212, 255, 0.2)":"none"},children:[e.jsx("span",{style:{fontSize:20},children:d.icon}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontWeight:600,fontSize:13},children:d.label}),e.jsx("div",{style:{fontSize:11,color:"#888",marginTop:2},children:d.desc})]}),b.mode===d.id&&e.jsx("span",{style:{color:"#00D4FF",fontSize:16},children:"✓"})]},d.id))})]}),e.jsxs("div",{style:{padding:16,background:"#0f0f0f",borderRadius:12,border:"1px solid #333"},children:[e.jsx("div",{style:{fontWeight:600,marginBottom:16},children:"Thresholds"}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:8},children:[e.jsx("span",{style:{fontSize:13},children:"Confidence Threshold"}),e.jsxs("span",{style:{color:"#00D4FF",fontWeight:600},children:[b.confidenceThreshold,"%"]})]}),e.jsx("input",{type:"range",min:"60",max:"90",value:b.confidenceThreshold,onChange:d=>{const l=parseInt(d.target.value);B("confidenceThreshold",l),G({confidenceThreshold:l})},style:{width:"100%",height:6,borderRadius:3,background:`linear-gradient(to right, #00D4FF 0%, #00D4FF ${(b.confidenceThreshold-60)/30*100}%, #333 ${(b.confidenceThreshold-60)/30*100}%, #333 100%)`,appearance:"none",cursor:"pointer"}}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#666",marginTop:4},children:[e.jsx("span",{children:"60%"}),e.jsx("span",{children:"90%"})]})]}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:8},children:[e.jsx("span",{style:{fontSize:13},children:"Accuracy Threshold"}),e.jsxs("span",{style:{color:"#00D4FF",fontWeight:600},children:[b.accuracyThreshold,"%"]})]}),e.jsx("input",{type:"range",min:"55",max:"75",value:b.accuracyThreshold,onChange:d=>{const l=parseInt(d.target.value);B("accuracyThreshold",l),G({accuracyThreshold:l})},style:{width:"100%",height:6,borderRadius:3,background:`linear-gradient(to right, #00D4FF 0%, #00D4FF ${(b.accuracyThreshold-55)/20*100}%, #333 ${(b.accuracyThreshold-55)/20*100}%, #333 100%)`,appearance:"none",cursor:"pointer"}}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#666",marginTop:4},children:[e.jsx("span",{children:"55%"}),e.jsx("span",{children:"75%"})]})]})]}),e.jsxs("div",{style:{padding:16,background:"#0f0f0f",borderRadius:12,border:"1px solid #333"},children:[e.jsx("div",{style:{fontWeight:600,marginBottom:16},children:"Position Limits"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("div",{children:[e.jsx("label",{style:{fontSize:12,color:"#888",display:"block",marginBottom:6},children:"Max per trade (USD)"}),e.jsx("input",{type:"number",value:b.maxPerTrade,onChange:d=>B("maxPerTrade",parseInt(d.target.value)||0),onBlur:d=>$({maxPerTrade:parseInt(d.target.value)||0}),style:{width:"100%",padding:"10px 12px",background:"#1a1a1a",border:"1px solid #333",borderRadius:8,color:"#fff",fontSize:14,fontWeight:600}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{fontSize:12,color:"#888",display:"block",marginBottom:6},children:"Max per day (USD)"}),e.jsx("input",{type:"number",value:b.maxPerDay,onChange:d=>B("maxPerDay",parseInt(d.target.value)||0),onBlur:d=>$({maxPerDay:parseInt(d.target.value)||0}),style:{width:"100%",padding:"10px 12px",background:"#1a1a1a",border:"1px solid #333",borderRadius:8,color:"#fff",fontSize:14,fontWeight:600}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{fontSize:12,color:"#888",display:"block",marginBottom:6},children:"Max open positions"}),e.jsx("div",{style:{display:"flex",gap:8},children:[1,2,3,5,10].map(d=>e.jsx("button",{onClick:()=>{B("maxOpenPositions",d),$({maxOpenPositions:d})},style:{flex:1,padding:"10px 0",background:b.maxOpenPositions===d?"#1a1a1a":"#0f0f0f",border:b.maxOpenPositions===d?"1px solid #00D4FF":"1px solid #333",borderRadius:8,color:b.maxOpenPositions===d?"#00D4FF":"#888",cursor:"pointer",fontSize:14,fontWeight:600},children:d},d))})]})]})]}),e.jsxs("div",{style:{padding:16,background:"#0f0f0f",borderRadius:12,border:"1px solid #333"},children:[e.jsx("div",{style:{fontWeight:600,marginBottom:16},children:"Safety Controls"}),e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("label",{style:{fontSize:12,color:"#888",display:"block",marginBottom:6},children:"Stop after consecutive losses"}),e.jsx("div",{style:{display:"flex",gap:8},children:[2,3,5,7,10].map(d=>e.jsx("button",{onClick:()=>{B("stopAfterLosses",d),$({stopAfterLosses:d})},style:{flex:1,padding:"10px 0",background:b.stopAfterLosses===d?"#1a1a1a":"#0f0f0f",border:b.stopAfterLosses===d?"1px solid #ff4444":"1px solid #333",borderRadius:8,color:b.stopAfterLosses===d?"#ff4444":"#888",cursor:"pointer",fontSize:14,fontWeight:600},children:d},d))})]}),e.jsx("button",{onClick:k,className:b.isPaused?"btn btn-primary":"btn btn-secondary",style:{width:"100%",background:b.isPaused?"#39FF14":"#ff4444",border:"none",color:b.isPaused?"#000":"#fff",fontWeight:600},children:b.isPaused?"▶️ Resume Trading":"⏸️ Pause Trading"}),b.isPaused&&b.pauseReason&&e.jsxs("div",{style:{marginTop:12,padding:12,background:"rgba(255, 68, 68, 0.1)",borderRadius:8,border:"1px solid rgba(255, 68, 68, 0.3)"},children:[e.jsx("div",{style:{fontSize:11,color:"#ff4444",fontWeight:600,marginBottom:4},children:"Pause Reason:"}),e.jsx("div",{style:{fontSize:12,color:"#ccc"},children:b.pauseReason})]})]}),e.jsxs("div",{style:{padding:16,background:"#0f0f0f",borderRadius:12,border:"1px solid #333"},children:[e.jsx("div",{style:{fontWeight:600,marginBottom:16},children:"Trading Stats"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12},children:[e.jsxs("div",{style:{padding:12,background:"#1a1a1a",borderRadius:8,textAlign:"center"},children:[e.jsx("div",{style:{fontSize:20,fontWeight:700,color:"#00D4FF"},children:I.totalTrades}),e.jsx("div",{style:{fontSize:10,color:"#888",marginTop:4},children:"Total Trades"})]}),e.jsxs("div",{style:{padding:12,background:"#1a1a1a",borderRadius:8,textAlign:"center"},children:[e.jsxs("div",{style:{fontSize:20,fontWeight:700,color:I.winRate>=50?"#39FF14":"#ff4444"},children:[I.winRate.toFixed(1),"%"]}),e.jsx("div",{style:{fontSize:10,color:"#888",marginTop:4},children:"Win Rate"})]}),e.jsxs("div",{style:{padding:12,background:"#1a1a1a",borderRadius:8,textAlign:"center"},children:[e.jsxs("div",{style:{fontSize:20,fontWeight:700,color:I.totalPnl>=0?"#39FF14":"#ff4444"},children:[I.totalPnl>=0?"+":"",I.totalPnl.toFixed(2)]}),e.jsx("div",{style:{fontSize:10,color:"#888",marginTop:4},children:"Total P&L"})]})]})]}),U&&e.jsx("div",{style:{fontSize:11,color:"#00D4FF",textAlign:"center"},children:"Saving..."})]})})}),e.jsx(ye,{title:"Display Settings",icon:"🎨",children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx("button",{className:"btn btn-secondary",style:{justifyContent:"flex-start"},children:"🌙 Dark Theme (Active)"}),e.jsx("button",{className:"btn btn-secondary",style:{justifyContent:"flex-start"},children:"🐱 Crypto Cat Mode"}),e.jsx("button",{className:"btn btn-secondary",style:{justifyContent:"flex-start"},children:"👔 Business Mode"})]})}),e.jsx(ye,{title:"Subscription",icon:"💎",children:e.jsxs("div",{style:{padding:16,background:"rgba(57, 255, 20, 0.1)",border:"1px solid rgba(57, 255, 20, 0.3)",borderRadius:8,textAlign:"center"},children:[e.jsx("div",{style:{color:"#39FF14",fontWeight:700,marginBottom:4},children:"✓ Legacy Founder"}),e.jsx("div",{style:{fontSize:24,fontWeight:800,marginBottom:4},children:"$4/month"}),e.jsx("div",{style:{fontSize:11,color:"#888"},children:"Locked in forever"})]})}),e.jsx(ye,{title:"Security",icon:"🔒",children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[L&&e.jsx("div",{style:{padding:12,background:"rgba(255, 68, 68, 0.1)",border:"1px solid rgba(255, 68, 68, 0.3)",borderRadius:8,color:"#ff4444",fontSize:12},children:L}),O&&e.jsx("div",{style:{padding:12,background:"rgba(57, 255, 20, 0.1)",border:"1px solid rgba(57, 255, 20, 0.3)",borderRadius:8,color:"#39FF14",fontSize:12},children:O}),e.jsxs("div",{style:{padding:16,background:"#0f0f0f",borderRadius:12,border:"1px solid #333"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:12},children:[e.jsx("span",{style:{fontSize:24},children:"👆"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:600,color:"#fff"},children:"Biometric Authentication"}),e.jsx("div",{style:{fontSize:11,color:"#888"},children:u?"Use fingerprint or face recognition":"Not supported on this device"})]})]}),m?e.jsx("div",{style:{textAlign:"center",padding:20,color:"#888"},children:"Loading..."}):u?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx("div",{style:{padding:12,background:y.biometric2faEnabled?"rgba(57, 255, 20, 0.1)":"#1a1a1a",borderRadius:8,border:y.biometric2faEnabled?"1px solid rgba(57, 255, 20, 0.3)":"1px solid #333"},children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:600,fontSize:13},children:"Login 2FA"}),e.jsx("div",{style:{fontSize:11,color:"#888"},children:"Require biometric after password"})]}),y.biometric2faEnabled?e.jsx("span",{style:{color:"#39FF14",fontSize:12,fontWeight:600},children:"✓ Enabled"}):e.jsx("button",{onClick:()=>de("2fa"),disabled:f,style:{background:"linear-gradient(135deg, #00D4FF, #0099CC)",border:"none",borderRadius:6,padding:"8px 16px",color:"#000",fontWeight:600,fontSize:12,cursor:f?"wait":"pointer",opacity:f?.6:1},children:f?"Setting up...":"Enable"})]})}),e.jsx("div",{style:{padding:12,background:y.biometricWalletEnabled?"rgba(57, 255, 20, 0.1)":"#1a1a1a",borderRadius:8,border:y.biometricWalletEnabled?"1px solid rgba(57, 255, 20, 0.3)":"1px solid #333"},children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:600,fontSize:13},children:"Wallet Transactions"}),e.jsx("div",{style:{fontSize:11,color:"#888"},children:"Confirm sends with biometric"})]}),y.biometricWalletEnabled?e.jsx("span",{style:{color:"#39FF14",fontSize:12,fontWeight:600},children:"✓ Enabled"}):e.jsx("button",{onClick:()=>de("wallet"),disabled:f,style:{background:"linear-gradient(135deg, #00D4FF, #0099CC)",border:"none",borderRadius:6,padding:"8px 16px",color:"#000",fontWeight:600,fontSize:12,cursor:f?"wait":"pointer",opacity:f?.6:1},children:f?"Setting up...":"Enable"})]})}),j.length>0&&e.jsxs("div",{style:{marginTop:8},children:[e.jsx("div",{style:{fontSize:12,color:"#888",marginBottom:8},children:"Registered Devices:"}),j.map(d=>e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:8,background:"#1a1a1a",borderRadius:6,marginBottom:4},children:[e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:12},children:d.deviceName||"Biometric Device"}),e.jsxs("span",{style:{fontSize:10,color:"#888",marginLeft:8},children:["(",d.usedFor==="2fa"?"Login":"Wallet",")"]})]}),e.jsx("button",{onClick:()=>w(d.id),style:{background:"transparent",border:"none",color:"#ff4444",fontSize:11,cursor:"pointer"},children:"Remove"})]},d.id))]})]}):e.jsx("div",{style:{padding:12,background:"#1a1a1a",borderRadius:8,fontSize:12,color:"#888"},children:"Your browser or device doesn't support biometric authentication. Try using Chrome on a device with Touch ID, Face ID, or Windows Hello."})]}),e.jsx("button",{className:"btn btn-secondary",style:{justifyContent:"flex-start"},children:"🔑 Change Password"}),e.jsx("button",{className:"btn btn-secondary",style:{justifyContent:"flex-start"},children:"📜 View Login History"})]})}),e.jsx(ye,{title:"About",icon:"ℹ️",children:e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{fontSize:24,marginBottom:8},children:e.jsx("span",{style:{color:"#00D4FF"},children:"PULSE"})}),e.jsx("div",{style:{fontSize:12,color:"#888",marginBottom:8},children:"Version 2.0.6"}),e.jsx("div",{style:{fontSize:11,color:"#666"},children:"Powered by DarkWave Studios, LLC © 2025"})]})})]})]})}function Za({isVisible:t,onClose:a,title:i,message:s,agentId:o=null,usePrimaryAgent:p=!1,actions:h=null,position:x="bottom-right",autoClose:u=!1,autoCloseDelay:c=8e3}){const j=n.useRef(null),g=p?ta.find(m=>m.id===o)||ta[0]:o?St.find(m=>m.id===o):Va();if(n.useEffect(()=>{if(!t)return;const m=v=>{j.current&&!j.current.contains(v.target)&&a?.()};return document.addEventListener("mousedown",m),document.addEventListener("touchstart",m),()=>{document.removeEventListener("mousedown",m),document.removeEventListener("touchstart",m)}},[t,a]),n.useEffect(()=>{if(t&&u&&c>0){const m=setTimeout(()=>a?.(),c);return()=>clearTimeout(m)}},[t,u,c,a]),!t||!g)return null;const y=()=>{switch(x){case"bottom-left":return{left:"40px",bottom:"80px"};case"bottom-right":return{right:"40px",bottom:"80px"};case"top-left":return{left:"40px",top:"100px"};case"top-right":return{right:"40px",top:"100px"};case"center":return{left:"50%",top:"50%",transform:"translate(-50%, -50%)"};default:return{right:"40px",bottom:"80px"}}},F=x.includes("left");return e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:j,className:`agent-speech-overlay ${F?"from-left":"from-right"}`,style:y(),children:F?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"agent-character-overlay",children:[e.jsx("div",{className:"agent-glow-overlay"}),e.jsx("img",{src:g.image,alt:g.name||"Agent",className:"agent-image-overlay",onError:m=>{m.target.src="/agents/pixar/marcus.png"}}),e.jsx("div",{className:"agent-name-tag-overlay",children:g.name||"Agent"})]}),e.jsxs("div",{className:"speech-bubble-overlay tail-left",children:[e.jsx("button",{className:"close-btn-overlay",onClick:m=>{m.stopPropagation(),a?.()},children:"×"}),i&&e.jsx("div",{className:"bubble-title-overlay",children:i}),e.jsx("div",{className:"bubble-message-overlay",children:s}),h&&e.jsx("div",{className:"bubble-actions-overlay",children:h})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"speech-bubble-overlay tail-right",children:[e.jsx("button",{className:"close-btn-overlay",onClick:m=>{m.stopPropagation(),a?.()},children:"×"}),i&&e.jsx("div",{className:"bubble-title-overlay",children:i}),e.jsx("div",{className:"bubble-message-overlay",children:s}),h&&e.jsx("div",{className:"bubble-actions-overlay",children:h})]}),e.jsxs("div",{className:"agent-character-overlay",children:[e.jsx("div",{className:"agent-glow-overlay"}),e.jsx("img",{src:g.image,alt:g.name||"Agent",className:"agent-image-overlay",onError:m=>{m.target.src="/agents/pixar/marcus.png"}}),e.jsx("div",{className:"agent-name-tag-overlay",children:g.name||"Agent"})]})]})}),e.jsx("style",{children:`
        .agent-speech-overlay {
          position: fixed;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          gap: 16px;
          pointer-events: auto;
        }

        .agent-speech-overlay.from-right {
          animation: sweepInRight 0.5s ease-out forwards;
        }

        .agent-speech-overlay.from-left {
          animation: sweepInLeft 0.5s ease-out forwards;
        }

        @keyframes sweepInRight {
          0% { transform: translateX(150px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes sweepInLeft {
          0% { transform: translateX(-150px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        .agent-character-overlay {
          position: relative;
          width: 160px;
          height: 260px;
          flex-shrink: 0;
        }

        .agent-glow-overlay {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(ellipse, rgba(0, 212, 255, 0.4) 0%, transparent 70%);
          filter: blur(20px);
          animation: glowPulseOverlay 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes glowPulseOverlay {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        .agent-image-overlay {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5));
        }

        .agent-name-tag-overlay {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          color: #000;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 12px;
          white-space: nowrap;
          z-index: 3;
        }

        .speech-bubble-overlay {
          position: relative;
          background: #1a1a1a;
          border: 2px solid #00d4ff;
          border-radius: 16px;
          padding: 16px 20px;
          max-width: 300px;
          min-width: 200px;
          box-shadow: 0 4px 30px rgba(0, 212, 255, 0.25);
          animation: bubblePopIn 0.4s ease-out 0.2s both;
        }

        @keyframes bubblePopIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }

        .speech-bubble-overlay::after {
          content: '';
          position: absolute;
          bottom: 30px;
          width: 0;
          height: 0;
          border: 12px solid transparent;
        }

        .speech-bubble-overlay.tail-right::after {
          right: -22px;
          border-left-color: #00d4ff;
        }

        .speech-bubble-overlay.tail-left::after {
          left: -22px;
          border-right-color: #00d4ff;
        }

        .close-btn-overlay {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          color: #666;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
          z-index: 10;
          transition: color 0.2s;
        }

        .close-btn-overlay:hover {
          color: #ff4466;
        }

        .bubble-title-overlay {
          font-size: 15px;
          font-weight: 700;
          color: #00d4ff;
          margin-bottom: 8px;
          padding-right: 24px;
        }

        .bubble-message-overlay {
          font-size: 13px;
          color: #ccc;
          line-height: 1.5;
        }

        .bubble-actions-overlay {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 600px) {
          .agent-speech-overlay {
            flex-direction: column !important;
            align-items: center !important;
            left: 50% !important;
            right: auto !important;
            bottom: 20px !important;
            transform: translateX(-50%) !important;
          }

          .speech-bubble-overlay {
            max-width: 90vw;
            order: -1;
          }

          .speech-bubble-overlay::after {
            display: none;
          }

          .agent-character-overlay {
            width: 120px;
            height: 200px;
          }
        }
      `})]})}const en=[{label:"$1",value:1},{label:"$2",value:2},{label:"$5",value:5},{label:"Custom",value:"custom"}];function tn(){const{solanaAddress:t,isUnlocked:a,signAndSendSolana:i}=xa(),[s,o]=n.useState(2),[p,h]=n.useState("$2"),[x,u]=n.useState(5),[c,j]=n.useState(!0),[g,y]=n.useState([]),[F,m]=n.useState(new Set),[v,f]=n.useState(null),[D,L]=n.useState(!1),[X,O]=n.useState(!1),[E,b]=n.useState(!1),[H,I]=n.useState(""),[Z,Y]=n.useState(""),[se,U]=n.useState(!1),[le,ae]=n.useState(null),ne=12.5,de=k=>{h(k.label),k.value!=="custom"?o(k.value):o(x)},w=k=>{const P=parseFloat(k.target.value);u(P),p==="Custom"&&o(P)},z=n.useCallback(async()=>{if(!t){I("Please unlock your wallet first");return}L(!0),I(""),y([]),m(new Set),f(null);try{const P=await(await fetch(`/api/dust-buster/scan?wallet=${t}`)).json();if(!P.success)throw new Error(P.error||"Failed to scan wallet");y(P.accounts||[]);const J=new Set((P.accounts||[]).map(d=>d.id));m(J),Y(`Found ${P.accounts?.length||0} token accounts`)}catch(k){I(k.message)}finally{L(!1)}},[t]),q=n.useCallback(async()=>{if(!t||F.size===0){I("No accounts selected");return}O(!0),I("");try{const P=await(await fetch("/api/dust-buster/preview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({walletAddress:t,threshold:s,burnMode:c,selectedAccounts:Array.from(F)})})).json();if(!P.success)throw new Error(P.error||"Failed to preview cleanup");f(P)}catch(k){I(k.message)}finally{O(!1)}},[t,s,c,F]),Q=n.useCallback(async k=>{if(!v){I("Please preview first");return}b(!0),I("");try{const J=await(await fetch("/api/dust-buster/execute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({walletAddress:t,threshold:s,burnMode:c,selectedAccounts:Array.from(F)})})).json();if(!J.success)throw new Error(J.error||"Failed to execute cleanup");ae({accountsClosed:v.accountsToClose,tokensBurned:v.tokensToBurn,solRecovered:v.netSolRecovery,lifetimeTotal:J.lifetimeTotal||v.netSolRecovery,txHash:J.txHash}),U(!0),y([]),m(new Set),f(null)}catch(P){I(P.message)}finally{b(!1)}},[t,s,c,F,v]),R=k=>{m(P=>{const J=new Set(P);return J.has(k)?J.delete(k):J.add(k),J}),f(null)},B=()=>{F.size===g.length?m(new Set):m(new Set(g.map(k=>k.id))),f(null)},G=k=>k.balance===0?"empty":k.valueUsd<s?"dust":"valuable",$=g.filter(k=>{const P=G(k);return c?P==="empty"||P==="dust":P==="empty"});return a?e.jsxs("div",{className:"dust-buster-container",children:[e.jsxs("div",{className:"dust-buster-header",children:[e.jsx("div",{className:"dust-header-icon",children:e.jsx("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:"#00D4FF",strokeWidth:"2",children:e.jsx("path",{d:"M3 12h4l3-9 4 18 3-9h4",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsxs("div",{className:"dust-header-text",children:[e.jsx("h2",{children:"Dust Buster"}),e.jsx("p",{children:"Clean up worthless token accounts and recover locked SOL rent"})]})]}),e.jsxs("div",{className:"dust-controls",children:[e.jsxs("div",{className:"control-section",children:[e.jsx("label",{className:"control-label",children:"Value Threshold"}),e.jsx("div",{className:"threshold-pills",children:en.map(k=>e.jsx("button",{className:`threshold-pill ${p===k.label?"active":""}`,onClick:()=>de(k),children:k.label},k.label))}),p==="Custom"&&e.jsxs("div",{className:"custom-slider-wrapper",children:[e.jsx("input",{type:"range",min:"0",max:"25",step:"0.5",value:x,onChange:w,className:"custom-slider"}),e.jsxs("span",{className:"slider-value",children:["$",x.toFixed(2)]})]})]}),e.jsxs("div",{className:"control-section",children:[e.jsx("label",{className:"control-label",children:"Cleanup Mode"}),e.jsxs("div",{className:"mode-toggle",children:[e.jsxs("button",{className:`mode-btn ${c?"active":""}`,onClick:()=>j(!0),children:[e.jsx("span",{className:"mode-icon",children:"🔥"}),"Burn Dust Tokens"]}),e.jsxs("button",{className:`mode-btn ${c?"":"active"}`,onClick:()=>j(!1),children:[e.jsx("span",{className:"mode-icon",children:"🧹"}),"Close Empty Only"]})]}),e.jsx("span",{className:"mode-hint",children:c?"Burns tokens worth less than threshold and closes accounts":"Only closes accounts with zero balance"})]})]}),e.jsx("div",{className:"dust-actions-row",children:e.jsx("button",{className:"dust-action-btn scan",onClick:z,disabled:D,children:D?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Scanning..."]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-icon",children:"🔍"}),"Scan Wallet"]})})}),H&&e.jsx("div",{className:"dust-error",children:H}),Z&&!H&&e.jsx("div",{className:"dust-success",children:Z}),$.length>0&&e.jsxs("div",{className:"dust-results",children:[e.jsxs("div",{className:"results-header",children:[e.jsxs("h3",{children:["Token Accounts (",$.length,")"]}),e.jsx("button",{className:"select-all-btn",onClick:B,children:F.size===$.length?"Deselect All":"Select All"})]}),e.jsxs("div",{className:"results-table",children:[e.jsxs("div",{className:"table-header",children:[e.jsx("span",{className:"col-check"}),e.jsx("span",{className:"col-token",children:"Token"}),e.jsx("span",{className:"col-balance",children:"Balance"}),e.jsx("span",{className:"col-value",children:"Value (USD)"}),e.jsx("span",{className:"col-rent",children:"Rent Locked"}),e.jsx("span",{className:"col-status",children:"Status"})]}),e.jsx("div",{className:"table-body",children:$.map(k=>{const P=G(k);return e.jsxs("div",{className:`table-row ${P} ${F.has(k.id)?"selected":""}`,onClick:()=>R(k.id),children:[e.jsx("span",{className:"col-check",children:e.jsx("input",{type:"checkbox",checked:F.has(k.id),onChange:()=>R(k.id),onClick:J=>J.stopPropagation()})}),e.jsxs("span",{className:"col-token",children:[e.jsx("span",{className:"token-symbol",children:k.symbol||"Unknown"}),e.jsxs("span",{className:"token-mint",children:[k.mint?.slice(0,6),"...",k.mint?.slice(-4)]})]}),e.jsx("span",{className:"col-balance",children:k.balance?.toLocaleString()||"0"}),e.jsxs("span",{className:"col-value",children:["$",k.valueUsd?.toFixed(4)||"0.0000"]}),e.jsx("span",{className:"col-rent",children:k.rentLamports?`${(k.rentLamports/1e9).toFixed(4)} SOL`:"~0.002 SOL"}),e.jsx("span",{className:`col-status status-${P}`,children:P==="empty"?"✓ Empty":P==="dust"?"⚠ Dust":"$ Value"})]},k.id)})})]})]}),F.size>0&&e.jsxs("div",{className:"dust-summary",children:[e.jsx("h3",{children:"Summary"}),e.jsxs("div",{className:"summary-grid",children:[e.jsxs("div",{className:"summary-item",children:[e.jsx("span",{className:"summary-label",children:"Accounts to Close"}),e.jsx("span",{className:"summary-value",children:F.size})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("span",{className:"summary-label",children:"Tokens to Burn"}),e.jsx("span",{className:"summary-value",children:c?$.filter(k=>F.has(k.id)&&k.balance>0).length:0})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("span",{className:"summary-label",children:"Est. SOL Recovery"}),e.jsx("span",{className:"summary-value highlight",children:v?`~${v.estimatedSolRecovery?.toFixed(4)} SOL`:`~${(F.size*.00203928).toFixed(4)} SOL`})]}),e.jsxs("div",{className:"summary-item",children:[e.jsxs("span",{className:"summary-label",children:["Fee (",ne,"%)"]}),e.jsx("span",{className:"summary-value fee",children:v?`-${v.fee?.toFixed(4)} SOL`:`-${(F.size*.00203928*ne/100).toFixed(4)} SOL`})]}),e.jsxs("div",{className:"summary-item net",children:[e.jsx("span",{className:"summary-label",children:"Net SOL You Receive"}),e.jsx("span",{className:"summary-value net-value",children:v?`${v.netSolRecovery?.toFixed(4)} SOL`:`~${(F.size*.00203928*(1-ne/100)).toFixed(4)} SOL`})]})]}),e.jsxs("div",{className:"summary-actions",children:[e.jsx("button",{className:"dust-action-btn preview",onClick:q,disabled:X||F.size===0,children:X?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Previewing..."]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-icon",children:"👁️"}),"Preview"]})}),e.jsx("button",{className:"dust-action-btn execute",onClick:()=>Q(),disabled:E||!v,children:E?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-spinner"}),"Executing..."]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"btn-icon",children:"⚡"}),"Execute Cleanup"]})})]})]}),se&&le&&e.jsx(an,{data:le,onClose:()=>U(!1)}),e.jsx("style",{children:oa})]}):e.jsxs("div",{className:"dust-buster-container",children:[e.jsxs("div",{className:"dust-buster-locked",children:[e.jsx("div",{className:"locked-icon",children:"🔒"}),e.jsx("h3",{children:"Wallet Locked"}),e.jsx("p",{children:"Please unlock your wallet to use Dust Buster"})]}),e.jsx("style",{children:oa})]})}function an({data:t,onClose:a}){return e.jsxs("div",{className:"dust-complete-overlay",children:[e.jsx("div",{className:"confetti-container",children:[...Array(50)].map((i,s)=>e.jsx("div",{className:"confetti-piece",style:{"--delay":`${Math.random()*3}s`,"--x":`${Math.random()*100}vw`,"--rotation":`${Math.random()*360}deg`,"--color":["#00D4FF","#39FF14","#FFD700","#FF6B6B","#9945FF"][Math.floor(Math.random()*5)]}},s))}),e.jsx(Za,{isVisible:!0,onClose:a,title:"Dust Busted!",position:"center",message:e.jsxs("div",{className:"complete-content",children:[e.jsxs("div",{className:"complete-stats",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-label",children:"Accounts Closed"}),e.jsx("span",{className:"stat-value",children:t.accountsClosed})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("span",{className:"stat-label",children:"Tokens Burned"}),e.jsx("span",{className:"stat-value",children:t.tokensBurned})]}),e.jsxs("div",{className:"stat-item highlight",children:[e.jsx("span",{className:"stat-label",children:"SOL Recovered"}),e.jsxs("span",{className:"stat-value",children:[t.solRecovered?.toFixed(4)," SOL"]})]})]}),e.jsxs("div",{className:"lifetime-stats",children:[e.jsx("span",{className:"lifetime-label",children:"Lifetime Recovered:"}),e.jsxs("span",{className:"lifetime-value",children:[t.lifetimeTotal?.toFixed(4)," SOL"]})]}),t.txHash&&e.jsx("a",{href:`https://solscan.io/tx/${t.txHash}`,target:"_blank",rel:"noopener noreferrer",className:"tx-link",children:"View Transaction ↗"})]}),actions:e.jsx("button",{className:"complete-close-btn",onClick:a,children:"Close"})}),e.jsx("style",{children:nn})]})}const oa=`
  .dust-buster-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background: #0f0f0f;
    border-radius: 16px;
    max-width: 800px;
    margin: 0 auto;
  }

  .dust-buster-locked {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .locked-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .dust-buster-locked h3 {
    font-size: 20px;
    color: #fff;
    margin: 0 0 8px;
  }

  .dust-buster-locked p {
    color: #666;
    font-size: 14px;
    margin: 0;
  }

  .dust-buster-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid #252525;
  }

  .dust-header-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a1a, #252525);
    border-radius: 14px;
    border: 1px solid #333;
  }

  .dust-header-text h2 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 4px;
  }

  .dust-header-text p {
    font-size: 14px;
    color: #888;
    margin: 0;
  }

  .dust-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background: #1a1a1a;
    border-radius: 12px;
    border: 1px solid #252525;
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .control-label {
    font-size: 13px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .threshold-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .threshold-pill {
    padding: 10px 20px;
    background: #252525;
    border: 1px solid #333;
    border-radius: 20px;
    color: #888;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .threshold-pill:hover {
    border-color: #00D4FF;
    color: #00D4FF;
  }

  .threshold-pill.active {
    background: linear-gradient(135deg, #00D4FF, #0099FF);
    border-color: #00D4FF;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }

  .custom-slider-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }

  .custom-slider {
    flex: 1;
    height: 6px;
    background: #333;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }

  .custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #00D4FF, #0099FF);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }

  .slider-value {
    font-size: 16px;
    font-weight: 700;
    color: #00D4FF;
    min-width: 60px;
    text-align: right;
  }

  .mode-toggle {
    display: flex;
    gap: 12px;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 16px;
    background: #252525;
    border: 1px solid #333;
    border-radius: 10px;
    color: #888;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    border-color: #00D4FF;
    color: #fff;
  }

  .mode-btn.active {
    background: #1a1a1a;
    border-color: #00D4FF;
    color: #00D4FF;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
  }

  .mode-icon {
    font-size: 18px;
  }

  .mode-hint {
    font-size: 12px;
    color: #555;
    font-style: italic;
  }

  .dust-actions-row {
    display: flex;
    gap: 12px;
  }

  .dust-action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .dust-action-btn.scan {
    background: linear-gradient(135deg, #00D4FF, #0099FF);
    color: #000;
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
  }

  .dust-action-btn.preview {
    background: #252525;
    border: 1px solid #333;
    color: #fff;
  }

  .dust-action-btn.execute {
    background: linear-gradient(135deg, #39FF14, #00D4FF);
    color: #000;
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.3);
  }

  .dust-action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .dust-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn-icon {
    font-size: 18px;
  }

  .btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .dust-error {
    padding: 14px;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid #FF6B6B;
    border-radius: 10px;
    color: #FF6B6B;
    font-size: 14px;
    text-align: center;
  }

  .dust-success {
    padding: 14px;
    background: rgba(57, 255, 20, 0.15);
    border: 1px solid #39FF14;
    border-radius: 10px;
    color: #39FF14;
    font-size: 14px;
    text-align: center;
  }

  .dust-results {
    background: #1a1a1a;
    border: 1px solid #252525;
    border-radius: 12px;
    overflow: hidden;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #252525;
  }

  .results-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0;
  }

  .select-all-btn {
    background: none;
    border: 1px solid #333;
    padding: 6px 12px;
    border-radius: 6px;
    color: #888;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .select-all-btn:hover {
    border-color: #00D4FF;
    color: #00D4FF;
  }

  .results-table {
    overflow-x: auto;
  }

  .table-header {
    display: grid;
    grid-template-columns: 40px 2fr 1fr 1fr 1fr 100px;
    gap: 12px;
    padding: 12px 20px;
    background: #0f0f0f;
    font-size: 11px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-body {
    max-height: 300px;
    overflow-y: auto;
  }

  .table-row {
    display: grid;
    grid-template-columns: 40px 2fr 1fr 1fr 1fr 100px;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid #252525;
    cursor: pointer;
    transition: background 0.2s;
  }

  .table-row:hover {
    background: #252525;
  }

  .table-row.selected {
    background: rgba(0, 212, 255, 0.1);
  }

  .table-row.empty {
    border-left: 3px solid #39FF14;
  }

  .table-row.dust {
    border-left: 3px solid #FFD700;
  }

  .col-check {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .col-check input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #00D4FF;
    cursor: pointer;
  }

  .col-token {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .token-symbol {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }

  .token-mint {
    font-size: 11px;
    color: #555;
    font-family: monospace;
  }

  .col-balance,
  .col-value,
  .col-rent {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #ccc;
  }

  .col-status {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
  }

  .status-empty {
    color: #39FF14;
  }

  .status-dust {
    color: #FFD700;
  }

  .status-valuable {
    color: #FF6B6B;
  }

  .dust-summary {
    background: #1a1a1a;
    border: 1px solid #252525;
    border-radius: 12px;
    padding: 20px;
  }

  .dust-summary h3 {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 16px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #0f0f0f;
    border-radius: 8px;
  }

  .summary-item.net {
    grid-column: span 2;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(57, 255, 20, 0.1));
    border: 1px solid #00D4FF;
  }

  .summary-label {
    font-size: 13px;
    color: #888;
  }

  .summary-value {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .summary-value.highlight {
    color: #00D4FF;
  }

  .summary-value.fee {
    color: #FF6B6B;
  }

  .summary-value.net-value {
    color: #39FF14;
    font-size: 18px;
  }

  .summary-actions {
    display: flex;
    gap: 12px;
  }

  @media (max-width: 600px) {
    .table-header,
    .table-row {
      grid-template-columns: 30px 1fr 1fr 80px;
    }

    .col-value,
    .col-rent {
      display: none;
    }

    .threshold-pills {
      flex-wrap: wrap;
    }

    .mode-toggle {
      flex-direction: column;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .summary-item.net {
      grid-column: span 1;
    }

    .summary-actions {
      flex-direction: column;
    }
  }
`,nn=`
  .dust-complete-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.9);
  }

  .confetti-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--color);
    top: -10px;
    left: var(--x);
    transform: rotate(var(--rotation));
    animation: confetti-fall 3s ease-in var(--delay) infinite;
  }

  @keyframes confetti-fall {
    0% {
      top: -10px;
      opacity: 1;
    }
    100% {
      top: 110vh;
      opacity: 0;
      transform: rotate(calc(var(--rotation) + 720deg));
    }
  }

  .complete-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .complete-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #333;
  }

  .stat-item.highlight {
    border-bottom: none;
    padding-top: 12px;
  }

  .stat-label {
    font-size: 13px;
    color: #888;
  }

  .stat-value {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .stat-item.highlight .stat-value {
    color: #39FF14;
    font-size: 18px;
  }

  .lifetime-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 8px;
    margin-top: 8px;
  }

  .lifetime-label {
    font-size: 12px;
    color: #00D4FF;
  }

  .lifetime-value {
    font-size: 14px;
    font-weight: 700;
    color: #00D4FF;
  }

  .tx-link {
    display: inline-block;
    color: #00D4FF;
    font-size: 13px;
    text-decoration: none;
    margin-top: 8px;
  }

  .tx-link:hover {
    text-decoration: underline;
  }

  .complete-close-btn {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, #00D4FF, #0099FF);
    border: none;
    border-radius: 8px;
    color: #000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .complete-close-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
  }
`,qe=t=>{const a=new Uint8Array(t);let i="";for(const s of a)i+=String.fromCharCode(s);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")},la=t=>{for(t=t.replace(/-/g,"+").replace(/_/g,"/");t.length%4;)t+="=";const a=atob(t),i=new Uint8Array(a.length);for(let s=0;s<a.length;s++)i[s]=a.charCodeAt(s);return i};function jt({children:t,className:a="",style:i={},onClick:s}){return e.jsx("div",{className:`wallet-bento-tile ${a}`,onClick:s,style:{background:"#0f0f0f",border:"1px solid #222",borderRadius:12,padding:16,position:"relative",cursor:s?"pointer":"default",transition:"border-color 0.2s, box-shadow 0.2s",display:"flex",flexDirection:"column",...i},onMouseEnter:o=>{o.currentTarget.style.borderColor="#333",o.currentTarget.style.boxShadow="0 0 20px rgba(0,212,255,0.1)"},onMouseLeave:o=>{o.currentTarget.style.borderColor="#222",o.currentTarget.style.boxShadow="none"},children:t})}function wt({children:t,color:a="#555"}){return e.jsx("div",{style:{fontSize:10,fontWeight:700,color:a,textTransform:"uppercase",letterSpacing:1,marginBottom:12},children:t})}const sn={major:{label:"Major Networks",chains:["solana","ethereum","polygon","base","bsc"]},layer2:{label:"Layer 2",chains:["arbitrum","optimism","zksync","linea","scroll","mantle"]},other:{label:"Other Networks",chains:["avalanche","fantom","cronos","gnosis","celo","moonbeam","moonriver","harmony","metis","aurora","kava","evmos"]}},ca=["Your portfolio is looking great!","Ready to make moves?","Stay vigilant, stay profitable!","DeFi awaits your next play.","Diversification is key!","HODL strong, trade smart.","The market never sleeps!"],We={mnemonic:{term:"Recovery Phrase",definition:"A 12 or 24 word phrase that backs up your wallet. Anyone with these words can access your funds. Never share it!"},privateKey:{term:"Private Key",definition:"A secret code that proves ownership of your wallet. Keep it safe and never share it with anyone."},gasEstimate:{term:"Gas Fee",definition:"A small fee paid to process your transaction on the blockchain. Varies by network congestion."},hdWallet:{term:"HD Wallet",definition:"One recovery phrase creates addresses on multiple blockchains. All your crypto in one place."}},he={solana:{name:"Solana",symbol:"SOL",color:"#9945FF",gradient:"linear-gradient(135deg, #9945FF, #14F195)",icon:"◎"},ethereum:{name:"Ethereum",symbol:"ETH",color:"#627EEA",gradient:"linear-gradient(135deg, #627EEA, #454A75)",icon:"Ξ"},polygon:{name:"Polygon",symbol:"MATIC",color:"#8247E5",gradient:"linear-gradient(135deg, #8247E5, #A46EFF)",icon:"⬡"},base:{name:"Base",symbol:"ETH",color:"#0052FF",gradient:"linear-gradient(135deg, #0052FF, #3B7AFF)",icon:"⬡"},arbitrum:{name:"Arbitrum",symbol:"ETH",color:"#28A0F0",gradient:"linear-gradient(135deg, #28A0F0, #1B6CB0)",icon:"⬡"},bsc:{name:"BSC",symbol:"BNB",color:"#F3BA2F",gradient:"linear-gradient(135deg, #F3BA2F, #E8A914)",icon:"⬡"},avalanche:{name:"Avalanche",symbol:"AVAX",color:"#E84142",gradient:"linear-gradient(135deg, #E84142, #C73032)",icon:"⬡"},fantom:{name:"Fantom",symbol:"FTM",color:"#1969FF",gradient:"linear-gradient(135deg, #1969FF, #0D4FC5)",icon:"⬡"},optimism:{name:"Optimism",symbol:"ETH",color:"#FF0420",gradient:"linear-gradient(135deg, #FF0420, #CC031A)",icon:"⬡"},cronos:{name:"Cronos",symbol:"CRO",color:"#002D74",gradient:"linear-gradient(135deg, #002D74, #001A45)",icon:"⬡"},gnosis:{name:"Gnosis",symbol:"xDAI",color:"#04795B",gradient:"linear-gradient(135deg, #04795B, #035F47)",icon:"⬡"},celo:{name:"Celo",symbol:"CELO",color:"#35D07F",gradient:"linear-gradient(135deg, #35D07F, #28A865)",icon:"⬡"},moonbeam:{name:"Moonbeam",symbol:"GLMR",color:"#53CBC8",gradient:"linear-gradient(135deg, #53CBC8, #3FA3A1)",icon:"⬡"},moonriver:{name:"Moonriver",symbol:"MOVR",color:"#F2B705",gradient:"linear-gradient(135deg, #F2B705, #C99504)",icon:"⬡"},harmony:{name:"Harmony",symbol:"ONE",color:"#00AEE9",gradient:"linear-gradient(135deg, #00AEE9, #0090C1)",icon:"⬡"},metis:{name:"Metis",symbol:"METIS",color:"#00D2FF",gradient:"linear-gradient(135deg, #00D2FF, #00A8CC)",icon:"⬡"},aurora:{name:"Aurora",symbol:"ETH",color:"#70D44B",gradient:"linear-gradient(135deg, #70D44B, #59B03C)",icon:"⬡"},zksync:{name:"zkSync",symbol:"ETH",color:"#4E529A",gradient:"linear-gradient(135deg, #4E529A, #3D417A)",icon:"⬡"},linea:{name:"Linea",symbol:"ETH",color:"#121212",gradient:"linear-gradient(135deg, #61DFFF, #4BB8D6)",icon:"⬡"},scroll:{name:"Scroll",symbol:"ETH",color:"#FFEEDA",gradient:"linear-gradient(135deg, #FFEEDA, #E8D4C0)",icon:"⬡"},mantle:{name:"Mantle",symbol:"MNT",color:"#000000",gradient:"linear-gradient(135deg, #65B3AE, #4E908C)",icon:"⬡"},kava:{name:"Kava",symbol:"KAVA",color:"#FF564F",gradient:"linear-gradient(135deg, #FF564F, #E84842)",icon:"⬡"},evmos:{name:"Evmos",symbol:"EVMOS",color:"#ED4E33",gradient:"linear-gradient(135deg, #ED4E33, #C94229)",icon:"⬡"}};function rn({userId:t}){const a=xa(),[i,s]=n.useState("landing"),[o,p]=n.useState(""),[h,x]=n.useState(""),[u,c]=n.useState(""),[j,g]=n.useState(""),[y,F]=n.useState(""),[m,v]=n.useState(""),[f,D]=n.useState(""),[L,X]=n.useState(!1),[O,E]=n.useState(""),[b,H]=n.useState("solana"),[I,Z]=n.useState(""),[Y,se]=n.useState(""),[U,le]=n.useState(""),[ae,ne]=n.useState(null),[de,w]=n.useState(!1),[z,q]=n.useState(null),[Q,R]=n.useState(!1),[B,G]=n.useState("major"),[$,k]=n.useState(!1),[P,J]=n.useState(""),[d,l]=n.useState(""),[C,W]=n.useState(!1),[_,K]=n.useState(!1),[re,me]=n.useState(!1),[ie,Tt]=n.useState("solana"),[At,Xe]=n.useState("sol"),[Qe,zt]=n.useState(""),[Bt,Ze]=n.useState(!1),[Dt,Ne]=n.useState(""),[Cn,Rt]=n.useState(null),[ma,Pt]=n.useState(!1),[Wt,Et]=n.useState([]),[pe,Lt]=n.useState({address:"So11111111111111111111111111111111111111112",symbol:"SOL",name:"Solana",decimals:9,logoURI:null}),[xe,It]=n.useState(null),[we,et]=n.useState(""),[ze,Le]=n.useState("50"),[ce,Te]=n.useState(null),[Ie,tt]=n.useState(!1),[Mt,at]=n.useState(!1),[Me,nt]=n.useState(""),[_t,fe]=n.useState(""),[$t,st]=n.useState(""),[rt,it]=n.useState(""),[ot,lt]=n.useState(""),[Ot,_e]=n.useState(!1),[Ut,$e]=n.useState(!1),[ct,fa]=n.useState(!1),[Vt,dt]=n.useState(!1);n.useEffect(()=>{ba()},[t]);const ba=async()=>{try{const r=localStorage.getItem("sessionToken");if(!r)return;const N=await fetch("/api/webauthn/has-credentials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:r,usedFor:"wallet"})});if(N.ok){const M=await N.json();fa(M.hasCredentials)}}catch(r){console.error("Failed to check biometric wallet status:",r)}},ya=async()=>{const r=localStorage.getItem("sessionToken");if(!r)throw new Error("No session");const N=await fetch("/api/webauthn/authentication/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:r,usedFor:"wallet"})});if(!N.ok){const ge=await N.json();throw new Error(ge.error||"Failed to start biometric verification")}const{challengeId:M,options:oe}=await N.json(),Se={...oe,challenge:la(oe.challenge),allowCredentials:oe.allowCredentials.map(ge=>({...ge,id:la(ge.id)}))},ee=await navigator.credentials.get({publicKey:Se}),ue=await fetch("/api/webauthn/authentication/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:r,challengeId:M,credential:{id:ee.id,rawId:qe(ee.rawId),type:ee.type,response:{clientDataJSON:qe(ee.response.clientDataJSON),authenticatorData:qe(ee.response.authenticatorData),signature:qe(ee.response.signature)}},usedFor:"wallet"})});if(!ue.ok){const ge=await ue.json();throw new Error(ge.error||"Biometric verification failed")}return!0};n.useEffect(()=>{a.hasWallet&&(a.isUnlocked?s("main"):s("unlock"))},[a.hasWallet,a.isUnlocked]);const ke=()=>{x(""),c("")},va=async()=>{if(ke(),!y||y.length<8){x("Password must be at least 8 characters");return}if(y!==m){x("Passwords do not match");return}try{const r=O.trim()||`Wallet ${a.wallets.length+1}`,N=await a.createWallet(y,r,12);p(N),X(!0),s("backup"),E(""),c("Wallet created! Save your recovery phrase now.")}catch(r){x(r.message)}},ja=async()=>{if(ke(),!j.trim()){x("Please enter your recovery phrase");return}if(!y||y.length<8){x("Password must be at least 8 characters");return}if(y!==m){x("Passwords do not match");return}try{const r=O.trim()||`Imported Wallet ${a.wallets.length+1}`;await a.importWallet(j.trim(),y,r),s("main"),E(""),c("Wallet imported successfully!")}catch(r){x(r.message)}},Ht=async()=>{ke();try{await a.unlock(f),s("main")}catch(r){x(r.message||"Invalid password")}},wa=async()=>{if(!I||!Y||!a.addresses)return;const r=a.addresses[b];if(r)try{const M=await(await fetch("/api/wallet/estimate-gas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chain:b,from:r,to:I,amount:Y})})).json();M.success&&ne(M)}catch(N){console.error("Gas estimate error:",N)}};n.useEffect(()=>{if(I&&Y&&parseFloat(Y)>0){const r=setTimeout(wa,500);return()=>clearTimeout(r)}},[I,Y,b]);const ka=async()=>{if(ke(),!I||!Y||!U){x("Please fill in all fields including password");return}try{if(ct){dt(!0);try{await ya()}catch(N){dt(!1),x("Biometric verification failed: "+N.message);return}dt(!1)}const r=await a.signAndSend(U,b,I,Y);if(!r.success)throw new Error(r.error);c(`Transaction sent! Hash: ${r.txHash?.slice(0,20)}...`),Z(""),se(""),le(""),ne(null),w(!1)}catch(r){x(r.message)}},Sa=()=>{a.lock(),D(""),s("unlock")},Fa=()=>{confirm("Are you sure? This will remove your wallet from this device. Make sure you have your recovery phrase saved!")&&(a.activeWalletId&&a.deleteWallet(a.activeWalletId),a.hasWallet||s("landing"))},qt=async()=>{if(ke(),!P){x("Please enter your password");return}K(!0);try{const r=await Zt.unlock(P,a.activeWalletId);l(r.mnemonic),W(!1),x("")}catch{x("Invalid password. Please try again.")}finally{K(!1)}},pt=()=>{k(!1),J(""),l(""),W(!1),x("")},Ca=async()=>{Ze(!0),Ne("");try{const r=ie==="solana"?a.addresses?.solana:a.addresses?.ethereum;if(!r){Ne("Wallet address not available");return}const N=await fetch("/api/crypto/onramp/create-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({walletAddress:r,network:ie,currency:At,amount:Qe?parseFloat(Qe):void 0})}),M=await N.json();if(!N.ok){M.needsSetup?Ne("Stripe Crypto Onramp is not enabled. To enable it, visit your Stripe Dashboard and apply for access to the Crypto Onramp feature."):Ne(M.error||"Failed to create onramp session");return}M.redirectUrl?(window.open(M.redirectUrl,"_blank"),xt()):M.clientSecret&&Rt(M)}catch(r){Ne(r.message||"Failed to connect to onramp service")}finally{Ze(!1)}},xt=()=>{me(!1),Tt("solana"),Xe("sol"),zt(""),Ne(""),Ze(!1),Rt(null)},Na=async()=>{try{const N=await(await fetch("/api/swap/tokens")).json();N.success&&N.tokens&&Et(N.tokens)}catch(r){console.error("Failed to fetch swap tokens:",r)}},Ta=async()=>{if(!pe||!xe||!we||parseFloat(we)<=0){Te(null);return}tt(!0),fe("");try{const r=Math.floor(parseFloat(we)*Math.pow(10,pe.decimals)).toString(),N=new URLSearchParams({inputMint:pe.address,outputMint:xe.address,amount:r,slippageBps:ze}),oe=await(await fetch(`/api/swap/quote?${N}`)).json();oe.success?Te(oe):(fe(oe.error||"Failed to get quote"),Te(null))}catch(r){fe(r.message||"Failed to get quote"),Te(null)}finally{tt(!1)}},Aa=async()=>{if(!ce||!Me){fe("Please enter your password");return}if(!ce?.quoteResponse){fe("Quote data is missing. Please get a new quote.");return}if(!a?.addresses?.solana){fe("Wallet not ready. Please unlock your wallet first.");return}at(!0),fe(""),st("");try{const N=await(await fetch("/api/swap/prepare",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({quoteResponse:ce.quoteResponse,userPublicKey:a.addresses.solana})})).json();if(!N.success)throw new Error(N.error||"Failed to prepare swap");const M=await Zt.signSolanaTransaction(Me,N.swapTransaction,a.activeWalletId),Se=await(await fetch("/api/swap/broadcast",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({signedTransaction:M})})).json();if(Se.success)st(`Swap successful! View on explorer: ${Se.explorerUrl}`),Te(null),et(""),nt("");else throw new Error(Se.error||"Failed to broadcast transaction")}catch(r){fe(r.message||"Swap failed")}finally{at(!1)}},Gt=()=>{Pt(!1),Et([]),Lt({address:"So11111111111111111111111111111111111111112",symbol:"SOL",name:"Solana",decimals:9,logoURI:null}),It(null),et(""),Le("50"),Te(null),tt(!1),at(!1),nt(""),fe(""),st(""),it(""),lt(""),_e(!1),$e(!1)};n.useEffect(()=>{if(pe&&xe&&we&&parseFloat(we)>0){const r=setTimeout(Ta,500);return()=>clearTimeout(r)}},[pe,xe,we,ze]);const gt=r=>{navigator.clipboard.writeText(r),c("Address copied!"),setTimeout(()=>c(""),2e3)},za=r=>{H(r),w(!0)},Ba=()=>e.jsxs("div",{className:"wallet-landing-v2",children:[e.jsxs("div",{className:"wallet-hero",children:[e.jsx("div",{className:"wallet-hero-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"walletGrad",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#00D4FF"}),e.jsx("stop",{offset:"100%",stopColor:"#0099FF"})]})}),e.jsx("rect",{x:"2",y:"6",width:"20",height:"14",rx:"3",stroke:"url(#walletGrad)",strokeWidth:"2"}),e.jsx("path",{d:"M22 10h-4a2 2 0 100 4h4",stroke:"url(#walletGrad)",strokeWidth:"2"}),e.jsx("circle",{cx:"18",cy:"12",r:"1.5",fill:"#00D4FF"})]})}),e.jsx("h1",{children:"Multi-Chain Wallet"}),e.jsxs("p",{children:["One seed phrase. All your crypto.",e.jsx(Pe,{definition:We.hdWallet})]})]}),e.jsx("div",{className:"wallet-chains-showcase",children:Object.entries(he).map(([r,N],M)=>e.jsxs("div",{className:"wallet-chain-card",style:{"--chain-color":N.color,"--chain-gradient":N.gradient,animationDelay:`${M*.1}s`},children:[e.jsx("span",{className:"chain-icon",children:N.icon}),e.jsx("span",{className:"chain-name",children:N.name})]},r))}),e.jsxs("div",{className:"wallet-features",children:[e.jsxs("div",{className:"wallet-feature",children:[e.jsx("span",{className:"feature-icon",children:"🔐"}),e.jsx("span",{children:"Client-side encryption"})]}),e.jsxs("div",{className:"wallet-feature",children:[e.jsx("span",{className:"feature-icon",children:"⚡"}),e.jsx("span",{children:"Instant transactions"})]}),e.jsxs("div",{className:"wallet-feature",children:[e.jsx("span",{className:"feature-icon",children:"🛡️"}),e.jsx("span",{children:"Non-custodial"})]})]}),e.jsxs("div",{className:"wallet-cta-group",children:[e.jsxs("button",{className:"wallet-cta primary",onClick:()=>s("create"),children:[e.jsx("span",{className:"cta-icon",children:"+"}),"Create New Wallet"]}),e.jsxs("button",{className:"wallet-cta secondary",onClick:()=>s("import"),children:[e.jsx("span",{className:"cta-icon",children:"↓"}),"Import Existing"]})]})]}),Da=()=>e.jsxs("div",{className:"wallet-form-v2",children:[e.jsx("button",{className:"wallet-back-btn",onClick:()=>{s("landing"),ke()},children:"← Back"}),e.jsxs("div",{className:"form-header",children:[e.jsx("div",{className:"form-icon create",children:e.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:"#00D4FF",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 8v8M8 12h8"})]})}),e.jsx("h2",{children:"Create Your Wallet"}),e.jsx("p",{children:"Set a strong password to protect your wallet"})]}),e.jsxs("div",{className:"form-fields",children:[e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Wallet Name (optional)"}),e.jsx("input",{type:"text",value:O,onChange:r=>E(r.target.value),placeholder:"My Trading Wallet"}),e.jsx("span",{className:"field-hint",children:"Give your wallet a memorable name"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Password"}),e.jsx("input",{type:"password",value:y,onChange:r=>F(r.target.value),placeholder:"Minimum 8 characters"}),e.jsx("span",{className:"field-hint",children:"Used to encrypt your wallet locally"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Confirm Password"}),e.jsx("input",{type:"password",value:m,onChange:r=>v(r.target.value),placeholder:"Re-enter password"})]})]}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:va,disabled:a.loading,children:a.loading?"Creating...":"Create Wallet"})]}),Ra=()=>e.jsxs("div",{className:"wallet-form-v2",children:[e.jsxs("div",{className:"form-header warning",children:[e.jsx("div",{className:"form-icon warning",children:e.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:"#FF6B6B",strokeWidth:"2",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("h2",{children:"Save Your Recovery Phrase"}),e.jsxs("p",{className:"warning-text",children:["Write these words down in order. This is the ONLY way to recover your wallet!",e.jsx(Pe,{definition:We.mnemonic})]})]}),e.jsx("div",{className:"mnemonic-grid",children:o?.split(" ").map((r,N)=>e.jsxs("div",{className:"mnemonic-word",children:[e.jsx("span",{className:"word-num",children:N+1}),e.jsx("span",{className:"word-text",children:L?r:"•••••"})]},N))}),e.jsx("button",{className:"wallet-cta secondary full-width",onClick:()=>X(!L),children:L?"🙈 Hide Words":"👁️ Reveal Words"}),u&&e.jsx("div",{className:"form-success",children:u}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:()=>{p(""),s("main")},children:"I've Saved My Phrase ✓"})]}),Pa=()=>e.jsxs("div",{className:"wallet-form-v2",children:[e.jsx("button",{className:"wallet-back-btn",onClick:()=>{s("landing"),ke()},children:"← Back"}),e.jsxs("div",{className:"form-header",children:[e.jsx("div",{className:"form-icon import",children:e.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:"#00D4FF",strokeWidth:"2",children:[e.jsx("path",{d:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"}),e.jsx("polyline",{points:"7,10 12,15 17,10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]})}),e.jsx("h2",{children:"Import Wallet"}),e.jsx("p",{children:"Enter your 12 or 24 word recovery phrase"})]}),e.jsxs("div",{className:"form-fields",children:[e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{children:["Recovery Phrase",e.jsx(Pe,{definition:We.mnemonic})]}),e.jsx("textarea",{value:j,onChange:r=>g(r.target.value),placeholder:"word1 word2 word3 ...",rows:3})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Wallet Name (optional)"}),e.jsx("input",{type:"text",value:O,onChange:r=>E(r.target.value),placeholder:"Imported Wallet"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"New Password"}),e.jsx("input",{type:"password",value:y,onChange:r=>F(r.target.value),placeholder:"Minimum 8 characters"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Confirm Password"}),e.jsx("input",{type:"password",value:m,onChange:r=>v(r.target.value),placeholder:"Re-enter password"})]})]}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:ja,disabled:a.loading,children:a.loading?"Importing...":"Import Wallet"})]}),Wa=()=>e.jsxs("div",{className:"wallet-form-v2 unlock",children:[e.jsxs("div",{className:"unlock-icon",children:[e.jsx("div",{className:"lock-glow"}),e.jsxs("svg",{width:"64",height:"64",viewBox:"0 0 24 24",fill:"none",stroke:"#00D4FF",strokeWidth:"1.5",children:[e.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2"}),e.jsx("path",{d:"M7 11V7a5 5 0 0110 0v4"})]})]}),e.jsx("h2",{children:"Welcome Back"}),e.jsx("p",{children:"Enter your password to unlock"}),e.jsx("div",{className:"form-field single",children:e.jsx("input",{type:"password",value:f,onChange:r=>D(r.target.value),placeholder:"Enter password",onKeyDown:r=>r.key==="Enter"&&Ht(),autoFocus:!0})}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:Ht,disabled:a.loading,children:a.loading?"Unlocking...":"Unlock Wallet"}),e.jsx("button",{className:"wallet-link",onClick:Fa,children:"Remove wallet from this device"})]}),[ut,Be]=n.useState(!1),[Ea,Oe]=n.useState(null),[ht,De]=n.useState(""),[Ue,mt]=n.useState(null),[ft,bt]=n.useState(""),Kt=async()=>{if(!(!Ue||!ft))try{await a.switchWallet(Ue,ft),mt(null),bt(""),c("Wallet switched!")}catch(r){x(r.message||"Failed to switch wallet")}},Yt=r=>{ht.trim()&&(a.renameWallet(r,ht.trim()),Oe(null),De(""),c("Wallet renamed!"))},La=r=>{const N=a.wallets.find(M=>M.id===r);confirm(`Delete wallet "${N?.name}"? Make sure you have your recovery phrase saved!`)&&(a.deleteWallet(r),Be(!1))},Ia=a.wallets.find(r=>r.id===a.activeWalletId),Ma=n.useMemo(()=>ca[Math.floor(Math.random()*ca.length)],[]);n.useMemo(()=>{if(!a.addresses)return[];const r=Object.entries(a.addresses).filter(([M])=>he[M]),N=[];for(let M=0;M<r.length;M+=2)N.push(r.slice(M,M+2));return N},[a.addresses]);const _a=()=>e.jsxs("div",{className:"wallet-main-v2",children:[e.jsxs("div",{className:"wallet-selector-bar",children:[e.jsxs("div",{className:"wallet-selector",onClick:()=>Be(!ut),children:[e.jsx("span",{className:"wallet-selector-icon",children:"💼"}),e.jsx("span",{className:"wallet-selector-name",children:Ia?.name||"My Wallet"}),e.jsx("span",{className:"wallet-selector-arrow",children:ut?"▲":"▼"})]}),ut&&e.jsxs("div",{className:"wallet-dropdown",children:[e.jsx("div",{className:"wallet-dropdown-header",children:"Your Wallets"}),a.wallets.map(r=>e.jsx("div",{className:`wallet-dropdown-item ${r.id===a.activeWalletId?"active":""}`,children:Ea===r.id?e.jsxs("div",{className:"wallet-rename-inline",children:[e.jsx("input",{type:"text",value:ht,onChange:N=>De(N.target.value),placeholder:r.name,autoFocus:!0,onKeyDown:N=>{N.key==="Enter"&&Yt(r.id),N.key==="Escape"&&(Oe(null),De(""))}}),e.jsx("button",{onClick:()=>Yt(r.id),children:"✓"}),e.jsx("button",{onClick:()=>{Oe(null),De("")},children:"✕"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"wallet-item-name",onClick:()=>{r.id!==a.activeWalletId&&(mt(r.id),Be(!1))},children:[r.name,r.id===a.activeWalletId&&e.jsx("span",{className:"active-badge",children:"Active"})]}),e.jsxs("div",{className:"wallet-item-actions",children:[e.jsx("button",{title:"Rename",onClick:N=>{N.stopPropagation(),Oe(r.id),De(r.name)},children:"✏️"}),a.wallets.length>1&&e.jsx("button",{title:"Delete",onClick:N=>{N.stopPropagation(),La(r.id)},children:"🗑️"})]})]})},r.id)),e.jsx("div",{className:"wallet-dropdown-divider"}),e.jsxs("button",{className:"wallet-dropdown-add",onClick:()=>{Be(!1),s("create")},children:[e.jsx("span",{children:"+"})," Add New Wallet"]}),e.jsxs("button",{className:"wallet-dropdown-add import",onClick:()=>{Be(!1),s("import")},children:[e.jsx("span",{children:"↓"})," Import Wallet"]})]})]}),Ue&&e.jsx("div",{className:"wallet-switch-modal",children:e.jsxs("div",{className:"wallet-switch-content",children:[e.jsx("h3",{children:"Switch Wallet"}),e.jsxs("p",{children:['Enter password for "',a.wallets.find(r=>r.id===Ue)?.name,'"']}),e.jsx("input",{type:"password",value:ft,onChange:r=>bt(r.target.value),placeholder:"Enter wallet password",autoFocus:!0,onKeyDown:r=>r.key==="Enter"&&Kt()}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsxs("div",{className:"wallet-switch-actions",children:[e.jsx("button",{className:"wallet-cta secondary",onClick:()=>{mt(null),bt(""),x("")},children:"Cancel"}),e.jsx("button",{className:"wallet-cta primary",onClick:Kt,children:"Unlock & Switch"})]})]})}),e.jsxs("div",{className:"wallet-hero-premium",children:[e.jsx("div",{className:"wallet-hero-glow"}),e.jsxs("div",{className:"wallet-hero-content",children:[e.jsxs("div",{className:"wallet-hero-balance",children:[e.jsx("span",{className:"hero-balance-label",children:"Total Balance"}),e.jsxs("span",{className:"hero-balance-value",children:["$",a.totalUsd.toFixed(2)]}),e.jsxs("div",{className:"hero-actions",children:[e.jsx("button",{className:"hero-action-btn",onClick:a.refreshBalances,children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M23 4v6h-6M1 20v-6h6"}),e.jsx("path",{d:"M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"})]})}),e.jsx("button",{className:"hero-action-btn lock",onClick:Sa,children:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"3",y:"11",width:"18",height:"11",rx:"2"}),e.jsx("path",{d:"M7 11V7a5 5 0 0110 0v4"})]})})]})]}),e.jsxs("div",{className:"wallet-hero-agent",children:[e.jsxs("div",{className:"speech-bubble",children:[e.jsx("span",{children:Ma}),e.jsx("div",{className:"speech-bubble-tail"})]}),e.jsx("img",{src:"/agents/pixar/marcus.png",alt:"Marcus",className:"agent-image"})]})]})]}),u&&e.jsx("div",{className:"form-success",children:u}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsxs("div",{className:"wallet-bento-grid",children:[e.jsxs(jt,{className:"chains-tile",style:{gridColumn:"span 8"},children:[e.jsx(wt,{color:"#00D4FF",children:"Your Networks"}),e.jsx("div",{className:"chain-accordion",children:Object.entries(sn).map(([r,N])=>{const M=B===r,oe=N.chains.filter(ee=>a.addresses?.[ee]),Se=oe.reduce((ee,ue)=>ee+(a.balances[ue]?.usd||0),0);return e.jsxs("div",{className:"chain-category",children:[e.jsxs("div",{className:`chain-category-header ${M?"expanded":""}`,onClick:()=>G(M?null:r),children:[e.jsxs("div",{className:"category-info",children:[e.jsx("span",{className:"category-label",children:N.label}),e.jsxs("span",{className:"category-count",children:[oe.length," networks"]})]}),e.jsxs("div",{className:"category-right",children:[e.jsxs("span",{className:"category-total",children:["$",Se.toFixed(2)]}),e.jsx("span",{className:"category-arrow",children:M?"▲":"▼"})]})]}),M&&e.jsxs("div",{className:"chain-category-content",children:[oe.map(ee=>{const ue=he[ee],ge=a.addresses[ee],Ve=a.balances[ee],yt=z===ee;return e.jsxs("div",{className:`chain-accordion-item ${yt?"expanded":""}`,style:{"--chain-color":ue.color},children:[e.jsxs("div",{className:"chain-item-header",onClick:()=>q(yt?null:ee),children:[e.jsxs("div",{className:"chain-item-left",children:[e.jsx("span",{className:"chain-icon",style:{color:ue.color},children:ue.icon}),e.jsx("span",{className:"chain-name",children:ue.name})]}),e.jsxs("div",{className:"chain-item-right",children:[e.jsxs("span",{className:"chain-balance",children:[Ve?Ve.balance:"0"," ",ue.symbol]}),e.jsxs("span",{className:"chain-usd",children:["$",Ve?Ve.usd.toFixed(2):"0.00"]})]})]}),yt&&e.jsxs("div",{className:"chain-item-details",children:[e.jsxs("div",{className:"chain-address",onClick:Re=>{Re.stopPropagation(),gt(ge)},children:[e.jsxs("span",{children:[ge?.slice(0,12),"...",ge?.slice(-8)]}),e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"9",y:"9",width:"13",height:"13",rx:"2"}),e.jsx("path",{d:"M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"})]})]}),e.jsxs("div",{className:"chain-item-actions",children:[e.jsxs("button",{onClick:Re=>{Re.stopPropagation(),za(ee)},children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"22",y1:"2",x2:"11",y2:"13"}),e.jsx("polygon",{points:"22,2 15,22 11,13 2,9"})]}),"Send"]}),e.jsxs("button",{onClick:Re=>{Re.stopPropagation(),gt(ge)},children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"}),e.jsx("polyline",{points:"7,10 12,15 17,10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),"Receive"]})]})]})]},ee)}),oe.length===0&&e.jsx("div",{className:"no-chains-message",children:"No wallets in this category"})]})]},r)})})]}),e.jsxs(jt,{className:"quick-actions-tile",style:{gridColumn:"span 4"},children:[e.jsx(wt,{color:"#00D4FF",children:"Quick Actions"}),e.jsxs("div",{className:"quick-actions-bento",children:[e.jsxs("button",{className:"quick-action-btn",onClick:()=>{H("solana"),w(!0)},children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("line",{x1:"22",y1:"2",x2:"11",y2:"13"}),e.jsx("polygon",{points:"22,2 15,22 11,13 2,9"})]}),e.jsx("span",{children:"Send"})]}),e.jsxs("button",{className:"quick-action-btn",onClick:()=>a.addresses?.solana&&gt(a.addresses.solana),children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"}),e.jsx("polyline",{points:"7,10 12,15 17,10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),e.jsx("span",{children:"Receive"})]}),e.jsxs("button",{className:"quick-action-btn swap",onClick:()=>{Pt(!0),Na()},children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M16 3l4 4-4 4"}),e.jsx("path",{d:"M20 7H4"}),e.jsx("path",{d:"M8 21l-4-4 4-4"}),e.jsx("path",{d:"M4 17h16"})]}),e.jsx("span",{children:"Swap"})]}),e.jsxs("button",{className:"quick-action-btn buy",onClick:()=>me(!0),children:[e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"})}),e.jsx("span",{children:"Buy"})]}),a.addresses?.solana&&e.jsxs("button",{className:"quick-action-btn dust",onClick:()=>R(!0),children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M3 6h18M3 6l2 14h14l2-14M3 6l4-4h10l4 4"}),e.jsx("path",{d:"M9 10v6M12 10v6M15 10v6"})]}),e.jsx("span",{children:"Dust Buster"})]}),e.jsxs("button",{className:"quick-action-btn backup",onClick:()=>k(!0),children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 15V3M12 3l-4 4M12 3l4 4"}),e.jsx("path",{d:"M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"})]}),e.jsx("span",{children:"Backup"})]})]})]}),e.jsxs(jt,{className:"multisig-tile",style:{gridColumn:"span 12"},children:[e.jsx(wt,{color:"#9945FF",children:"Multi-Sig Wallets"}),e.jsxs("div",{className:"multisig-placeholder",children:[e.jsx("div",{className:"multisig-icon",children:e.jsxs("svg",{width:"48",height:"48",viewBox:"0 0 24 24",fill:"none",stroke:"#9945FF",strokeWidth:"1.5",children:[e.jsx("path",{d:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"}),e.jsx("circle",{cx:"9",cy:"7",r:"4"}),e.jsx("path",{d:"M23 21v-2a4 4 0 00-3-3.87"}),e.jsx("path",{d:"M16 3.13a4 4 0 010 7.75"})]})}),e.jsxs("div",{className:"multisig-info",children:[e.jsx("h4",{children:"Team Vaults & Multi-Signature Wallets"}),e.jsx("p",{children:"Create secure multi-sig wallets that require multiple approvals for transactions. Perfect for teams, DAOs, and organizations."}),e.jsx("span",{className:"coming-soon-badge",children:"Coming Soon"})]})]})]})]}),Q&&e.jsx("div",{className:"dust-buster-overlay",onClick:()=>R(!1),children:e.jsxs("div",{className:"dust-buster-panel",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"dust-buster-header",children:[e.jsx("h3",{children:"Dust Buster"}),e.jsx("button",{className:"close-btn",onClick:()=>R(!1),children:"×"})]}),e.jsx(tn,{walletAddress:a.addresses?.solana,onClose:()=>R(!1)})]})}),de&&e.jsx("div",{className:"send-overlay",onClick:()=>w(!1),children:e.jsxs("div",{className:"send-panel",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"send-header",children:[e.jsxs("h3",{children:["Send ",he[b]?.symbol]}),e.jsx("button",{className:"close-btn",onClick:()=>w(!1),children:"×"})]}),e.jsxs("div",{className:"send-chain-preview",children:[e.jsx("span",{style:{color:he[b]?.color},children:he[b]?.icon}),e.jsx("span",{children:he[b]?.name})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Recipient Address"}),e.jsx("input",{type:"text",value:I,onChange:r=>Z(r.target.value),placeholder:"Enter recipient address"})]}),e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{children:["Amount (",he[b]?.symbol,")"]}),e.jsx("input",{type:"number",value:Y,onChange:r=>se(r.target.value),placeholder:"0.0",step:"0.001"})]}),e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{children:["Wallet Password",e.jsx(Pe,{definition:We.privateKey})]}),e.jsx("input",{type:"password",value:U,onChange:r=>le(r.target.value),placeholder:"Enter password to sign"})]}),ae&&e.jsxs("div",{className:"gas-estimate",children:[e.jsxs("span",{children:["Network Fee",e.jsx(Pe,{definition:We.gasEstimate})]}),e.jsxs("span",{children:[ae.gasFee," ",he[b]?.symbol]})]}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:ka,disabled:a.loading||Vt||!I||!Y||!U,children:Vt?"👆 Verify Biometric...":a.loading?"Sending...":ct?"👆 Send with Biometric":"Send Transaction"}),ct&&e.jsx("div",{style:{fontSize:10,color:"#39FF14",textAlign:"center",marginTop:4},children:"Biometric confirmation enabled"})]})}),$&&e.jsx("div",{className:"recovery-overlay",onClick:pt,children:e.jsxs("div",{className:"recovery-panel",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"recovery-header",children:[e.jsx("h3",{children:"View Recovery Phrase"}),e.jsx("button",{className:"close-btn",onClick:pt,children:"×"})]}),d?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"recovery-warning active",children:[e.jsx("div",{className:"warning-icon",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"#FF6B6B",strokeWidth:"2",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsxs("div",{className:"warning-content",children:[e.jsx("strong",{children:"Keep This Secret!"}),e.jsx("p",{children:"Write these words down on paper. Store them in a safe place. Never take a screenshot or save digitally."})]})]}),e.jsx("div",{className:"mnemonic-grid recovery",children:d.split(" ").map((r,N)=>e.jsxs("div",{className:"mnemonic-word",children:[e.jsx("span",{className:"word-num",children:N+1}),e.jsx("span",{className:"word-text",children:C?r:"•••••"})]},N))}),e.jsx("button",{className:"wallet-cta secondary full-width",onClick:()=>W(!C),children:C?"🙈 Hide Words":"👁️ Reveal Words"}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:pt,children:"Done"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"recovery-warning",children:[e.jsx("div",{className:"warning-icon",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"#FF6B6B",strokeWidth:"2",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsxs("div",{className:"warning-content",children:[e.jsx("strong",{children:"Sensitive Information"}),e.jsx("p",{children:"Your recovery phrase grants full access to your wallet. Never share it with anyone or enter it on untrusted websites."})]})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Enter your password to continue"}),e.jsx("input",{type:"password",value:P,onChange:r=>J(r.target.value),placeholder:"Enter wallet password",onKeyDown:r=>r.key==="Enter"&&qt(),autoFocus:!0})]}),h&&e.jsx("div",{className:"form-error",children:h}),e.jsx("button",{className:"wallet-cta primary full-width",onClick:qt,disabled:_||!P,children:_?"Verifying...":"View Recovery Phrase"})]})]})}),re&&e.jsx("div",{className:"buy-overlay",onClick:xt,children:e.jsxs("div",{className:"buy-panel",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"buy-header",children:[e.jsx("h3",{children:"Buy Crypto"}),e.jsx("button",{className:"close-btn",onClick:xt,children:"×"})]}),e.jsxs("div",{className:"buy-info",children:[e.jsx("div",{className:"buy-info-icon",children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 16v-4M12 8h.01"})]})}),e.jsx("span",{children:"Purchase crypto directly with your card via Stripe"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Network"}),e.jsxs("select",{value:ie,onChange:r=>{Tt(r.target.value),Xe(r.target.value==="solana"?"sol":"eth")},children:[e.jsx("option",{value:"solana",children:"Solana"}),e.jsx("option",{value:"ethereum",children:"Ethereum"}),e.jsx("option",{value:"polygon",children:"Polygon"}),e.jsx("option",{value:"base",children:"Base"}),e.jsx("option",{value:"arbitrum",children:"Arbitrum"})]})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Currency"}),e.jsx("select",{value:At,onChange:r=>Xe(r.target.value),children:ie==="solana"?e.jsxs(e.Fragment,{children:[e.jsx("option",{value:"sol",children:"SOL"}),e.jsx("option",{value:"usdc",children:"USDC"})]}):e.jsxs(e.Fragment,{children:[e.jsx("option",{value:"eth",children:"ETH"}),e.jsx("option",{value:"usdc",children:"USDC"})]})})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Amount (USD)"}),e.jsx("input",{type:"number",value:Qe,onChange:r=>zt(r.target.value),placeholder:"Enter amount in USD (optional)",min:"1",step:"1"}),e.jsx("span",{className:"field-hint",children:"Leave empty to choose amount on Stripe"})]}),e.jsxs("div",{className:"buy-destination",children:[e.jsx("label",{children:"Destination Wallet"}),e.jsxs("div",{className:"destination-address",children:[e.jsx("span",{className:"destination-network",children:he[ie]?.icon}),e.jsx("span",{className:"destination-addr",children:ie==="solana"?a.addresses?.solana?.slice(0,8)+"..."+a.addresses?.solana?.slice(-6):a.addresses?.ethereum?.slice(0,8)+"..."+a.addresses?.ethereum?.slice(-6)})]})]}),Dt&&e.jsxs("div",{className:"form-error buy-error",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 8v4M12 16h.01"})]}),e.jsx("span",{children:Dt})]}),e.jsx("button",{className:"wallet-cta primary full-width stripe-btn",onClick:Ca,disabled:Bt,children:Bt?"Connecting to Stripe...":e.jsxs(e.Fragment,{children:[e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("rect",{x:"1",y:"4",width:"22",height:"16",rx:"2"}),e.jsx("line",{x1:"1",y1:"10",x2:"23",y2:"10"})]}),"Buy with Stripe"]})}),e.jsx("p",{className:"buy-disclaimer",children:"Powered by Stripe. Available for US customers only."})]})}),ma&&e.jsx("div",{className:"swap-overlay",onClick:Gt,children:e.jsxs("div",{className:"swap-panel",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"swap-header",children:[e.jsx("h3",{children:"Swap Tokens"}),e.jsx("button",{className:"close-btn",onClick:Gt,children:"×"})]}),e.jsxs("div",{className:"swap-info",children:[e.jsx("div",{className:"swap-info-icon",children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 16v-4M12 8h.01"})]})}),e.jsx("span",{children:"Swap tokens on Solana via Jupiter"})]}),e.jsxs("div",{className:"swap-token-selector",children:[e.jsx("label",{children:"From"}),e.jsxs("div",{className:"token-select-wrapper",children:[e.jsxs("button",{className:"token-select-btn",onClick:()=>{_e(!Ot),$e(!1)},children:[pe?.logoURI&&e.jsx("img",{src:pe.logoURI,alt:"",className:"token-logo"}),e.jsx("span",{className:"token-symbol",children:pe?.symbol||"Select token"}),e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("polyline",{points:"6,9 12,15 18,9"})})]}),Ot&&e.jsxs("div",{className:"token-dropdown",children:[e.jsx("input",{type:"text",placeholder:"Search tokens...",value:rt,onChange:r=>it(r.target.value),className:"token-search"}),e.jsx("div",{className:"token-list",children:Wt.filter(r=>r.symbol.toLowerCase().includes(rt.toLowerCase())||r.name.toLowerCase().includes(rt.toLowerCase())).map(r=>e.jsxs("button",{className:`token-option ${pe?.address===r.address?"selected":""}`,onClick:()=>{Lt(r),_e(!1),it("")},children:[r.logoURI&&e.jsx("img",{src:r.logoURI,alt:"",className:"token-logo"}),e.jsxs("div",{className:"token-info",children:[e.jsx("span",{className:"token-symbol",children:r.symbol}),e.jsx("span",{className:"token-name",children:r.name})]})]},r.address))})]})]}),e.jsx("input",{type:"number",value:we,onChange:r=>et(r.target.value),placeholder:"0.0",className:"swap-amount-input"})]}),e.jsx("div",{className:"swap-arrow",children:e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M12 5v14M5 12l7 7 7-7"})})}),e.jsxs("div",{className:"swap-token-selector",children:[e.jsx("label",{children:"To"}),e.jsxs("div",{className:"token-select-wrapper",children:[e.jsxs("button",{className:"token-select-btn",onClick:()=>{$e(!Ut),_e(!1)},children:[xe?.logoURI&&e.jsx("img",{src:xe.logoURI,alt:"",className:"token-logo"}),e.jsx("span",{className:"token-symbol",children:xe?.symbol||"Select token"}),e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("polyline",{points:"6,9 12,15 18,9"})})]}),Ut&&e.jsxs("div",{className:"token-dropdown",children:[e.jsx("input",{type:"text",placeholder:"Search tokens...",value:ot,onChange:r=>lt(r.target.value),className:"token-search"}),e.jsx("div",{className:"token-list",children:Wt.filter(r=>r.symbol.toLowerCase().includes(ot.toLowerCase())||r.name.toLowerCase().includes(ot.toLowerCase())).filter(r=>r.address!==pe?.address).map(r=>e.jsxs("button",{className:`token-option ${xe?.address===r.address?"selected":""}`,onClick:()=>{It(r),$e(!1),lt("")},children:[r.logoURI&&e.jsx("img",{src:r.logoURI,alt:"",className:"token-logo"}),e.jsxs("div",{className:"token-info",children:[e.jsx("span",{className:"token-symbol",children:r.symbol}),e.jsx("span",{className:"token-name",children:r.name})]})]},r.address))})]})]}),ce&&e.jsxs("div",{className:"swap-output-amount",children:["≈ ",(parseFloat(ce.outputAmount)/Math.pow(10,xe?.decimals||9)).toFixed(6)," ",xe?.symbol]})]}),e.jsxs("div",{className:"swap-slippage",children:[e.jsx("label",{children:"Slippage Tolerance"}),e.jsxs("div",{className:"slippage-options",children:[e.jsx("button",{className:`slippage-btn ${ze==="50"?"active":""}`,onClick:()=>Le("50"),children:"0.5%"}),e.jsx("button",{className:`slippage-btn ${ze==="100"?"active":""}`,onClick:()=>Le("100"),children:"1%"}),e.jsx("button",{className:`slippage-btn ${ze==="300"?"active":""}`,onClick:()=>Le("300"),children:"3%"})]})]}),Ie&&e.jsxs("div",{className:"swap-loading",children:[e.jsx("div",{className:"swap-spinner"}),e.jsx("span",{children:"Fetching best route..."})]}),ce&&!Ie&&e.jsxs("div",{className:"swap-quote-details",children:[e.jsxs("div",{className:"quote-row",children:[e.jsx("span",{children:"Rate"}),e.jsxs("span",{children:["1 ",pe?.symbol," ≈ ",(parseFloat(ce.outputAmount)/parseFloat(ce.inputAmount)).toFixed(6)," ",xe?.symbol]})]}),e.jsxs("div",{className:"quote-row",children:[e.jsx("span",{children:"Price Impact"}),e.jsxs("span",{className:parseFloat(ce.priceImpactPct)>1?"high-impact":"",children:[ce.priceImpactPct,"%"]})]})]}),ce&&!Ie&&e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Wallet Password"}),e.jsx("input",{type:"password",value:Me,onChange:r=>nt(r.target.value),placeholder:"Enter password to sign"})]}),_t&&e.jsxs("div",{className:"form-error swap-error",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M12 8v4M12 16h.01"})]}),e.jsx("span",{children:_t})]}),$t&&e.jsx("div",{className:"form-success swap-success",children:e.jsx("span",{children:$t})}),e.jsx("button",{className:"wallet-cta primary full-width swap-execute-btn",onClick:Aa,disabled:!ce||Ie||Mt||!Me,children:Mt?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"swap-spinner small"}),"Swapping..."]}):"Execute Swap"}),e.jsx("p",{className:"swap-disclaimer",children:"Powered by Jupiter. Swaps are executed on Solana."})]})})]});return e.jsxs("div",{className:"wallet-manager-v2",children:[i==="landing"&&Ba(),i==="create"&&Da(),i==="backup"&&Ra(),i==="import"&&Pa(),i==="unlock"&&Wa(),i==="main"&&_a(),e.jsx("style",{children:`
        .wallet-manager-v2 {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .wallet-landing-v2 {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 32px;
        }

        .wallet-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .wallet-hero-icon {
          width: 100px;
          height: 100px;
          background: #1a1a1a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #00D4FF;
          box-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
          animation: heroGlow 3s ease-in-out infinite;
        }

        @keyframes heroGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.3); }
          50% { box-shadow: 0 0 60px rgba(0, 212, 255, 0.5); }
        }

        .wallet-hero h1 {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .wallet-hero p {
          color: #888;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-chains-showcase {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .wallet-chain-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #1a1a1a;
          border: 1px solid var(--chain-color);
          border-radius: 24px;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .wallet-chain-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(var(--chain-color), 0.2);
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(10px); }
        }

        .wallet-chain-card .chain-icon {
          font-size: 18px;
        }

        .wallet-chain-card .chain-name {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }

        .wallet-features {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .wallet-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 14px;
        }

        .feature-icon {
          font-size: 18px;
        }

        .wallet-cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
        }

        .wallet-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .wallet-cta.primary {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          color: #000;
        }

        .wallet-cta.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 212, 255, 0.4);
        }

        .wallet-cta.secondary {
          background: #1a1a1a;
          color: #fff;
          border: 1px solid #333;
        }

        .wallet-cta.secondary:hover {
          border-color: #00D4FF;
        }

        .wallet-cta:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wallet-cta.full-width {
          width: 100%;
        }

        .cta-icon {
          font-size: 20px;
        }

        .wallet-form-v2 {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 400px;
          margin: 0 auto;
        }

        .wallet-back-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
        }

        .wallet-back-btn:hover {
          color: #00D4FF;
        }

        .form-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .form-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          border: 2px solid #00D4FF;
        }

        .form-icon.warning {
          border-color: #FF6B6B;
        }

        .form-header h2 {
          font-size: 24px;
          color: #fff;
          margin: 0;
        }

        .form-header p {
          color: #888;
          font-size: 14px;
          margin: 0;
        }

        .form-header .warning-text {
          color: #FF6B6B;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          color: #888;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          outline: none;
          border-color: #00D4FF;
        }

        .form-field textarea {
          resize: vertical;
          min-height: 80px;
          font-family: monospace;
        }

        .field-hint {
          font-size: 12px;
          color: #666;
        }

        .form-error {
          padding: 14px;
          background: rgba(255, 107, 107, 0.15);
          border: 1px solid #FF6B6B;
          border-radius: 10px;
          color: #FF6B6B;
          font-size: 14px;
          text-align: center;
        }

        .form-success {
          padding: 14px;
          background: rgba(57, 255, 20, 0.15);
          border: 1px solid #39FF14;
          border-radius: 10px;
          color: #39FF14;
          font-size: 14px;
          text-align: center;
        }

        .mnemonic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 20px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 16px;
        }

        .mnemonic-word {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #1a1a1a;
          border-radius: 8px;
        }

        .word-num {
          font-size: 11px;
          color: #555;
          min-width: 18px;
        }

        .word-text {
          font-family: monospace;
          font-size: 13px;
          color: #fff;
        }

        .wallet-form-v2.unlock {
          align-items: center;
          text-align: center;
          padding-top: 40px;
        }

        .unlock-icon {
          position: relative;
          margin-bottom: 16px;
        }

        .lock-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
          animation: lockPulse 2s ease-in-out infinite;
        }

        @keyframes lockPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .form-field.single {
          width: 100%;
          max-width: 300px;
        }

        .wallet-link {
          background: none;
          border: none;
          color: #555;
          font-size: 13px;
          cursor: pointer;
          margin-top: 16px;
        }

        .wallet-link:hover {
          color: #FF6B6B;
        }

        .wallet-main-v2 {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .wallet-total-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          text-align: center;
        }

        .total-label {
          display: block;
          color: #888;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .total-value {
          display: block;
          font-size: 42px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
        }

        .total-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #252525;
          border: 1px solid #333;
          border-radius: 8px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #00D4FF;
          color: #00D4FF;
        }

        .action-btn.lock:hover {
          border-color: #FF6B6B;
          color: #FF6B6B;
        }

        .wallet-chains-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wallet-chain-v2 {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wallet-chain-v2:hover {
          border-color: var(--chain-color);
        }

        .wallet-chain-v2.active {
          border-color: var(--chain-color);
          box-shadow: 0 0 20px rgba(var(--chain-color), 0.15);
        }

        .chain-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chain-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chain-icon-lg {
          font-size: 28px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f0f;
          border-radius: 12px;
        }

        .chain-info {
          display: flex;
          flex-direction: column;
        }

        .chain-info .chain-name {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .chain-info .chain-symbol {
          font-size: 13px;
          color: #666;
        }

        .chain-balance {
          text-align: right;
        }

        .balance-crypto {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .balance-usd {
          display: block;
          font-size: 13px;
          color: #888;
        }

        .chain-address {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 10px 12px;
          background: #0f0f0f;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chain-address:hover {
          color: #00D4FF;
        }

        .chain-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .chain-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .chain-action-btn.send {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          color: #000;
        }

        .chain-action-btn.receive {
          background: #252525;
          color: #fff;
          border: 1px solid #333;
        }

        .chain-action-btn:hover {
          transform: translateY(-2px);
        }

        .send-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .send-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .send-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .send-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #666;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .close-btn:hover {
          color: #fff;
        }

        .send-chain-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #0f0f0f;
          border-radius: 10px;
          font-size: 16px;
          color: #fff;
        }

        .gas-estimate {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #0f0f0f;
          border-radius: 10px;
          font-size: 14px;
          color: #888;
        }

        .gas-estimate span:first-child {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Recovery Phrase Modal */
        .recovery-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .recovery-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .recovery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recovery-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .recovery-warning {
          display: flex;
          gap: 14px;
          padding: 16px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
        }

        .recovery-warning.active {
          background: rgba(255, 107, 107, 0.15);
          border-color: rgba(255, 107, 107, 0.5);
        }

        .recovery-warning .warning-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .recovery-warning .warning-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .recovery-warning .warning-content strong {
          color: #FF6B6B;
          font-size: 14px;
        }

        .recovery-warning .warning-content p {
          color: #ccc;
          font-size: 13px;
          margin: 0;
          line-height: 1.4;
        }

        .mnemonic-grid.recovery {
          margin-top: 8px;
        }

        .quick-action-card.backup .quick-action-icon {
          background: linear-gradient(135deg, #FF6B6B, #FF4757);
        }

        .quick-action-icon.backup {
          background: linear-gradient(135deg, #FF6B6B, #FF4757);
        }

        /* Wallet Selector */
        .wallet-selector-bar {
          position: relative;
          margin-bottom: 20px;
        }
        
        .wallet-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .wallet-selector:hover {
          border-color: #00D4FF;
        }
        
        .wallet-selector-icon {
          font-size: 20px;
        }
        
        .wallet-selector-name {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .wallet-selector-arrow {
          color: #666;
          font-size: 10px;
        }
        
        .wallet-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        
        .wallet-dropdown-header {
          padding: 12px 16px;
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          border-bottom: 1px solid #252525;
        }
        
        .wallet-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #252525;
          transition: background 0.2s ease;
        }
        
        .wallet-dropdown-item:hover {
          background: #252525;
        }
        
        .wallet-dropdown-item.active {
          background: rgba(0, 212, 255, 0.1);
        }
        
        .wallet-item-name {
          flex: 1;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .active-badge {
          font-size: 10px;
          padding: 2px 8px;
          background: rgba(0, 212, 255, 0.2);
          color: #00D4FF;
          border-radius: 10px;
        }
        
        .wallet-item-actions {
          display: flex;
          gap: 4px;
        }
        
        .wallet-item-actions button {
          background: none;
          border: none;
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .wallet-item-actions button:hover {
          background: #333;
        }
        
        .wallet-rename-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        
        .wallet-rename-inline input {
          flex: 1;
          padding: 6px 10px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }
        
        .wallet-rename-inline button {
          background: none;
          border: none;
          color: #888;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
        }
        
        .wallet-rename-inline button:hover {
          color: #fff;
        }
        
        .wallet-dropdown-divider {
          height: 1px;
          background: #333;
        }
        
        .wallet-dropdown-add {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: #00D4FF;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }
        
        .wallet-dropdown-add:hover {
          background: rgba(0, 212, 255, 0.1);
        }
        
        .wallet-dropdown-add.import {
          color: #9D4EDD;
        }
        
        .wallet-dropdown-add.import:hover {
          background: rgba(157, 78, 221, 0.1);
        }
        
        .wallet-switch-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .wallet-switch-content {
          background: #1a1a1a;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #333;
          width: 90%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .wallet-switch-content h3 {
          margin: 0;
          color: #fff;
          font-size: 20px;
        }
        
        .wallet-switch-content p {
          margin: 0;
          color: #888;
          font-size: 14px;
        }
        
        .wallet-switch-content input {
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
        }
        
        .wallet-switch-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        
        .wallet-switch-actions button {
          flex: 1;
        }

        /* Dust Buster Card */
        .dust-buster-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
          border: 1px solid #333;
          border-radius: 12px;
          margin-top: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dust-buster-card:hover {
          border-color: #00D4FF;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
          transform: translateY(-2px);
        }

        .dust-buster-icon {
          width: 48px;
          height: 48px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dust-buster-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dust-buster-title {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        .dust-buster-subtitle {
          color: #888;
          font-size: 13px;
        }

        /* Dust Buster Overlay */
        .dust-buster-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px;
          z-index: 1000;
          overflow-y: auto;
        }

        .dust-buster-panel {
          background: #0f0f0f;
          border-radius: 16px;
          border: 1px solid #333;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .dust-buster-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #333;
          position: sticky;
          top: 0;
          background: #0f0f0f;
          z-index: 10;
        }

        .dust-buster-header h3 {
          margin: 0;
          color: #fff;
          font-size: 20px;
        }

        /* ========== PREMIUM WALLET STYLES ========== */
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes balanceGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3); }
          50% { text-shadow: 0 0 30px rgba(0, 212, 255, 0.7), 0 0 60px rgba(0, 212, 255, 0.4); }
        }
        
        @keyframes floatAgent {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        /* Premium Hero Section */
        .wallet-hero-premium {
          position: relative;
          background: linear-gradient(135deg, #0f0f0f 0%, #141414 50%, #1a1a1a 100%);
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .wallet-hero-glow {
          position: absolute;
          top: 50%;
          left: 30%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .wallet-hero-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        
        .wallet-hero-balance {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .hero-balance-label {
          font-size: 14px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .hero-balance-value {
          font-size: 42px;
          font-weight: 700;
          color: #fff;
          animation: balanceGlow 3s ease-in-out infinite;
          line-height: 1.1;
        }
        
        .hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        
        .hero-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #252525;
          border: 1px solid #333;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .hero-action-btn:hover {
          border-color: #00D4FF;
          color: #00D4FF;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
        }
        
        .hero-action-btn.lock:hover {
          border-color: #FF6B6B;
          color: #FF6B6B;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
        }
        
        .wallet-hero-agent {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .agent-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #00D4FF;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          animation: floatAgent 4s ease-in-out infinite;
        }
        
        .speech-bubble {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 10px 14px;
          max-width: 140px;
          font-size: 12px;
          color: #ccc;
          margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .speech-bubble-tail {
          position: absolute;
          bottom: -8px;
          right: 30px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #333;
        }
        
        .speech-bubble-tail::after {
          content: '';
          position: absolute;
          top: -9px;
          left: -7px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid #1a1a1a;
        }
        
        /* Section Titles */
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 16px 0;
        }
        
        /* Chain Carousel */
        .chain-carousel-container {
          margin-bottom: 24px;
        }
        
        .chain-carousel {
          border-radius: 16px;
          overflow: visible;
        }
        
        .chain-slide {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
          padding: 8px;
        }
        
        .no-chains {
          padding: 40px;
          text-align: center;
          color: #666;
        }
        
        /* Premium Chain Card */
        .chain-card-premium {
          position: relative;
          background: #141414;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .chain-card-premium::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: var(--chain-gradient);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .chain-card-premium:hover::before {
          opacity: 1;
        }
        
        .chain-card-premium:hover {
          transform: perspective(1000px) rotateY(3deg) translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px color-mix(in srgb, var(--chain-color) 30%, transparent);
        }
        
        .chain-card-premium.expanded {
          background: #1a1a1a;
        }
        
        .chain-card-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 4s infinite;
          pointer-events: none;
          border-radius: 16px;
        }
        
        .chain-card-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .chain-card-icon {
          font-size: 28px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f0f;
          border-radius: 12px;
          border: 1px solid #333;
        }
        
        .chain-card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .chain-card-name {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .chain-card-symbol {
          font-size: 13px;
          color: #666;
        }
        
        .chain-card-balance {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .chain-balance-crypto {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        .chain-balance-usd {
          font-size: 13px;
          color: #888;
        }
        
        /* Accordion Chain Details */
        .accordion-chain-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #333;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .accordion-address {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .accordion-address:hover {
          border-color: #00D4FF;
          color: #00D4FF;
        }
        
        .address-text {
          flex: 1;
          font-family: monospace;
          font-size: 11px;
          color: #888;
          word-break: break-all;
        }
        
        .accordion-actions {
          display: flex;
          gap: 10px;
        }
        
        .accordion-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }
        
        .accordion-action.send {
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          color: #000;
        }
        
        .accordion-action.receive {
          background: #252525;
          color: #fff;
          border: 1px solid #333;
        }
        
        .accordion-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .accordion-transactions {
          padding: 12px 14px;
          background: #0f0f0f;
          border-radius: 10px;
          text-align: center;
        }
        
        .transactions-placeholder {
          font-size: 13px;
          color: #555;
        }
        
        /* Quick Actions Hub */
        .quick-actions-hub {
          margin-bottom: 24px;
        }
        
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        .quick-action-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 16px;
          background: #141414;
          border: 1px solid #333;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .quick-action-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, #00D4FF, #0099FF);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .quick-action-card:hover::before {
          opacity: 1;
        }
        
        .quick-action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.2);
        }
        
        .quick-action-card.dust::before {
          background: linear-gradient(135deg, #9945FF, #14F195);
        }
        
        .quick-action-card.dust:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(153, 69, 255, 0.2);
        }
        
        .quick-action-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 14px;
          color: #00D4FF;
          transition: all 0.3s ease;
        }
        
        .quick-action-icon.receive {
          background: rgba(57, 255, 20, 0.1);
          color: #39FF14;
        }
        
        .quick-action-icon.dust {
          background: rgba(153, 69, 255, 0.1);
          color: #9945FF;
        }
        
        .quick-action-icon.buy {
          background: rgba(57, 255, 20, 0.1);
          color: #39FF14;
        }
        
        .quick-action-card.buy::before {
          background: linear-gradient(135deg, #39FF14, #00D4FF);
        }
        
        .quick-action-card.buy:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(57, 255, 20, 0.2);
        }

        /* Buy Crypto Modal */
        .buy-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .buy-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .buy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .buy-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .buy-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 12px;
          color: #00D4FF;
          font-size: 13px;
        }

        .buy-info-icon {
          flex-shrink: 0;
        }

        .buy-destination {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .buy-destination label {
          color: #888;
          font-size: 13px;
        }

        .destination-address {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 10px;
        }

        .destination-network {
          font-size: 18px;
        }

        .destination-addr {
          font-family: monospace;
          font-size: 14px;
          color: #888;
        }

        .buy-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .buy-error svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .stripe-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .stripe-btn svg {
          flex-shrink: 0;
        }

        .buy-disclaimer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        /* Swap Modal Styles */
        .swap-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .swap-panel {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .swap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .swap-header h3 {
          font-size: 20px;
          color: #fff;
          margin: 0;
        }

        .swap-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(153, 69, 255, 0.1);
          border: 1px solid rgba(153, 69, 255, 0.3);
          border-radius: 12px;
          color: #9945FF;
          font-size: 13px;
        }

        .swap-info-icon {
          flex-shrink: 0;
        }

        .swap-token-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 12px;
        }

        .swap-token-selector label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .token-select-wrapper {
          position: relative;
        }

        .token-select-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          cursor: pointer;
          width: 100%;
          transition: border-color 0.2s;
        }

        .token-select-btn:hover {
          border-color: #9945FF;
        }

        .token-logo {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .token-symbol {
          flex: 1;
          text-align: left;
          font-weight: 600;
        }

        .token-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          z-index: 10;
          max-height: 280px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .token-search {
          padding: 12px 16px;
          background: #0f0f0f;
          border: none;
          border-bottom: 1px solid #333;
          color: #fff;
          font-size: 14px;
        }

        .token-search:focus {
          outline: none;
        }

        .token-list {
          overflow-y: auto;
          max-height: 220px;
        }

        .token-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          width: 100%;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }

        .token-option:hover {
          background: rgba(153, 69, 255, 0.1);
        }

        .token-option.selected {
          background: rgba(153, 69, 255, 0.2);
        }

        .token-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .token-info .token-symbol {
          font-weight: 600;
          font-size: 14px;
        }

        .token-info .token-name {
          font-size: 12px;
          color: #888;
        }

        .swap-amount-input {
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .swap-amount-input:focus {
          outline: none;
          border-color: #9945FF;
        }

        .swap-arrow {
          display: flex;
          justify-content: center;
          color: #9945FF;
          margin: -8px 0;
        }

        .swap-output-amount {
          font-size: 18px;
          font-weight: 600;
          color: #14F195;
          padding: 12px 16px;
          background: rgba(20, 241, 149, 0.1);
          border-radius: 10px;
        }

        .swap-slippage {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .swap-slippage label {
          font-size: 13px;
          color: #888;
        }

        .slippage-options {
          display: flex;
          gap: 8px;
        }

        .slippage-btn {
          flex: 1;
          padding: 10px 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .slippage-btn:hover {
          border-color: #9945FF;
          color: #fff;
        }

        .slippage-btn.active {
          background: rgba(153, 69, 255, 0.2);
          border-color: #9945FF;
          color: #9945FF;
        }

        .swap-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px;
          color: #888;
        }

        .swap-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #333;
          border-top-color: #9945FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .swap-spinner.small {
          width: 18px;
          height: 18px;
          border-width: 2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .swap-quote-details {
          padding: 16px;
          background: #0f0f0f;
          border: 1px solid #333;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quote-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .quote-row span:first-child {
          color: #888;
        }

        .quote-row span:last-child {
          color: #fff;
        }

        .quote-row .high-impact {
          color: #FF6B6B;
        }

        .swap-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .swap-error svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .swap-success {
          word-break: break-all;
        }

        .swap-execute-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .swap-disclaimer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        .quick-action-icon.swap {
          background: rgba(153, 69, 255, 0.1);
          color: #9945FF;
        }

        .quick-action-card.swap::before {
          background: linear-gradient(135deg, #9945FF, #14F195);
        }

        .quick-action-card.swap:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(153, 69, 255, 0.3);
        }
        
        .quick-action-card:hover .quick-action-icon {
          transform: scale(1.1);
        }
        
        .quick-action-label {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        @media (max-width: 480px) {
          .wallet-hero h1 {
            font-size: 26px;
          }

          .mnemonic-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .wallet-features {
            flex-direction: column;
            gap: 12px;
          }

          .total-value {
            font-size: 32px;
          }

          .dust-buster-panel {
            max-width: 100%;
            border-radius: 12px;
          }

          .dust-buster-overlay {
            padding: 20px 12px;
          }
          
          /* Premium Responsive Styles */
          .wallet-hero-premium {
            padding: 20px 16px;
          }
          
          .wallet-hero-content {
            flex-direction: column;
            text-align: center;
          }
          
          .wallet-hero-balance {
            align-items: center;
          }
          
          .hero-balance-value {
            font-size: 36px;
          }
          
          .hero-actions {
            justify-content: center;
          }
          
          .wallet-hero-agent {
            order: -1;
            margin-bottom: 16px;
          }
          
          .agent-image {
            width: 80px;
            height: 80px;
          }
          
          .speech-bubble {
            position: relative;
            bottom: auto;
            right: auto;
            margin-bottom: 10px;
            max-width: 200px;
          }
          
          .speech-bubble-tail {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
          }
          
          .quick-actions-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          
          .quick-action-card {
            padding: 16px 10px;
          }
          
          .quick-action-icon {
            width: 40px;
            height: 40px;
          }
          
          .quick-action-icon svg {
            width: 20px;
            height: 20px;
          }
          
          .quick-action-label {
            font-size: 12px;
          }
          
          .chain-card-premium {
            padding: 14px;
          }
          
          .chain-card-icon {
            width: 40px;
            height: 40px;
            font-size: 22px;
          }
          
          .chain-card-name {
            font-size: 14px;
          }
          
          .chain-balance-crypto {
            font-size: 14px;
          }
          
          .accordion-actions {
            flex-direction: column;
          }
          
          .address-text {
            font-size: 10px;
          }
        }
      `})]})}function In({userId:t}){return e.jsx("div",{className:"tab-content wallet-tab",children:e.jsx(rn,{userId:t})})}const on=[{id:"pulse_pro",name:"Pulse Pro",badge:"MOST POPULAR",price:"$14.99",period:"/month",annualPrice:"$149.99",annualPeriod:"/year",savings:"Save $30/yr",description:"AI-powered predictions & unlimited searches",features:["Unlimited AI searches","Advanced AI predictions","Full technical analysis","Real-time price alerts","Fear & Greed analytics","Knowledge Base access","2-day free trial"],notIncluded:["StrikeAgent sniper bot","Multi-chain support","DWAV token rewards"],cta:"Start Free Trial",popular:!0,action:"upgradePulseMonthly",annualAction:"upgradePulseAnnual"},{id:"strike_agent",name:"StrikeAgent Elite",price:"$30",period:"/month",annualPrice:"$300",annualPeriod:"/year",savings:"Save $60/yr",description:"Full sniper bot with safety checks",features:["AI-powered sniper bot","Honeypot detection","Anti-MEV protection","Multi-chain support (23 chains)","Built-in wallet","Trade history & analytics","2-day free trial"],notIncluded:["AI predictions (Pulse Pro)","DWAV token rewards"],cta:"Start Free Trial",popular:!1,action:"upgradeStrikeMonthly",annualAction:"upgradeStrikeAnnual"},{id:"complete_bundle",name:"DarkWave Complete",badge:"BEST VALUE",price:"$39.99",period:"/month",annualPrice:"$399.99",annualPeriod:"/year",savings:"Save $80/yr + $5/mo vs separate",description:"Everything included - ultimate trading suite",features:["Everything in Pulse Pro","Everything in StrikeAgent Elite","Priority support","Early feature access","Guardian Bot access","Save $5/mo vs buying separately","2-day free trial"],notIncluded:[],cta:"Start Free Trial",popular:!1,action:"upgradeBundleMonthly",annualAction:"upgradeBundleAnnual"},{id:"founder",name:"Legacy Founder",badge:"GRANDFATHERED",price:"$24",period:"one-time",description:"6 months access + 35K DWAV tokens",features:["Full access for 6 months","35,000 DWAV tokens (Feb 14, 2026)","StrikeAgent access","Founding member badge","No recurring billing"],notIncluded:[],cta:"No Longer Available",popular:!1,disabled:!0,legacy:!0}];function Mn({userId:t,currentTier:a}){const[i,s]=n.useState(null),[o,p]=n.useState(""),[h,x]=n.useState("monthly"),u=async(c,j=!1)=>{const g=j?c.annualAction:c.action;if(g){s(c.id+(j?"_annual":"")),p("");try{let y="";switch(g){case"upgradePulseMonthly":y="/api/payments/stripe/create-pulse-monthly";break;case"upgradePulseAnnual":y="/api/payments/stripe/create-pulse-annual";break;case"upgradeStrikeMonthly":y="/api/payments/stripe/create-strike-monthly";break;case"upgradeStrikeAnnual":y="/api/payments/stripe/create-strike-annual";break;case"upgradeBundleMonthly":y="/api/payments/stripe/create-bundle-monthly";break;case"upgradeBundleAnnual":y="/api/payments/stripe/create-bundle-annual";break;case"upgradeLegacyFounder":y="/api/payments/stripe/create-founder";break;default:return}const m=await(await fetch(y,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId:t})})).json();m.url?window.location.href=m.url:m.error&&p(m.error)}catch(y){p(y.message||"Failed to start checkout")}finally{s(null)}}};return e.jsxs("div",{className:"tab-content pricing-tab",children:[e.jsxs("div",{className:"pricing-header",children:[e.jsx("h1",{children:"Choose Your Plan"}),e.jsx("p",{children:"Start your 2-day free trial • 3-day refund policy • Cancel anytime"}),e.jsxs("div",{className:"billing-toggle-wrapper",children:[e.jsxs("div",{className:"billing-toggle",children:[e.jsx("button",{className:`toggle-btn ${h==="monthly"?"active":""}`,onClick:()=>x("monthly"),children:"Monthly"}),e.jsx("button",{className:`toggle-btn ${h==="annual"?"active":""}`,onClick:()=>x("annual"),children:"Annual"})]}),e.jsx("span",{className:"save-badge-standalone",children:"Save up to 17%"})]})]}),o&&e.jsx("div",{className:"pricing-error",children:o}),e.jsx("div",{className:"pricing-grid",children:on.filter(c=>!c.legacy).map(c=>e.jsxs("div",{className:`pricing-card ${c.popular?"popular":""} ${a===c.id?"current":""}`,children:[c.badge&&e.jsx("div",{className:"pricing-badge",children:c.badge}),e.jsxs("div",{className:"pricing-card-header",children:[e.jsx("h2",{children:c.name}),e.jsxs("div",{className:"pricing-price",children:[e.jsx("span",{className:"price-amount",children:h==="annual"&&c.annualPrice?c.annualPrice:c.price}),e.jsx("span",{className:"price-period",children:h==="annual"&&c.annualPeriod?c.annualPeriod:c.period})]}),h==="annual"&&c.savings&&e.jsx("div",{className:"pricing-savings",children:c.savings}),e.jsx("p",{className:"pricing-description",children:c.description})]}),e.jsx("div",{className:"pricing-features",children:e.jsxs("ul",{className:"feature-list",children:[c.features.map((j,g)=>e.jsxs("li",{className:"feature-item included",children:[e.jsx("span",{className:"feature-icon",children:"✓"}),j]},g)),c.notIncluded.map((j,g)=>e.jsxs("li",{className:"feature-item not-included",children:[e.jsx("span",{className:"feature-icon",children:"✕"}),j]},`not-${g}`))]})}),e.jsx("button",{className:`pricing-cta ${c.popular?"primary":"secondary"}`,onClick:()=>u(c,h==="annual"),disabled:c.disabled||i===c.id||i===c.id+"_annual"||a===c.id,children:i===c.id||i===c.id+"_annual"?"Processing...":a===c.id?"Current Plan":c.cta})]},c.id))}),e.jsx("div",{className:"legacy-section",children:e.jsxs("details",{children:[e.jsx("summary",{className:"legacy-toggle",children:e.jsx("span",{children:"🏆 Legacy Founder (Grandfathered - No longer available)"})}),e.jsx("div",{className:"legacy-card",children:e.jsx("p",{children:"The Legacy Founder plan was available during our early launch. Existing Founders retain their 6-month access and 35,000 DWAV tokens."})})]})}),e.jsxs("div",{className:"pricing-footer",children:[e.jsxs("div",{className:"pricing-guarantee",children:[e.jsx("span",{className:"guarantee-icon",children:"🔒"}),e.jsxs("div",{children:[e.jsx("strong",{children:"Secure Payment"}),e.jsx("p",{children:"All transactions processed securely via Stripe"})]})]}),e.jsxs("div",{className:"pricing-guarantee",children:[e.jsx("span",{className:"guarantee-icon",children:"💰"}),e.jsxs("div",{children:[e.jsx("strong",{children:"3-Day Refund Policy"}),e.jsx("p",{children:"Not satisfied? Get a full refund within 3 days"})]})]}),e.jsxs("div",{className:"pricing-guarantee",children:[e.jsx("span",{className:"guarantee-icon",children:"⚡"}),e.jsxs("div",{children:[e.jsx("strong",{children:"2-Day Free Trial"}),e.jsx("p",{children:"Try all features before you're charged"})]})]})]}),e.jsxs("div",{className:"pricing-faq",children:[e.jsx("h3",{children:"Frequently Asked Questions"}),e.jsxs("div",{className:"faq-grid",children:[e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"How does the 2-day trial work?"}),e.jsx("p",{children:"Start using all features immediately. You won't be charged until after 2 days. Cancel anytime during the trial."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"What's the difference between Pulse Pro and StrikeAgent?"}),e.jsx("p",{children:"Pulse Pro focuses on AI predictions and analysis. StrikeAgent is our automated sniper bot for trading. Get both with DarkWave Complete."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"Can I cancel my subscription?"}),e.jsx("p",{children:"Yes, cancel anytime from Settings. Your access continues until the end of your billing period."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"What's the refund policy?"}),e.jsx("p",{children:"Full refund within 3 days of purchase, no questions asked. After that, you can still cancel but won't receive a refund."})]})]})]})]})}function ln(t){return!t&&t!==0?"—":t>=1e12?`${(t/1e12).toFixed(2)}T`:t>=1e9?`${(t/1e9).toFixed(2)}B`:t>=1e6?`${(t/1e6).toFixed(2)}M`:t>=1e3?`${(t/1e3).toFixed(2)}K`:t<.01?t.toFixed(6):t.toFixed(2)}function je(t){return!t&&t!==0?"$—":t<.01?`$${t.toFixed(6)}`:t<1?`$${t.toFixed(4)}`:`$${ln(t)}`}function cn(t){const a=Math.floor(Math.random()*40)+30,i=(Math.random()*2-1).toFixed(4),s=(Math.random()*2-1).toFixed(4),o=parseFloat(t.price?.replace(/[$,]/g,"")||0)*(.95+Math.random()*.1),p=parseFloat(t.price?.replace(/[$,]/g,"")||0)*(.92+Math.random()*.16),h=parseFloat(t.price?.replace(/[$,]/g,"")||0)*(.97+Math.random()*.06),x=parseFloat(t.price?.replace(/[$,]/g,"")||0)*(.95+Math.random()*.1);return{rsi:a,macd:{value:i,signal:s,histogram:(i-s).toFixed(4)},sma20:o,sma50:p,ema12:h,ema26:x}}function dn(t){const a=t.rsi;let i,s;return a<30?(i="BUY",s=Math.floor(70+Math.random()*25)):a>70?(i="SELL",s=Math.floor(65+Math.random()*25)):(i="HOLD",s=Math.floor(55+Math.random()*30)),{signal:i,confidence:s}}function pn(t){const a=parseFloat(t?.replace(/[$,]/g,"")||0);return{resistance1:a*(1.02+Math.random()*.03),resistance2:a*(1.05+Math.random()*.05),support1:a*(.95+Math.random()*.03),support2:a*(.9+Math.random()*.05)}}function Ge({label:t,value:a,status:i,isActive:s,onToggle:o,canToggle:p}){let h="var(--text-secondary)";i==="bullish"&&(h="#39FF14"),i==="bearish"&&(h="#FF4444"),i==="neutral"&&(h="rgba(255,255,255,0.5)");const x=()=>{p&&o&&o()};return e.jsxs("div",{onClick:x,style:{cursor:p?"pointer":"default",background:s?"rgba(0, 212, 255, 0.15)":"rgba(255, 255, 255, 0.03)",border:s?"1px solid rgba(0, 212, 255, 0.4)":"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"12px",padding:"16px",transition:"all 0.2s ease",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"10px",color:"#fff",fontSize:"14px",fontWeight:"500"},children:[p&&e.jsx("span",{style:{width:"18px",height:"18px",borderRadius:"4px",border:s?"2px solid #00D4FF":"2px solid rgba(255,255,255,0.3)",background:s?"#00D4FF":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"#000",transition:"all 0.2s ease"},children:s&&"✓"}),t]}),e.jsx("span",{style:{color:h,fontSize:"14px",fontWeight:"600"},children:a})]})}function Ke({label:t,value:a,subValue:i}){return e.jsxs("div",{style:T.statBox,children:[e.jsx("div",{style:T.statLabel,children:t}),e.jsx("div",{style:T.statValue,children:a}),i&&e.jsx("div",{style:T.statSub,children:i})]})}function xn(){return e.jsxs("div",{style:T.loading,children:[e.jsx("div",{style:T.spinner}),e.jsx("span",{children:"Loading analysis..."})]})}function gn({coinSymbol:t}){const[a,i]=n.useState(!0),[s,o]=n.useState(""),p=`analysis-notes-${t}`;n.useEffect(()=>{try{const x=localStorage.getItem(p);o(x||"")}catch{console.log("Could not load notes from localStorage")}},[p]);const h=n.useCallback(x=>{const u=x.target.value;o(u);try{localStorage.setItem(p,u)}catch{console.log("Could not save notes to localStorage")}},[p]);return e.jsxs("div",{style:be.container,children:[e.jsxs("button",{style:be.header,onClick:()=>i(!a),children:[e.jsxs("span",{style:be.headerTitle,children:["📝 Analysis Notes",s.length>0&&e.jsx("span",{style:be.badge,children:s.length})]}),e.jsx("span",{style:{fontSize:"12px",color:"rgba(255, 255, 255, 0.5)",transition:"transform 0.3s ease",transform:a?"rotate(180deg)":"rotate(0deg)"},children:"▼"})]}),a&&e.jsxs("div",{style:be.content,children:[e.jsx("textarea",{style:be.textarea,value:s,onChange:h,placeholder:`Add your analysis notes for ${t}...

Your notes are automatically saved.`,rows:6}),e.jsx("div",{style:be.footer,children:e.jsxs("span",{style:be.autosave,children:[e.jsx("span",{style:be.saveDot}),"Auto-saved locally"]})})]})]})}const be={container:{background:"linear-gradient(145deg, rgba(15, 15, 15, 0.9) 0%, rgba(20, 20, 20, 0.9) 100%)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"16px",overflow:"hidden",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.3)"},header:{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",background:"transparent",border:"none",cursor:"pointer",transition:"background 0.2s ease",color:"#fff"},headerTitle:{display:"flex",alignItems:"center",gap:"12px",fontSize:"16px",fontWeight:"600"},badge:{background:"rgba(0, 212, 255, 0.2)",color:"#00D4FF",fontSize:"11px",fontWeight:"700",padding:"3px 8px",borderRadius:"12px"},content:{padding:"0 20px 20px"},textarea:{width:"100%",background:"rgba(0, 0, 0, 0.4)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"12px",padding:"16px",fontSize:"14px",lineHeight:"1.6",color:"#fff",resize:"vertical",minHeight:"120px",fontFamily:"inherit",outline:"none",transition:"border-color 0.2s ease"},footer:{display:"flex",justifyContent:"flex-end",marginTop:"10px"},autosave:{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:"rgba(255, 255, 255, 0.4)"},saveDot:{width:"8px",height:"8px",background:"#39FF14",borderRadius:"50%"}},T={container:{minHeight:"100vh",paddingBottom:"100px"},coinInfoBar:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",padding:"8px 0"},coinLogoSmall:{width:"32px",height:"32px",borderRadius:"8px",objectFit:"cover",background:"rgba(255, 255, 255, 0.1)"},coinInfoText:{display:"flex",flexDirection:"column",gap:"1px"},coinNameSmall:{fontSize:"15px",fontWeight:"600",color:"#fff"},coinSymbolSmall:{fontSize:"11px",color:"rgba(255, 255, 255, 0.5)",fontWeight:"500"},header:{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingTop:"8px"},backButton:{width:"44px",height:"44px",background:"rgba(255, 255, 255, 0.05)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"12px",color:"#fff",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease",flexShrink:0},mockBadge:{background:"rgba(255, 193, 7, 0.2)",color:"#FFC107",fontSize:"10px",fontWeight:"700",padding:"3px 8px",borderRadius:"6px"},chartSection:{marginBottom:"24px"},sectionTitle:{fontSize:"16px",fontWeight:"600",color:"#fff",margin:"0 0 16px 0",display:"flex",alignItems:"center",gap:"8px"},bentoGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px",marginBottom:"24px"},bentoCard:{background:"linear-gradient(145deg, rgba(15, 15, 15, 0.9) 0%, rgba(20, 20, 20, 0.9) 100%)",border:"1px solid rgba(255, 255, 255, 0.1)",borderRadius:"16px",padding:"20px",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.3)"},indicatorsGrid:{display:"flex",flexDirection:"column",gap:"10px"},predictionCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"},signalBadge:{fontSize:"20px",fontWeight:"800",padding:"12px 28px",borderRadius:"12px",letterSpacing:"1px"},confidenceRow:{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center"},confidenceLabel:{fontSize:"13px",color:"rgba(255, 255, 255, 0.5)"},confidenceValue:{fontSize:"18px",fontWeight:"700",color:"#fff"},confidenceBar:{width:"100%",height:"8px",background:"rgba(255, 255, 255, 0.1)",borderRadius:"4px",overflow:"hidden"},confidenceFill:{height:"100%",borderRadius:"4px",transition:"width 0.5s ease"},levelsGrid:{display:"flex",flexDirection:"column",gap:"10px"},levelRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:"10px",background:"rgba(255, 255, 255, 0.03)"},levelLabel:{fontSize:"13px",fontWeight:"600"},levelValue:{fontSize:"14px",fontWeight:"600",color:"#fff"},statsGrid:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"12px"},statBox:{background:"rgba(255, 255, 255, 0.03)",borderRadius:"12px",padding:"14px",textAlign:"center"},statLabel:{fontSize:"11px",color:"rgba(255, 255, 255, 0.5)",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"},statValue:{fontSize:"16px",fontWeight:"700",color:"#fff"},statSub:{fontSize:"11px",color:"rgba(255, 255, 255, 0.4)",marginTop:"4px"},loading:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",padding:"60px 20px",color:"rgba(255, 255, 255, 0.6)",fontSize:"14px"},spinner:{width:"36px",height:"36px",border:"3px solid rgba(0, 212, 255, 0.2)",borderTopColor:"#00D4FF",borderRadius:"50%",animation:"spin 1s linear infinite"}};function _n({coin:t,onBack:a}){const[i,s]=n.useState(!1),[o,p]=n.useState(null),[h,x]=n.useState(!1),[u,c]=n.useState({rsi:!1,macd:!1,sma:!1,ema:!1});n.useEffect(()=>{t?.symbol&&(s(!0),p(null),x(!1),c({rsi:!1,macd:!1,sma:!1,ema:!1}),Ya(t.symbol).then(E=>{E.success&&E.data?(p(E.data),x(!1)):x(!0)}).catch(()=>{x(!0)}).finally(()=>{s(!1)}))},[t?.symbol]);const j=E=>{c(b=>({...b,[E]:!b[E]}))},g=n.useMemo(()=>o?{rsi:o.rsi||50,macd:{value:o.macd?.value?.toFixed(4)||"0.0000",signal:o.macd?.signal?.toFixed(4)||"0.0000",histogram:o.macd?.histogram?.toFixed(4)||"0.0000"},sma20:o.sma50||0,sma50:o.sma200||o.sma50||0,ema12:o.ema9||0,ema26:o.ema21||0}:t?cn(t):null,[t,o]),y=n.useMemo(()=>{if(o?.recommendation){const E=o.recommendation,b=o.signalCount?.bullish||0,H=o.signalCount?.bearish||0,I=b+H;let Z=50;if(I>0){const Y=Math.max(b,H);Z=Math.round(Y/I*100)}return{signal:E,confidence:Z}}return g?dn(g):null},[g,o]),F=n.useMemo(()=>o?.support&&o?.resistance?{resistance1:o.resistance,resistance2:o.resistance*1.03,support1:o.support,support2:o.support*.97}:t?pn(t.price):null,[t,o]);if(!t)return e.jsx("div",{style:T.container,children:e.jsxs("div",{style:T.header,children:[e.jsx("button",{style:T.backButton,onClick:a,children:"←"}),e.jsx("h2",{style:{color:"#fff",margin:0},children:"No coin selected"})]})});parseFloat(t.change)>0;const m=parseFloat(t.price?.replace(/[$,]/g,"")||0),v=m*(1+Math.random()*.05),f=m*(1-Math.random()*.05),D=E=>E<30?"bullish":E>70?"bearish":"neutral",L=E=>parseFloat(E.histogram)>0?"bullish":"bearish",O=(E=>E==="BUY"||E==="STRONG_BUY"?{bg:"rgba(57, 255, 20, 0.2)",color:"#39FF14"}:E==="SELL"||E==="STRONG_SELL"?{bg:"rgba(255, 68, 68, 0.2)",color:"#FF4444"}:{bg:"rgba(0, 212, 255, 0.2)",color:"#00D4FF"})(y?.signal);return e.jsxs("div",{style:T.container,children:[e.jsxs("div",{style:T.coinInfoBar,children:[e.jsx("img",{src:t?.logo||"/darkwave-coin.png",alt:t?.name||"Coin",style:T.coinLogoSmall,onError:E=>E.target.src="/darkwave-coin.png"}),e.jsxs("div",{style:T.coinInfoText,children:[e.jsx("span",{style:T.coinNameSmall,children:t?.name||"Unknown"}),e.jsx("span",{style:T.coinSymbolSmall,children:t?.symbol||"—"})]}),h&&e.jsx("span",{style:T.mockBadge,children:"Demo"})]}),i?e.jsx(xn,{}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:T.chartSection,children:e.jsx(Qa,{coin:t,activeIndicators:u,fullWidth:!0})}),e.jsxs("div",{style:T.bentoGrid,children:[e.jsxs("div",{style:T.bentoCard,children:[e.jsxs("h3",{style:T.sectionTitle,children:["📊 Technical Indicators",e.jsx("span",{style:{fontSize:"11px",color:"rgba(255,255,255,0.4)",fontWeight:"400"},children:"(tap to overlay)"})]}),e.jsxs("div",{style:T.indicatorsGrid,children:[e.jsx(Ge,{label:"RSI (14)",value:typeof g?.rsi=="number"?g.rsi.toFixed(2):g?.rsi,status:D(g?.rsi||50),isActive:u.rsi,onToggle:()=>j("rsi"),canToggle:!1}),e.jsx(Ge,{label:"MACD",value:g?.macd?.value,status:L(g?.macd||{histogram:"0"}),isActive:u.macd,onToggle:()=>j("macd"),canToggle:!1}),e.jsx(Ge,{label:"SMA (20)",value:je(g?.sma20),status:m>(g?.sma20||0)?"bullish":"bearish",isActive:u.sma,onToggle:()=>j("sma"),canToggle:!0}),e.jsx(Ge,{label:"EMA (12)",value:je(g?.ema12),status:m>(g?.ema12||0)?"bullish":"bearish",isActive:u.ema,onToggle:()=>j("ema"),canToggle:!0})]})]}),e.jsxs("div",{style:T.bentoCard,children:[e.jsx("h3",{style:T.sectionTitle,children:"🤖 AI Prediction"}),e.jsxs("div",{style:T.predictionCard,children:[e.jsx("div",{style:{...T.signalBadge,background:O.bg,color:O.color,boxShadow:`0 0 20px ${O.bg}`},children:y?.signal||"HOLD"}),e.jsxs("div",{style:T.confidenceRow,children:[e.jsx("span",{style:T.confidenceLabel,children:"Confidence"}),e.jsxs("span",{style:T.confidenceValue,children:[y?.confidence||50,"%"]})]}),e.jsx("div",{style:T.confidenceBar,children:e.jsx("div",{style:{...T.confidenceFill,width:`${y?.confidence||50}%`,background:O.color}})})]})]}),e.jsxs("div",{style:T.bentoCard,children:[e.jsx("h3",{style:T.sectionTitle,children:"📍 Support & Resistance"}),e.jsxs("div",{style:T.levelsGrid,children:[e.jsxs("div",{style:{...T.levelRow,borderLeft:"3px solid #FF4444"},children:[e.jsx("span",{style:{...T.levelLabel,color:"#FF4444"},children:"R2"}),e.jsx("span",{style:T.levelValue,children:je(F?.resistance2)})]}),e.jsxs("div",{style:{...T.levelRow,borderLeft:"3px solid #FF6B6B"},children:[e.jsx("span",{style:{...T.levelLabel,color:"#FF6B6B"},children:"R1"}),e.jsx("span",{style:T.levelValue,children:je(F?.resistance1)})]}),e.jsxs("div",{style:{...T.levelRow,borderLeft:"3px solid #00D4FF",background:"rgba(0, 212, 255, 0.1)"},children:[e.jsx("span",{style:{...T.levelLabel,color:"#00D4FF"},children:"Current"}),e.jsx("span",{style:T.levelValue,children:t.price})]}),e.jsxs("div",{style:{...T.levelRow,borderLeft:"3px solid #39FF14"},children:[e.jsx("span",{style:{...T.levelLabel,color:"#39FF14"},children:"S1"}),e.jsx("span",{style:T.levelValue,children:je(F?.support1)})]}),e.jsxs("div",{style:{...T.levelRow,borderLeft:"3px solid #2ECC71"},children:[e.jsx("span",{style:{...T.levelLabel,color:"#2ECC71"},children:"S2"}),e.jsx("span",{style:T.levelValue,children:je(F?.support2)})]})]})]}),e.jsxs("div",{style:T.bentoCard,children:[e.jsx("h3",{style:T.sectionTitle,children:"📋 Key Statistics"}),e.jsxs("div",{style:T.statsGrid,children:[e.jsx(Ke,{label:"24h High",value:je(v)}),e.jsx(Ke,{label:"24h Low",value:je(f)}),e.jsx(Ke,{label:"24h Volume",value:t.volume}),e.jsx(Ke,{label:"Volatility",value:o?.volatility?`${o.volatility.toFixed(1)}%`:"—",subValue:h?"Loading...":""})]})]})]}),e.jsx(gn,{coinSymbol:t.symbol})]})]})}const Nt=document.createElement("style");Nt.textContent="@keyframes spin { to { transform: rotate(360deg); } }";document.querySelector("[data-analysis-tab-spinner]")||(Nt.setAttribute("data-analysis-tab-spinner","true"),document.head.appendChild(Nt));const Ce=[{id:"business",title:"Business Documents",icon:"💼",color:"#00D4FF",docs:[{id:"executive",title:"Executive Summary",icon:"📋",file:"/business-docs/DARKWAVE_EXECUTIVE_SUMMARY_CONSERVATIVE.md",description:"Company overview, problem, solution"},{id:"investor",title:"Investor Brief",icon:"💰",file:"/business-docs/DARKWAVE_INVESTOR_BRIEF_CONSERVATIVE.md",description:"Full business plan for investors"},{id:"roadmap",title:"Product Roadmap",icon:"🗺️",file:"/business-docs/DARKWAVE_ROADMAP.md",description:"2025-2028 development timeline"},{id:"bootstrap",title:"Bootstrap Plan",icon:"🚀",file:"/business-docs/DARKWAVE_BOOTSTRAP_PLAN.md",description:"Lean startup strategy"}]},{id:"token",title:"DWAV Token",icon:"🪙",color:"#39FF14",docs:[{id:"whitepaper",title:"Whitepaper",icon:"📄",file:"/docs/DWAV_WHITEPAPER.md",description:"Complete token documentation"},{id:"tokeninfo",title:"Token Specifications",icon:"🔢",file:"/docs/DWAV_TOKEN_INFO.md",description:"Technical specs & tokenomics"},{id:"contract",title:"Smart Contract",icon:"⚡",file:"/docs/DWAV_SMART_CONTRACT.md",description:"Anchor program documentation"}]},{id:"marketing",title:"Marketing & Launch",icon:"📢",color:"#8B5CF6",docs:[{id:"social",title:"Social Media Posts",icon:"📱",file:"/marketing/SOCIAL_MEDIA_POSTS.md",description:"7 ready-to-post templates"},{id:"action",title:"2-Week Action Plan",icon:"📅",file:"/marketing/ACTION_PLAN_2_WEEKS.md",description:"Marketing launch strategy"}]},{id:"legal",title:"Legal & Compliance",icon:"⚖️",color:"#FFB800",docs:[{id:"disclaimer",title:"Legal Disclaimer",icon:"📜",file:"/docs/LEGAL_DISCLAIMER.md",description:"Risk disclosures & terms"}]}],un=Ce.flatMap(t=>t.docs),hn=[{id:1,text:"Post whitepaper announcement on X/Twitter",done:!1,priority:"high"},{id:2,text:"Share launch content on Telegram channel",done:!1,priority:"high"},{id:3,text:"Set up Facebook business page",done:!1,priority:"medium"},{id:4,text:"Apply for CEX listings (post-launch)",done:!1,priority:"low"},{id:5,text:"Set up MoonPay crypto on-ramp",done:!1,priority:"medium",link:"https://dashboard.moonpay.com",instructions:`1. Create account at dashboard.moonpay.com
2. Complete business verification
3. Get your API key (pk_live_xxx)
4. Get your Secret key for URL signing
5. Add keys to Replit Secrets: MOONPAY_API_KEY, MOONPAY_SECRET_KEY`},{id:6,text:"Set up Transak crypto on-ramp",done:!1,priority:"low",link:"https://dashboard.transak.com",instructions:`1. Create account at dashboard.transak.com
2. Complete KYB verification
3. Get your API key from Settings
4. Add key to Replit Secrets: TRANSAK_API_KEY`},{id:7,text:"Apply for Stripe Crypto Onramp",done:!1,priority:"low",link:"https://stripe.com/crypto",instructions:`1. Go to Stripe Dashboard > Products > Crypto Onramp
2. Click "Request Access"
3. Complete application form
4. Wait for approval (1-2 weeks)`}],mn={free:"#00D4FF",pro:"#39FF14",enterprise:"#8B5CF6"},Ee={free:["market:read","signals:read"],pro:["market:read","signals:read","predictions:read","accuracy:read"],enterprise:["market:read","signals:read","predictions:read","accuracy:read","strikeagent:read","webhooks:write"]},te={background:"rgba(26, 26, 26, 0.6)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"},Fe=({title:t,icon:a,children:i,fullWidth:s,glowColor:o})=>e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:`1px solid ${o?`${o}40`:"#2a2a2a"}`,gridColumn:s?"1 / -1":"span 1",boxShadow:o?`0 0 30px ${o}20`:"none",transition:"all 0.3s ease"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"},children:[e.jsx("span",{style:{fontSize:"20px"},children:a}),e.jsx("h3",{style:{margin:0,color:"#fff",fontSize:"16px",fontWeight:"600"},children:t})]}),i]}),Ye=({title:t,value:a,subtitle:i,icon:s,glow:o})=>e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:`1px solid ${o?`${o}40`:"#2a2a2a"}`,boxShadow:o?`0 0 20px ${o}20`:"none"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"},children:[e.jsx("span",{style:{fontSize:"14px",color:"#888"},children:t}),e.jsx("span",{style:{fontSize:"20px"},children:s})]}),e.jsx("div",{style:{fontSize:"32px",fontWeight:"700",color:"#fff",marginBottom:"4px"},children:a}),i&&e.jsx("div",{style:{fontSize:"12px",color:"#666"},children:i})]}),da=({count:t})=>e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"24px",border:"1px solid rgba(0, 212, 255, 0.3)",boxShadow:"0 0 40px rgba(0, 212, 255, 0.15)",textAlign:"center"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginBottom:"8px"},children:[e.jsx("div",{style:{width:"12px",height:"12px",borderRadius:"50%",background:"#39FF14",boxShadow:"0 0 10px #39FF14",animation:"pulse 2s infinite"}}),e.jsx("span",{style:{fontSize:"14px",color:"#888",textTransform:"uppercase",letterSpacing:"2px"},children:"Live Visitors"})]}),e.jsx("div",{style:{fontSize:"48px",fontWeight:"800",color:"#00D4FF"},children:t}),e.jsx("style",{children:"@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }"})]}),pa=({title:t,items:a,labelKey:i,valueKey:s,icon:o})=>e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:"1px solid #2a2a2a"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"},children:[e.jsx("span",{children:o}),e.jsx("span",{style:{fontWeight:"600",color:"#fff"},children:t})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:a.length===0?e.jsx("div",{style:{color:"#666",fontSize:"13px",textAlign:"center",padding:"20px"},children:"No data yet"}):a.slice(0,5).map((p,h)=>e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:h<Math.min(a.length,5)-1?"1px solid #2a2a2a":"none"},children:[e.jsx("span",{style:{color:"#ccc",fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"},children:p[i]}),e.jsx("span",{style:{color:"#00D4FF",fontWeight:"600",fontSize:"13px"},children:p[s]})]},h))})]}),fn=({data:t})=>{const a=[{key:"desktop",label:"Desktop",icon:"🖥️",color:"#00D4FF"},{key:"mobile",label:"Mobile",icon:"📱",color:"#39FF14"},{key:"tablet",label:"Tablet",icon:"📲",color:"#8B5CF6"}];return e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:"1px solid #2a2a2a"},children:[e.jsx("div",{style:{fontWeight:"600",color:"#fff",marginBottom:"16px"},children:"Device Breakdown"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:a.map(i=>e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"4px"},children:[e.jsxs("span",{style:{color:"#888",fontSize:"13px"},children:[i.icon," ",i.label]}),e.jsxs("span",{style:{color:i.color,fontWeight:"600"},children:[t[i.key],"%"]})]}),e.jsx("div",{style:{height:"6px",background:"#2a2a2a",borderRadius:"3px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${t[i.key]}%`,height:"100%",background:i.color,borderRadius:"3px"}})})]},i.key))})]})},bn=({doc:t,onView:a,color:i="#00D4FF"})=>e.jsx("div",{onClick:()=>a(t),style:{...te,borderRadius:"12px",padding:"16px",border:"1px solid #2a2a2a",cursor:"pointer",transition:"all 0.3s ease",minWidth:"220px",flex:"0 0 auto"},onMouseOver:s=>{s.currentTarget.style.borderColor=i,s.currentTarget.style.transform="translateY(-2px)",s.currentTarget.style.boxShadow=`0 0 25px ${i}30`},onMouseOut:s=>{s.currentTarget.style.borderColor="#2a2a2a",s.currentTarget.style.transform="translateY(0)",s.currentTarget.style.boxShadow="none"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px"},children:[e.jsx("span",{style:{fontSize:"28px"},children:t.icon}),e.jsxs("div",{children:[e.jsx("div",{style:{color:"#fff",fontWeight:"600",fontSize:"14px"},children:t.title}),e.jsx("div",{style:{color:"#666",fontSize:"11px"},children:t.description})]})]})}),yn=({category:t,onViewDoc:a})=>{const i=n.useRef(null),[s,o]=n.useState(!1),[p,h]=n.useState(!0),x=()=>{if(i.current){const{scrollLeft:c,scrollWidth:j,clientWidth:g}=i.current;o(c>0),h(c<j-g-5)}};n.useEffect(()=>{x();const c=i.current;return c&&c.addEventListener("scroll",x),()=>c?.removeEventListener("scroll",x)},[]);const u=c=>{if(i.current){const j=c==="left"?-280:280;i.current.scrollBy({left:j,behavior:"smooth"})}};return e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:`1px solid ${t.color}30`,boxShadow:`0 0 30px ${t.color}10`},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:t.icon}),e.jsx("h3",{style:{margin:0,color:t.color,fontSize:"16px",fontWeight:"600"},children:t.title}),e.jsxs("span",{style:{background:`${t.color}20`,color:t.color,fontSize:"10px",padding:"3px 8px",borderRadius:"8px",fontWeight:"600"},children:[t.docs.length," docs"]})]}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx("button",{onClick:()=>u("left"),disabled:!s,style:{width:"32px",height:"32px",borderRadius:"8px",border:"none",background:s?t.color:"#333",color:s?"#000":"#666",cursor:s?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",transition:"all 0.2s ease"},children:"←"}),e.jsx("button",{onClick:()=>u("right"),disabled:!p,style:{width:"32px",height:"32px",borderRadius:"8px",border:"none",background:p?t.color:"#333",color:p?"#000":"#666",cursor:p?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",transition:"all 0.2s ease"},children:"→"})]})]}),e.jsx("div",{ref:i,style:{display:"flex",gap:"12px",overflowX:"auto",scrollbarWidth:"none",msOverflowStyle:"none",paddingBottom:"4px"},children:t.docs.map(c=>e.jsx(bn,{doc:c,onView:a,color:t.color},c.id))}),e.jsx("style",{children:`
        div::-webkit-scrollbar { display: none; }
      `})]})},vn=({doc:t,onView:a,color:i})=>e.jsxs("div",{onClick:()=>a(t),style:{...te,borderRadius:"12px",padding:"16px",border:`1px solid ${i}30`,cursor:"pointer",transition:"all 0.3s ease",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",minHeight:"100px"},onMouseOver:s=>{s.currentTarget.style.borderColor=i,s.currentTarget.style.boxShadow=`0 0 30px ${i}30`,s.currentTarget.style.transform="scale(1.02)"},onMouseOut:s=>{s.currentTarget.style.borderColor=`${i}30`,s.currentTarget.style.boxShadow="none",s.currentTarget.style.transform="scale(1)"},children:[e.jsx("span",{style:{fontSize:"32px",marginBottom:"8px"},children:t.icon}),e.jsx("div",{style:{color:"#fff",fontWeight:"600",fontSize:"13px"},children:t.title})]}),jn=({task:t,onToggle:a})=>{const i={high:"#FF4444",medium:"#FFB344",low:"#44FF44"},[s,o]=n.useState(!1);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{onClick:()=>a(t.id),style:{display:"flex",alignItems:"center",gap:"12px",padding:"12px",background:t.done?"rgba(26, 42, 26, 0.6)":"rgba(26, 26, 26, 0.6)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderRadius:"8px",border:`1px solid ${t.done?"#39FF1430":"#2a2a2a"}`,cursor:"pointer",transition:"all 0.2s ease"},children:[e.jsx("div",{style:{width:"20px",height:"20px",borderRadius:"4px",border:`2px solid ${t.done?"#39FF14":"#444"}`,background:t.done?"#39FF14":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:t.done&&e.jsx("span",{style:{color:"#000",fontSize:"12px"},children:"✓"})}),e.jsx("span",{style:{flex:1,color:t.done?"#666":"#fff",textDecoration:t.done?"line-through":"none",fontSize:"14px"},children:t.text}),t.link&&e.jsx("a",{href:t.link,target:"_blank",rel:"noopener noreferrer",onClick:p=>p.stopPropagation(),style:{background:"linear-gradient(135deg, #00D4FF, #0099CC)",color:"#000",padding:"4px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:"600",textDecoration:"none",flexShrink:0},children:"Open →"}),t.instructions&&e.jsx("button",{onClick:p=>{p.stopPropagation(),o(!s)},style:{background:"#333",border:"none",color:"#888",padding:"4px 8px",borderRadius:"4px",fontSize:"11px",cursor:"pointer",flexShrink:0},children:s?"Hide":"Steps"}),e.jsx("div",{style:{width:"8px",height:"8px",borderRadius:"50%",background:i[t.priority],flexShrink:0}})]}),s&&t.instructions&&e.jsx("div",{style:{marginLeft:"32px",padding:"12px",background:"rgba(0, 212, 255, 0.05)",border:"1px solid rgba(0, 212, 255, 0.2)",borderRadius:"8px",fontSize:"12px",color:"#aaa",whiteSpace:"pre-line",lineHeight:"1.6"},children:t.instructions})]})},wn=({doc:t,content:a,onClose:i})=>e.jsxs("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",zIndex:1e4,display:"flex",flexDirection:"column",padding:"20px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:t.icon}),e.jsx("h2",{style:{margin:0,color:"#fff"},children:t.title})]}),e.jsx("button",{onClick:i,style:{background:"#333",border:"none",borderRadius:"8px",color:"#fff",padding:"8px 16px",cursor:"pointer"},children:"✕ Close"})]}),e.jsx("div",{style:{flex:1,overflow:"auto",...te,borderRadius:"12px",padding:"24px",whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:"14px",lineHeight:"1.6",color:"#ccc"},children:a||"Loading..."})]}),kt=({tier:t,price:a,monthlyPrice:i,annualPrice:s,billingPeriod:o,features:p,limits:h,scopes:x,isCurrentPlan:u,isPopular:c,onUpgrade:j,onManage:g})=>{const[y,F]=n.useState(!1),m=mn[t],v=o==="annual"?s:i;return e.jsxs("div",{onMouseEnter:()=>F(!0),onMouseLeave:()=>F(!1),style:{...te,textAlign:"center",padding:"24px 20px",borderRadius:"16px",border:`1px solid ${m}40`,position:"relative",boxShadow:y?`0 0 40px ${m}40, 0 0 60px ${m}20`:`0 0 20px ${m}15`,transform:y?"scale(1.02)":"scale(1)",transition:"all 0.3s ease"},children:[c&&e.jsx("div",{style:{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg, ${m}, ${m}CC)`,color:t==="pro"?"#000":"#fff",fontSize:"10px",fontWeight:"700",padding:"6px 16px",borderRadius:"12px",boxShadow:`0 0 15px ${m}60`},children:"POPULAR"}),u&&e.jsx("div",{style:{position:"absolute",top:"-12px",right:"12px",background:"linear-gradient(135deg, #00D4FF, #0099CC)",color:"#fff",fontSize:"9px",fontWeight:"700",padding:"4px 10px",borderRadius:"8px",textTransform:"uppercase"},children:"Current Plan"}),e.jsx("div",{style:{fontSize:"22px",fontWeight:"700",color:m,marginTop:c?"8px":0},children:t.charAt(0).toUpperCase()+t.slice(1)}),e.jsxs("div",{style:{fontSize:"36px",fontWeight:"800",color:"#fff",margin:"12px 0 4px"},children:["$",v,e.jsx("span",{style:{fontSize:"14px",color:"#888",fontWeight:"400"},children:"/mo"})]}),o==="annual"&&t!=="free"&&e.jsxs("div",{style:{fontSize:"11px",color:m,marginBottom:"8px"},children:["$",v*12,"/year (billed annually)"]}),e.jsx("div",{style:{fontSize:"12px",color:"#888",marginBottom:"4px"},children:h}),e.jsx("div",{style:{fontSize:"11px",color:"#666",marginBottom:"12px"},children:p}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px",justifyContent:"center",marginTop:"12px",padding:"10px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px"},children:x.map((f,D)=>e.jsx("span",{style:{fontSize:"9px",padding:"3px 6px",borderRadius:"4px",background:`${m}20`,color:m,border:`1px solid ${m}40`},children:f},D))}),e.jsx("div",{style:{marginTop:"16px"},children:u?t==="free"?e.jsx("div",{style:{padding:"10px 20px",background:"#333",borderRadius:"8px",color:"#888",fontSize:"12px"},children:"Current Plan"}):e.jsx("button",{onClick:g,style:{width:"100%",padding:"12px 20px",background:"transparent",border:`1px solid ${m}`,borderRadius:"8px",color:m,fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s ease"},children:"Manage Subscription"}):e.jsx("button",{onClick:()=>j(t),style:{width:"100%",padding:"12px 20px",background:t==="free"?"#333":`linear-gradient(135deg, ${m}, ${m}CC)`,border:"none",borderRadius:"8px",color:t==="pro"?"#000":"#fff",fontSize:"12px",fontWeight:"700",cursor:t==="free"?"default":"pointer",boxShadow:t!=="free"?`0 0 15px ${m}40`:"none",transition:"all 0.2s ease"},children:t==="free"?"Free Forever":`Upgrade to ${t.charAt(0).toUpperCase()+t.slice(1)}`})})]})},kn=({environment:t})=>{const a=t==="live";return e.jsx("span",{style:{padding:"3px 8px",borderRadius:"4px",fontSize:"9px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.5px",background:a?"rgba(57, 255, 20, 0.15)":"rgba(255, 184, 0, 0.15)",color:a?"#39FF14":"#FFB800",border:`1px solid ${a?"rgba(57, 255, 20, 0.4)":"rgba(255, 184, 0, 0.4)"}`},children:a?"LIVE":"TEST"})},Sn=({scope:t})=>{const i={"market:read":"#00D4FF","signals:read":"#39FF14","predictions:read":"#8B5CF6","accuracy:read":"#FFB800","strikeagent:read":"#FF6B35","webhooks:write":"#FF4444"}[t]||"#888";return e.jsx("span",{style:{padding:"2px 5px",borderRadius:"3px",fontSize:"8px",fontWeight:"600",background:`${i}15`,color:i,border:`1px solid ${i}30`},children:t})},Fn=({isOpen:t,title:a,message:i,onConfirm:s,onCancel:o})=>t?e.jsx("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},children:e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"24px",maxWidth:"400px",width:"100%",border:"1px solid #FF444440",boxShadow:"0 0 40px rgba(255, 68, 68, 0.2)"},children:[e.jsx("h3",{style:{margin:"0 0 12px",color:"#fff",fontSize:"18px"},children:a}),e.jsx("p",{style:{margin:"0 0 20px",color:"#888",fontSize:"14px",lineHeight:1.5},children:i}),e.jsxs("div",{style:{display:"flex",gap:"12px"},children:[e.jsx("button",{onClick:o,style:{flex:1,padding:"12px",background:"#333",border:"none",borderRadius:"8px",color:"#fff",fontSize:"13px",cursor:"pointer"},children:"Cancel"}),e.jsx("button",{onClick:s,style:{flex:1,padding:"12px",background:"linear-gradient(135deg, #FF4444, #FF6B6B)",border:"none",borderRadius:"8px",color:"#fff",fontSize:"13px",fontWeight:"600",cursor:"pointer"},children:"Regenerate"})]})]})}):null;function $n(){const[t,a]=n.useState("overview"),[i,s]=n.useState(!0),[o,p]=n.useState(0),[h,x]=n.useState(null),[u,c]=n.useState(()=>{const l=localStorage.getItem("adminTasks");return l?JSON.parse(l):hn}),[j,g]=n.useState(null),[y,F]=n.useState(""),[m,v]=n.useState([]),[f,D]=n.useState(!1),[L,X]=n.useState(""),[O,E]=n.useState("live"),[b,H]=n.useState(["market:read","signals:read"]),[I,Z]=n.useState(null),[Y,se]=n.useState({}),[U,le]=n.useState("monthly"),[ae,ne]=n.useState("free"),[de,w]=n.useState(null);n.useEffect(()=>{localStorage.setItem("adminTasks",JSON.stringify(u))},[u]),n.useEffect(()=>{(async()=>{try{const[W,_]=await Promise.all([fetch("/api/analytics/dashboard?tenantId=pulse"),fetch("/api/analytics/live?tenantId=pulse")]),K=await W.json(),re=await _.json();x(K),p(re.liveVisitors||0)}catch(W){console.error("Failed to load analytics:",W)}finally{s(!1)}})();const C=setInterval(async()=>{try{const _=await(await fetch("/api/analytics/live?tenantId=pulse")).json();p(_.liveVisitors||0)}catch{}},3e4);return()=>clearInterval(C)},[]),n.useEffect(()=>{(async()=>{try{const C=JSON.parse(localStorage.getItem("userSession")||"{}"),W=C.sessionToken||C.token;if(!W)return;const K=await(await fetch("/api/developer/subscription",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({sessionToken:W})})).json();K.tier&&(ne(K.tier),H(Ee[K.tier]||Ee.free))}catch(C){console.error("Failed to fetch subscription:",C)}})()},[]);const z=async l=>{g(l),F("Loading...");try{const W=await(await fetch(l.file)).text();F(W)}catch{F("Failed to load document")}},q=l=>{c(C=>C.map(W=>W.id===l?{...W,done:!W.done}:W))},Q=u.filter(l=>l.done).length,R=Math.round(Q/u.length*100),B=h||{},G=[{id:"overview",label:"Overview",icon:"📊"},{id:"api",label:"API",icon:"🔑"},{id:"documents",label:"Documents",icon:"📁"},{id:"tasks",label:"Tasks",icon:"✅"},{id:"analytics",label:"Analytics",icon:"📈"}],$=async l=>{if(l!=="free")try{const C=JSON.parse(localStorage.getItem("userSession")||"{}"),W=C.id||C.email;if(!W){console.error("No user session found");return}let _;l==="enterprise"?_=U==="annual"?"/api/developer/billing/create-enterprise-annual":"/api/developer/billing/create-enterprise-monthly":_=U==="annual"?"/api/developer/billing/create-pro-annual":"/api/developer/billing/create-pro-monthly";const re=await(await fetch(_,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:W})})).json();re.success&&re.url?window.location.href=re.url:console.error("Failed to create checkout session:",re.error)}catch(C){console.error("Upgrade error:",C)}},k=async()=>{try{const l=JSON.parse(localStorage.getItem("userSession")||"{}"),C=l.sessionToken||l.token,_=await(await fetch("/api/developer/billing/portal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:C})})).json();_.url&&(window.location.href=_.url)}catch(l){console.error("Failed to open billing portal:",l)}},P=async()=>{if(L.trim()){D(!0);try{const l=JSON.parse(localStorage.getItem("userSession")||"{}"),C=l.sessionToken||l.token;if(!C){console.error("No session token found - user not authenticated");return}const _=await(await fetch("/api/developer/keys",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:C,name:L.trim(),environment:O,scopes:b})})).json();_.success?(Z({key:_.apiKey,keyId:_.keyId,prefix:_.prefix,name:L.trim(),environment:_.environment||O,scopes:_.scopes||b}),X(""),v(K=>[...K,{id:_.keyId,name:L.trim(),prefix:_.prefix,environment:_.environment||O,scopes:_.scopes||b,createdAt:new Date().toISOString(),status:"active"}])):_.error&&console.error("API key generation failed:",_.error)}catch(l){console.error("Failed to generate API key:",l)}finally{D(!1)}}},J=async l=>{try{const C=JSON.parse(localStorage.getItem("userSession")||"{}"),W=C.sessionToken||C.token,K=await(await fetch("/api/developer/keys/regenerate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionToken:W,keyId:l})})).json();if(K.success){const re=m.find(me=>me.id===l);Z({key:K.apiKey,keyId:K.keyId,prefix:K.prefix,name:re?.name||"Regenerated Key",environment:re?.environment||"live",scopes:re?.scopes||b}),v(me=>me.map(ie=>ie.id===l?{...ie,prefix:K.prefix}:ie))}}catch(C){console.error("Failed to regenerate key:",C)}finally{w(null)}},d=(l,C)=>{navigator.clipboard.writeText(l),se(W=>({...W,[C]:!0})),setTimeout(()=>se(W=>({...W,[C]:!1})),2e3)};return e.jsxs("div",{style:{padding:"20px 0",paddingBottom:"100px"},children:[e.jsxs("div",{style:{marginBottom:"24px"},children:[e.jsx("h1",{style:{fontSize:"24px",fontWeight:"700",color:"#fff",margin:0},children:"🛠️ Developers Portal"}),e.jsx("p",{style:{color:"#888",margin:"8px 0 0",fontSize:"14px"},children:"Admin dashboard, business docs & analytics"})]}),e.jsx("div",{style:{display:"flex",gap:"8px",marginBottom:"24px",overflowX:"auto",paddingBottom:"8px"},children:G.map(l=>e.jsxs("button",{onClick:()=>a(l.id),style:{background:t===l.id?"linear-gradient(135deg, #00D4FF, #0099CC)":"rgba(26, 26, 26, 0.6)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:t===l.id?"none":"1px solid #2a2a2a",borderRadius:"8px",padding:"10px 16px",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",whiteSpace:"nowrap",fontSize:"13px",fontWeight:t===l.id?"600":"400",transition:"all 0.2s ease"},children:[e.jsx("span",{children:l.icon}),l.label]},l.id))}),t==="overview"&&e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px"},children:[e.jsx(da,{count:o}),e.jsxs(Fe,{title:"Task Progress",icon:"📋",children:[e.jsxs("div",{style:{marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("span",{style:{color:"#888",fontSize:"13px"},children:[Q," of ",u.length," tasks done"]}),e.jsxs("span",{style:{color:"#00D4FF",fontWeight:"600"},children:[R,"%"]})]}),e.jsx("div",{style:{height:"8px",background:"#2a2a2a",borderRadius:"4px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${R}%`,height:"100%",background:"linear-gradient(90deg, #00D4FF, #39FF14)",borderRadius:"4px",transition:"width 0.3s ease"}})})]}),e.jsx("button",{onClick:()=>a("tasks"),style:{width:"100%",background:"rgba(42, 42, 42, 0.6)",border:"none",borderRadius:"8px",padding:"10px",color:"#fff",cursor:"pointer",fontSize:"13px"},children:"View All Tasks →"})]}),e.jsx(Fe,{title:"Quick Stats",icon:"⚡",children:e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"},children:[e.jsxs("div",{style:{textAlign:"center",padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px"},children:[e.jsx("div",{style:{fontSize:"24px",fontWeight:"700",color:"#00D4FF"},children:B.today?.views||0}),e.jsx("div",{style:{fontSize:"11px",color:"#666"},children:"Today"})]}),e.jsxs("div",{style:{textAlign:"center",padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px"},children:[e.jsx("div",{style:{fontSize:"24px",fontWeight:"700",color:"#39FF14"},children:B.allTime?.views||0}),e.jsx("div",{style:{fontSize:"11px",color:"#666"},children:"All Time"})]})]})}),e.jsx(Fe,{title:"Business Documents",icon:"📁",children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[un.slice(0,3).map(l=>e.jsxs("div",{onClick:()=>z(l),style:{display:"flex",alignItems:"center",gap:"10px",padding:"10px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",cursor:"pointer"},children:[e.jsx("span",{children:l.icon}),e.jsx("span",{style:{color:"#ccc",fontSize:"13px"},children:l.title})]},l.id)),e.jsx("button",{onClick:()=>a("documents"),style:{background:"rgba(42, 42, 42, 0.6)",border:"none",borderRadius:"8px",padding:"10px",color:"#fff",cursor:"pointer",fontSize:"13px"},children:"View All Docs →"})]})})]}),t==="api"&&e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(12, 1fr)",gap:"16px"},children:[e.jsxs("div",{style:{gridColumn:"1 / -1",...te,borderRadius:"20px",padding:"28px",border:"1px solid rgba(0, 212, 255, 0.3)",boxShadow:"0 0 50px rgba(0, 212, 255, 0.15)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"16px",marginBottom:"20px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"14px"},children:[e.jsx("span",{style:{fontSize:"28px"},children:"🚀"}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,color:"#fff",fontSize:"20px",fontWeight:"700"},children:"Pulse Developer API"}),e.jsx("p",{style:{margin:"4px 0 0",color:"#888",fontSize:"13px"},children:"Access AI signals, market data & safety scanning"})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsxs("div",{style:{display:"flex",background:"rgba(15, 15, 15, 0.6)",borderRadius:"10px",padding:"4px",border:"1px solid #333"},children:[e.jsx("button",{onClick:()=>le("monthly"),style:{background:U==="monthly"?"linear-gradient(135deg, #00D4FF, #0099CC)":"transparent",border:"none",borderRadius:"8px",padding:"10px 18px",color:U==="monthly"?"#fff":"#888",cursor:"pointer",fontWeight:"600",fontSize:"12px",transition:"all 0.2s ease"},children:"Monthly"}),e.jsx("button",{onClick:()=>le("annual"),style:{background:U==="annual"?"linear-gradient(135deg, #39FF14, #2ECC71)":"transparent",border:"none",borderRadius:"8px",padding:"10px 18px",color:U==="annual"?"#000":"#888",cursor:"pointer",fontWeight:"600",fontSize:"12px",transition:"all 0.2s ease"},children:"Annual"})]}),U==="annual"&&e.jsx("span",{style:{background:"linear-gradient(135deg, #39FF14, #2ECC71)",color:"#000",fontSize:"10px",fontWeight:"700",padding:"6px 12px",borderRadius:"12px",boxShadow:"0 0 10px rgba(57, 255, 20, 0.4)"},children:"~17% savings"})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:"20px",marginTop:"20px"},children:[e.jsx(kt,{tier:"free",monthlyPrice:0,annualPrice:0,billingPeriod:U,limits:"60 req/min • 2K/day",features:"Market Data + Signals",scopes:Ee.free,isCurrentPlan:ae==="free",onUpgrade:$,onManage:k}),e.jsx(kt,{tier:"pro",monthlyPrice:29,annualPrice:24,billingPeriod:U,limits:"600 req/min • 100K/day",features:"+ Predictions + Accuracy",scopes:Ee.pro,isCurrentPlan:ae==="pro",isPopular:!0,onUpgrade:$,onManage:k}),e.jsx(kt,{tier:"enterprise",monthlyPrice:99,annualPrice:82,billingPeriod:U,limits:"3000 req/min • 1M/day",features:"+ StrikeAgent + Webhooks",scopes:Ee.enterprise,isCurrentPlan:ae==="enterprise",onUpgrade:$,onManage:k})]})]}),e.jsxs("div",{style:{gridColumn:"span 12",display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:"16px"},children:[e.jsxs(Fe,{title:"Generate API Key",icon:"🔐",glowColor:"#00D4FF",children:[e.jsxs("div",{style:{display:"flex",gap:"12px",marginBottom:"12px",flexWrap:"wrap"},children:[e.jsx("input",{type:"text",value:L,onChange:l=>X(l.target.value),placeholder:"Key name (e.g., My Trading Bot)",style:{flex:1,minWidth:"200px",background:"rgba(15, 15, 15, 0.6)",border:"1px solid #333",borderRadius:"8px",padding:"12px",color:"#fff",fontSize:"14px"}}),e.jsxs("div",{style:{display:"flex",gap:"4px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",padding:"4px",border:"1px solid #333"},children:[e.jsx("button",{onClick:()=>E("live"),style:{background:O==="live"?"linear-gradient(135deg, #39FF14, #2ECC71)":"transparent",border:"none",borderRadius:"6px",padding:"8px 14px",color:O==="live"?"#000":"#888",cursor:"pointer",fontWeight:"600",fontSize:"12px"},children:"Live"}),e.jsx("button",{onClick:()=>E("test"),style:{background:O==="test"?"linear-gradient(135deg, #FFB800, #FF8C00)":"transparent",border:"none",borderRadius:"6px",padding:"8px 14px",color:O==="test"?"#000":"#888",cursor:"pointer",fontWeight:"600",fontSize:"12px"},children:"Test"})]}),e.jsx("button",{onClick:P,disabled:f||!L.trim(),style:{background:f?"#333":"linear-gradient(135deg, #00D4FF, #0099CC)",border:"none",borderRadius:"8px",padding:"12px 20px",color:"#fff",cursor:f?"wait":"pointer",fontWeight:"600",opacity:L.trim()?1:.5,boxShadow:!f&&L.trim()?"0 0 15px rgba(0, 212, 255, 0.3)":"none"},children:f?"Generating...":"Generate Key"})]}),e.jsx("div",{style:{fontSize:"11px",color:"#666",marginBottom:"12px"},children:O==="live"?"🟢 Live keys access real data and count against rate limits":"🟡 Test keys return mock data for development - no rate limit impact"}),I&&e.jsxs("div",{style:{background:"rgba(10, 26, 10, 0.6)",border:"2px solid #39FF14",borderRadius:"12px",padding:"20px",marginTop:"16px",boxShadow:"0 0 30px rgba(57, 255, 20, 0.3), inset 0 0 20px rgba(57, 255, 20, 0.05)",animation:"glowPulse 2s ease-in-out infinite"},children:[e.jsx("style",{children:`
                    @keyframes glowPulse {
                      0%, 100% { box-shadow: 0 0 30px rgba(57, 255, 20, 0.3), inset 0 0 20px rgba(57, 255, 20, 0.05); }
                      50% { box-shadow: 0 0 40px rgba(57, 255, 20, 0.5), inset 0 0 30px rgba(57, 255, 20, 0.1); }
                    }
                  `}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"},children:[e.jsx("span",{style:{color:"#39FF14",fontSize:"20px"},children:"✓"}),e.jsx("span",{style:{color:"#39FF14",fontWeight:"700",fontSize:"16px"},children:"API Key Generated!"})]}),e.jsx("div",{style:{background:"rgba(255, 68, 68, 0.1)",border:"1px solid rgba(255, 68, 68, 0.3)",borderRadius:"8px",padding:"12px",marginBottom:"16px"},children:e.jsx("p",{style:{color:"#FF6B6B",fontSize:"13px",margin:0,fontWeight:"600"},children:"⚠️ Save this key now - it cannot be retrieved again!"})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",background:"rgba(15, 15, 15, 0.8)",padding:"14px",borderRadius:"10px",border:"1px solid #39FF1440",fontFamily:"monospace"},children:[e.jsx("code",{style:{flex:1,color:"#00D4FF",fontSize:"13px",wordBreak:"break-all"},children:I.key}),e.jsx("button",{onClick:()=>d(I.key,"newKey"),style:{background:Y.newKey?"#39FF14":"linear-gradient(135deg, #333, #444)",border:"none",borderRadius:"6px",padding:"10px 16px",color:Y.newKey?"#000":"#fff",cursor:"pointer",fontSize:"12px",fontWeight:"600",transition:"all 0.2s ease"},children:Y.newKey?"✓ Copied!":"Copy"})]}),e.jsx("button",{onClick:()=>Z(null),style:{marginTop:"16px",background:"rgba(42, 42, 42, 0.6)",border:"1px solid #444",borderRadius:"8px",padding:"10px 20px",color:"#888",cursor:"pointer",fontSize:"12px",transition:"all 0.2s ease"},children:"Dismiss"})]})]}),m.length>0&&e.jsx(Fe,{title:"Your API Keys",icon:"📋",glowColor:"#8B5CF6",children:e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:m.map(l=>e.jsxs("div",{style:{...te,display:"flex",flexDirection:"column",gap:"10px",padding:"14px",borderRadius:"10px",border:"1px solid #2a2a2a",transition:"all 0.2s ease"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"},children:[e.jsx("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:e.jsxs("div",{children:[e.jsx("div",{style:{color:"#fff",fontWeight:"600",fontSize:"14px"},children:l.name}),e.jsxs("div",{style:{color:"#666",fontSize:"12px",fontFamily:"monospace"},children:[l.prefix,"..."]})]})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx(kn,{environment:l.environment}),e.jsx("span",{style:{padding:"4px 10px",borderRadius:"12px",background:l.status==="active"?"rgba(57, 255, 20, 0.15)":"rgba(255, 107, 53, 0.15)",color:l.status==="active"?"#39FF14":"#FF6B35",fontSize:"11px",fontWeight:"600"},children:l.status==="active"?"Active":"Revoked"})]})]}),l.scopes&&l.scopes.length>0&&e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"4px"},children:l.scopes.map((C,W)=>e.jsx(Sn,{scope:C},W))}),e.jsx("div",{style:{display:"flex",gap:"8px",marginTop:"4px"},children:e.jsx("button",{onClick:()=>w(l.id),style:{padding:"8px 14px",background:"rgba(255, 184, 0, 0.1)",border:"1px solid rgba(255, 184, 0, 0.3)",borderRadius:"6px",color:"#FFB800",fontSize:"11px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s ease"},children:"🔄 Regenerate"})})]},l.id))})})]}),e.jsx("div",{style:{gridColumn:"1 / -1"},children:e.jsxs(Fe,{title:"API Documentation",icon:"📖",fullWidth:!0,glowColor:"#00D4FF",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"},children:[e.jsx("span",{style:{background:"linear-gradient(135deg, #00D4FF, #0099CC)",color:"#fff",padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"700"},children:"v1.21.0"}),e.jsx("span",{style:{color:"#888",fontSize:"12px"},children:"Latest release with WebAuthn & Session Security"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"12px"},children:[e.jsxs("div",{style:{padding:"14px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"10px",border:"1px solid #2a2a2a"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"},children:[e.jsx("span",{style:{background:"#39FF14",color:"#000",padding:"3px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:"700"},children:"GET"}),e.jsx("code",{style:{color:"#ccc",fontSize:"13px"},children:"/api/v1/market-overview?category=top"})]}),e.jsx("p",{style:{color:"#888",fontSize:"12px",margin:0},children:"Get market overview with top coins, BTC dominance, and sentiment"})]}),e.jsxs("div",{style:{padding:"14px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"10px",border:"1px solid #2a2a2a"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"},children:[e.jsx("span",{style:{background:"#39FF14",color:"#000",padding:"3px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:"700"},children:"GET"}),e.jsx("code",{style:{color:"#ccc",fontSize:"13px"},children:"/api/v1/price/:symbol"})]}),e.jsx("p",{style:{color:"#888",fontSize:"12px",margin:0},children:"Get current price for a cryptocurrency (e.g., BTC, ETH, SOL)"})]}),e.jsxs("div",{style:{padding:"14px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"10px",border:"1px solid #2a2a2a"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"},children:[e.jsx("span",{style:{background:"#39FF14",color:"#000",padding:"3px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:"700"},children:"GET"}),e.jsx("code",{style:{color:"#ccc",fontSize:"13px"},children:"/api/v1/signals?symbol=BTC"})]}),e.jsx("p",{style:{color:"#888",fontSize:"12px",margin:0},children:"Get AI analysis signals for a coin (BUY/SELL/HOLD with confidence)"})]}),e.jsxs("div",{style:{padding:"14px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"10px",border:"1px solid rgba(139, 92, 246, 0.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"},children:[e.jsx("span",{style:{background:"#8B5CF6",color:"#fff",padding:"3px 10px",borderRadius:"4px",fontSize:"11px",fontWeight:"700"},children:"PRO"}),e.jsx("code",{style:{color:"#ccc",fontSize:"13px"},children:"/api/v1/predictions/:symbol?horizon=4h"})]}),e.jsx("p",{style:{color:"#888",fontSize:"12px",margin:0},children:"Get ML predictions with probability scores (Pro tier required)"})]})]}),e.jsx("div",{style:{marginTop:"16px",padding:"14px",background:"rgba(26, 26, 42, 0.6)",borderRadius:"10px",border:"1px solid rgba(0, 212, 255, 0.3)"},children:e.jsxs("p",{style:{color:"#00D4FF",fontSize:"13px",margin:0},children:[e.jsx("strong",{children:"Authentication:"})," Include your API key in the ",e.jsx("code",{style:{background:"rgba(15, 15, 15, 0.6)",padding:"3px 8px",borderRadius:"4px"},children:"X-Pulse-Api-Key"})," header"]})})]})}),e.jsx("div",{style:{gridColumn:"1 / -1"},children:e.jsxs(Fe,{title:"🔐 Security Features (v1.21.0)",icon:"🛡️",fullWidth:!0,glowColor:"#39FF14",children:[e.jsxs("div",{style:{marginBottom:"20px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"},children:[e.jsx("span",{style:{fontSize:"18px"},children:"🔑"}),e.jsx("h4",{style:{margin:0,color:"#fff",fontSize:"15px",fontWeight:"600"},children:"Biometric Authentication (WebAuthn)"}),e.jsx("span",{style:{background:"rgba(57, 255, 20, 0.15)",color:"#39FF14",padding:"3px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:"700"},children:"NEW"})]}),e.jsx("p",{style:{color:"#888",fontSize:"13px",margin:"0 0 12px",lineHeight:1.5},children:"Optional 2FA using fingerprint, Face ID, or security keys. Users can enable biometric verification for login, wallet transactions, or both."}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"10px"},children:[e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(57, 255, 20, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{background:"#FFB800",color:"#000",padding:"2px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:"700"},children:"POST"}),e.jsx("code",{style:{color:"#ccc",fontSize:"12px"},children:"/api/webauthn/register-options"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Get WebAuthn registration options for credential creation"})]}),e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(57, 255, 20, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{background:"#FFB800",color:"#000",padding:"2px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:"700"},children:"POST"}),e.jsx("code",{style:{color:"#ccc",fontSize:"12px"},children:"/api/webauthn/register-verify"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Verify and store new biometric credential"})]}),e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(57, 255, 20, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{background:"#FFB800",color:"#000",padding:"2px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:"700"},children:"POST"}),e.jsx("code",{style:{color:"#ccc",fontSize:"12px"},children:"/api/webauthn/auth-options"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Get authentication challenge for biometric login"})]}),e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(57, 255, 20, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{background:"#FFB800",color:"#000",padding:"2px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:"700"},children:"POST"}),e.jsx("code",{style:{color:"#ccc",fontSize:"12px"},children:"/api/webauthn/auth-verify"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Verify biometric authentication response"})]})]}),e.jsx("div",{style:{marginTop:"12px",padding:"10px 14px",background:"rgba(57, 255, 20, 0.05)",borderRadius:"8px",border:"1px solid rgba(57, 255, 20, 0.15)"},children:e.jsxs("p",{style:{color:"#39FF14",fontSize:"12px",margin:0},children:["💡 ",e.jsx("strong",{children:"User Settings:"})," Enable for login only, wallet transactions only, both, or neither. Fully user-controlled."]})})]}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"},children:[e.jsx("span",{style:{fontSize:"18px"},children:"🔒"}),e.jsx("h4",{style:{margin:0,color:"#fff",fontSize:"15px",fontWeight:"600"},children:"Session Security"}),e.jsx("span",{style:{background:"rgba(57, 255, 20, 0.15)",color:"#39FF14",padding:"3px 8px",borderRadius:"4px",fontSize:"10px",fontWeight:"700"},children:"NEW"})]}),e.jsx("p",{style:{color:"#888",fontSize:"13px",margin:"0 0 12px",lineHeight:1.5},children:"Enhanced session management with automatic token rotation for improved security."}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"10px"},children:[e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(0, 212, 255, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{color:"#00D4FF",fontSize:"14px"},children:"🔄"}),e.jsx("span",{style:{color:"#fff",fontSize:"13px",fontWeight:"600"},children:"Token Rotation"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Session tokens rotate automatically to prevent session hijacking"})]}),e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(0, 212, 255, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{color:"#00D4FF",fontSize:"14px"},children:"📡"}),e.jsx("span",{style:{color:"#fff",fontSize:"13px",fontWeight:"600"},children:"X-Session-Token-Rotated"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Response header signals when token has been refreshed"})]}),e.jsxs("div",{style:{padding:"12px",background:"rgba(15, 15, 15, 0.6)",borderRadius:"8px",border:"1px solid rgba(0, 212, 255, 0.2)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"},children:[e.jsx("span",{style:{color:"#00D4FF",fontSize:"14px"},children:"⏱️"}),e.jsx("span",{style:{color:"#fff",fontSize:"13px",fontWeight:"600"},children:"Tier-Based Durations"})]}),e.jsx("p",{style:{color:"#666",fontSize:"11px",margin:0},children:"Session lengths vary by subscription tier for flexible security"})]})]}),e.jsx("div",{style:{marginTop:"12px",padding:"10px 14px",background:"rgba(0, 212, 255, 0.05)",borderRadius:"8px",border:"1px solid rgba(0, 212, 255, 0.15)"},children:e.jsxs("p",{style:{color:"#00D4FF",fontSize:"12px",margin:0},children:["🔧 ",e.jsx("strong",{children:"Frontend Integration:"})," Check for ",e.jsx("code",{style:{background:"rgba(15, 15, 15, 0.6)",padding:"2px 6px",borderRadius:"4px"},children:"X-Session-Token-Rotated"})," header and update stored token when present."]})})]})]})})]}),t==="documents"&&e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"20px"},children:[e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:"1px solid #2a2a2a"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"},children:[e.jsx("span",{style:{fontSize:"20px"},children:"⚡"}),e.jsx("h3",{style:{margin:0,color:"#fff",fontSize:"16px",fontWeight:"600"},children:"Quick Access"})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",gap:"12px"},children:[{...Ce[1].docs[0],color:"#39FF14"},{...Ce[0].docs[1],color:"#00D4FF"},{...Ce[2].docs[1],color:"#8B5CF6"},{...Ce[0].docs[2],color:"#00D4FF"}].map(l=>e.jsx(vn,{doc:l,onView:z,color:l.color},l.id))})]}),Ce.map(l=>e.jsx(yn,{category:l,onViewDoc:z},l.id)),e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:"1px solid #333",textAlign:"center"},children:[e.jsxs("div",{style:{fontSize:"14px",color:"#888",marginBottom:"8px"},children:["Total Documents: ",Ce.reduce((l,C)=>l+C.docs.length,0)]}),e.jsx("div",{style:{fontSize:"11px",color:"#666"},children:"Click any document to view. All files are in markdown format."})]})]}),t==="tasks"&&e.jsxs("div",{children:[e.jsxs("div",{style:{...te,borderRadius:"12px",padding:"20px",marginBottom:"20px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"},children:[e.jsx("span",{style:{color:"#fff",fontWeight:"600"},children:"Progress"}),e.jsxs("span",{style:{color:"#00D4FF",fontWeight:"700"},children:[R,"%"]})]}),e.jsx("div",{style:{height:"12px",background:"#2a2a2a",borderRadius:"6px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${R}%`,height:"100%",background:"linear-gradient(90deg, #00D4FF, #39FF14)",borderRadius:"6px",transition:"width 0.3s ease"}})}),e.jsxs("div",{style:{marginTop:"8px",display:"flex",gap:"16px",fontSize:"12px",color:"#666"},children:[e.jsxs("span",{children:["🔴 High: ",u.filter(l=>l.priority==="high"&&!l.done).length]}),e.jsxs("span",{children:["🟡 Medium: ",u.filter(l=>l.priority==="medium"&&!l.done).length]}),e.jsxs("span",{children:["🟢 Low: ",u.filter(l=>l.priority==="low"&&!l.done).length]})]})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[...u].sort((l,C)=>{if(l.done!==C.done)return l.done?1:-1;const W={high:0,medium:1,low:2};return W[l.priority]-W[C.priority]}).map(l=>e.jsx(jn,{task:l,onToggle:q},l.id))})]}),t==="analytics"&&e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"16px"},children:i?e.jsx("div",{style:{gridColumn:"1 / -1",textAlign:"center",padding:"40px",color:"#888"},children:"Loading analytics..."}):e.jsxs(e.Fragment,{children:[e.jsx(da,{count:o}),e.jsx(Ye,{title:"Today",value:B.today?.views||0,subtitle:`${B.today?.sessions||0} sessions`,icon:"📅",glow:"#00D4FF"}),e.jsx(Ye,{title:"This Week",value:B.week?.views||0,icon:"📊",glow:"#39FF14"}),e.jsx(Ye,{title:"This Month",value:B.month?.views||0,icon:"📈",glow:"#8B5CF6"}),e.jsx(Ye,{title:"All Time",value:B.allTime?.views||0,subtitle:`${B.allTime?.sessions||0} unique sessions`,icon:"🌍",glow:"#FF6B35"}),e.jsx(pa,{title:"Top Pages",items:B.topPages||[],labelKey:"page",valueKey:"views",icon:"📄"}),e.jsx(pa,{title:"Top Referrers",items:B.topReferrers||[],labelKey:"referrer",valueKey:"count",icon:"🔗"}),e.jsx(fn,{data:B.deviceBreakdown||{desktop:0,mobile:0,tablet:0}}),e.jsxs("div",{style:{...te,borderRadius:"16px",padding:"20px",border:"1px solid #2a2a2a"},children:[e.jsx("div",{style:{fontWeight:"600",color:"#fff",marginBottom:"12px"},children:"Avg. Session Duration"}),e.jsxs("div",{style:{fontSize:"36px",fontWeight:"700",color:"#00D4FF"},children:[Math.floor((B.avgDuration||0)/60),"m ",(B.avgDuration||0)%60,"s"]})]})]})}),j&&e.jsx(wn,{doc:j,content:y,onClose:()=>g(null)}),e.jsx(Fn,{isOpen:!!de,title:"Regenerate API Key?",message:"This will invalidate your current key and generate a new one. Any applications using the old key will stop working immediately.",onConfirm:()=>J(de),onCancel:()=>w(null)})]})}export{Qa as A,$n as D,Wn as F,zn as G,ta as P,Ln as S,Dn as T,In as W,En as a,Pn as b,Oa as c,ye as d,Tn as e,Ya as f,_n as g,Mn as h,Ha as i,Rn as j,An as s,Bn as u};
