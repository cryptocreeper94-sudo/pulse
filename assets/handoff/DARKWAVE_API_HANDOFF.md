# DarkWave Studios API Integration Handoff

## Overview
This document provides everything needed for DarkWave Studios to connect external customers to Pulse's Quant and Predictive AI systems.

---

## Production API Base URL
```
https://pulse.darkwavestudios.io/api
```
(Or current deployed Replit URL)

---

## Available API Endpoints

### 1. ML Prediction Stats (Primary)
```
GET /api/ml/stats
```
Returns comprehensive prediction statistics including:
- Total predictions count
- Buy/Sell/Hold signal distribution
- Win rates by time horizon (1H, 4H, 24H, 7D)
- Recent predictions with confidence levels

**Sample Response:**
```json
{
  "totalPredictions": 134937,
  "buySignals": 16629,
  "sellSignals": 39387,
  "holdSignals": 4297,
  "outcomesByHorizon": {
    "1h": { "total": 6115, "correct": 4147, "winRate": "67.8" },
    "4h": { "total": 5732, "correct": 3932, "winRate": "68.6" },
    "24h": { "total": 5047, "correct": 3174, "winRate": "62.9" },
    "7d": { "total": 2949, "correct": 1753, "winRate": "59.4" }
  },
  "recentPredictions": [...]
}
```

### 2. StrikeAgent Stats
```
GET /api/sniper/ml/stats
```
Returns StrikeAgent-specific prediction data for token sniping system.

### 3. Accuracy Trends
```
GET /api/ml/accuracy-trends
```
Historical accuracy trends by time horizon for tracking model performance over time.

### 4. Model Status
```
GET /api/ml/model-status
```
Current ML model versions, training dates, and active status.

### 5. Drift Detection
```
GET /api/ml/drift-status
```
Model drift monitoring - alerts when accuracy degrades.

### 6. Market Data
```
GET /api/market/overview?assetClass=crypto&category=top
GET /api/crypto/category?category=top&timeframe=24h
GET /api/btc/history?days=7
GET /api/market/global
```

### 7. Fear & Greed Index
```
GET /api/fear-greed
```

---

## API Tier System (For Customer Pricing)

### Free Tier
- Scopes: `market:read`, `signals:read`
- Rate Limit: 100 requests/day
- Use Case: Basic market data access

### Pro Tier
- Scopes: `market:read`, `signals:read`, `predictions:read`, `accuracy:read`
- Rate Limit: 10,000 requests/day
- Use Case: Full prediction access

### Enterprise Tier
- Scopes: All above + `strikeagent:read`, `webhooks:write`
- Rate Limit: Unlimited
- Use Case: Full quant system access + webhooks

---

## Authentication Setup Required

The Developer Portal (accessible at `/tab/developers`) allows customers to:
1. Generate API keys
2. View usage statistics
3. Manage webhook endpoints

**For DarkWave Studios to complete:**
- [ ] Set up API key generation backend
- [ ] Implement rate limiting per tier
- [ ] Connect Stripe for billing
- [ ] Set up usage tracking/metering

---

## Database Tables for Reference

### Predictions Table: `strikeagent_predictions`
- 74,624 records
- Fields: id, token, signal, confidence, created_at, price_at_prediction

### Outcomes Table: `strikeagent_outcomes`  
- 19,590 records
- Fields: prediction_id, outcome, price_at_outcome, verified_at

### ML Predictions: `prediction_outcomes`
- 253 records (summarized data)
- Tracks accuracy across all horizons

---

## Environment Variables Needed

For API system:
- `DATABASE_URL` - PostgreSQL connection (already configured)
- `STRIPE_SECRET_KEY` - For billing (already configured)

For external customers connecting:
- They will receive an API key upon registration
- Keys should be passed in header: `Authorization: Bearer <api_key>`

---

## Webhook System (Enterprise)

Enterprise customers can register webhooks to receive:
- Real-time prediction signals
- Model retraining notifications
- Accuracy threshold alerts

**Webhook Payload Example:**
```json
{
  "event": "prediction.new",
  "data": {
    "ticker": "BTC",
    "signal": "BUY",
    "confidence": "HIGH",
    "horizons": ["1h", "4h", "24h"]
  },
  "timestamp": "2026-02-02T10:00:00Z"
}
```

---

## What DarkWave Studios Needs to Build

1. **API Gateway Layer** - Handle authentication, rate limiting
2. **Customer Dashboard** - For API key management
3. **Billing Integration** - Stripe metering for usage-based pricing
4. **Documentation Site** - Public API docs for customers

---

## Contact Points

- **Pulse Platform**: Live at production URL
- **Developer Portal**: `/tab/developers`
- **API Docs**: Available in Developer Portal

---

## Quick Test Commands

```bash
# Test prediction stats
curl https://[YOUR-URL]/api/ml/stats

# Test StrikeAgent stats
curl https://[YOUR-URL]/api/sniper/ml/stats

# Test market data
curl https://[YOUR-URL]/api/market/overview?assetClass=crypto&category=top
```

---

*Last Updated: February 2, 2026*
*Platform Version: 1.20.125*
