// Trading Card Profile Page - Displays when QR is scanned
console.log('✅ Trading Card Profile system loaded');

function initTradingCardProfile() {
  // Check if we're on the profile page
  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get('cardId');

  if (!cardId) return;

  // Find the card
  const card = TRADING_CARDS.find(c => c.id === cardId);
  if (!card) {
    document.body.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;"><h1>❌ Card Not Found</h1></div>';
    return;
  }

  // Build profile page
  const profileHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${card.name} - DarkWave Trading Card</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a3f 100%);
          color: #fff;
          font-family: 'Orbitron', monospace;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .profile-container {
          max-width: 500px;
          width: 100%;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid rgba(56, 97, 251, 0.4);
          border-radius: 20px;
          padding: 32px 24px;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(56, 97, 251, 0.3);
        }

        .profile-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .profile-header h1 {
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 4px;
          letter-spacing: 1px;
          color: var(--accent-blue, #3861FB);
        }

        .profile-header p {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-image {
          width: 100%;
          max-width: 250px;
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          margin: 0 auto 24px;
          border: 3px solid rgba(56, 97, 251, 0.3);
          box-shadow: 0 0 30px rgba(56, 97, 251, 0.2);
        }

        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .info-item {
          background: rgba(56, 97, 251, 0.1);
          border: 1px solid rgba(56, 97, 251, 0.3);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
        }

        .info-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--accent-blue, #3861FB);
        }

        .profile-details {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(56, 97, 251, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .detail-section {
          margin-bottom: 12px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .detail-text {
          font-size: 12px;
          line-height: 1.5;
          color: #ddd;
        }

        .profile-serial {
          background: rgba(56, 97, 251, 0.15);
          border-left: 3px solid var(--accent-blue, #3861FB);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 24px;
        }

        .serial-label {
          font-size: 9px;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .serial-number {
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-blue, #3861FB);
          letter-spacing: 1px;
        }

        .profile-footer {
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid rgba(56, 97, 251, 0.2);
          padding-top: 16px;
        }

        .profile-footer p {
          margin: 4px 0;
        }

        .back-link {
          display: inline-block;
          margin-top: 20px;
          padding: 8px 16px;
          background: rgba(56, 97, 251, 0.2);
          border: 1px solid rgba(56, 97, 251, 0.4);
          color: var(--accent-blue, #3861FB);
          text-decoration: none;
          border-radius: 6px;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .back-link:hover {
          background: rgba(56, 97, 251, 0.4);
          transform: translateX(-4px);
        }

        .qr-section {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(56, 97, 251, 0.2);
        }

        .qr-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 12px;
        }

        .qr-display {
          background: #fff;
          padding: 12px;
          border-radius: 10px;
          display: inline-block;
          border: 2px solid rgba(56, 97, 251, 0.3);
        }

        .qr-display canvas {
          display: block;
          width: 150px;
          height: 150px;
        }
      </style>
    </head>
    <body>
      <div class="profile-container">
        <div class="profile-header">
          <h1>${card.name.toUpperCase()}</h1>
          <p>Trading Card - Series #1</p>
        </div>

        <div class="profile-image">
          <img src="${card.image}" alt="${card.name}" />
        </div>

        <div class="profile-info">
          <div class="info-item">
            <div class="info-label">Gender</div>
            <div class="info-value">${card.gender}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Race</div>
            <div class="info-value">${card.race}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Age</div>
            <div class="info-value">${card.age === 'UNKNOWN' ? 'UNKNOWN' : card.age}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Refractor</div>
            <div class="info-value" style="font-size: 11px;">${card.refractorColor}</div>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-section">
            <div class="detail-label">Career Highlight</div>
            <div class="detail-text">${card.careerNote}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">Fun Fact</div>
            <div class="detail-text">${card.funFact}</div>
          </div>
        </div>

        <div class="profile-serial">
          <div class="serial-label">SERIAL NUMBER</div>
          <div class="serial-number">${card.serialNumber}</div>
        </div>

        <div class="qr-section">
          <div class="qr-label">Collectible ID</div>
          <div class="qr-display" id="profileQr"></div>
        </div>

        <div class="profile-footer">
          <p>🎴 DarkWave Pulse NFT Trading Card</p>
          <p>Limited Series #1 - Collectible Edition</p>
          <p>December 25, 2025 Launch</p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="/" class="back-link">← Back to DarkWave</a>
        </div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <script>
        // Generate QR code for this card
        setTimeout(() => {
          const qrContainer = document.getElementById('profileQr');
          if (qrContainer && typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
              text: window.location.href,
              width: 150,
              height: 150,
              colorDark: '#000',
              colorLight: '#fff',
              correctLevel: QRCode.CorrectLevel.H
            });
          }
        }, 100);
      <\/script>
    </body>
    </html>
  `;

  document.open();
  document.write(profileHTML);
  document.close();
}

// Initialize if DOM is ready
if (document.readyState !== 'loading') {
  initTradingCardProfile();
} else {
  document.addEventListener('DOMContentLoaded', initTradingCardProfile);
}

console.log('✅ Trading Card Profile ready');
