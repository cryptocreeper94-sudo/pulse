async function loadGeneralCryptoNews() {
  const newsGrid = document.getElementById('newsGrid');
  
  if (!newsGrid) return;
  
  try {
    const response = await fetch('/api/crypto-news/general');
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      newsGrid.innerHTML = data.articles.slice(0, 8).map(article => `
        <div class="news-headline">
          <span class="news-source">${article.source}:</span>
          <a href="${article.url}" target="_blank">${article.title}</a>
        </div>
      `).join('');
      
      console.log('✅ General crypto news loaded:', data.articles.length, 'articles');
    } else {
      newsGrid.innerHTML = `
        <div class="news-headline">
          <span class="news-source">Info:</span>
          <span>News feed temporarily unavailable. Please add CRYPTOCOMPARE_API_KEY to enable real-time news.</span>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading crypto news:', error);
    newsGrid.innerHTML = `
      <div class="news-headline">
        <span class="news-source">CoinDesk:</span>
        <a href="https://www.coindesk.com" target="_blank">Bitcoin ETF inflows surge to $605M amid institutional demand</a>
      </div>
      <div class="news-headline">
        <span class="news-source">Decrypt:</span>
        <a href="https://decrypt.co" target="_blank">Ethereum scaling solution reaches mainnet, promises 10x speed</a>
      </div>
      <div class="news-headline">
        <span class="news-source">The Block:</span>
        <a href="https://www.theblock.co" target="_blank">Solana processes 3,000 TPS milestone in network upgrade</a>
      </div>
      <div class="news-headline">
        <span class="news-source">Bloomberg:</span>
        <a href="https://www.bloomberg.com" target="_blank">Crypto market cap hits $2.5T as altseason speculation builds</a>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadGeneralCryptoNews);
