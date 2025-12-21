# Orbit Ecosystem Integration Protocol

## Pulse Ecosystem Metadata

**Endpoint**: `GET /api/ecosystem/pulse`

Returns the standardized metadata for DarkWave Pulse:

```json
{
  "appName": "DarkWave Pulse",
  "category": "DeFi",
  "hook": "AI-Powered Trading Intelligence for the Modern Trader",
  "valueProposition": "Pulse is a complete turnkey crypto trading business system that combines institutional-grade AI analysis with autonomous trading capabilities. The platform features StrikeAgent, an AI-powered trading bot with four operational modes (Observer, Approval, Semi-Auto, Full-Auto) that enables traders of all skill levels to participate in crypto markets with confidence. Built-in wallet management supports 22+ chains, WebAuthn biometric authentication ensures security, and blockchain-verified predictions provide transparency. With real-time market signals, technical analysis, and a Developer API for custom integrations, Pulse delivers a comprehensive business-in-a-box solution for crypto trading.",
  "keyTags": ["Auto-Trading", "AI Signals", "Multi-Chain", "StrikeAgent"],
  "imagePrompt": "Futuristic cryptocurrency trading dashboard, dark mode glassmorphic UI with neon cyan (#00D4FF) and green (#39FF14) accents, real-time candlestick charts with AI prediction overlays, circular confidence gauges showing 65.7% win rate, live trading signals panel displaying SNIPE and WATCH alerts, token price feeds with sparkline charts, glassmorphic cards with subtle glow effects, semi-transparent panels on solid black (#0a0a0a) background, StrikeAgent bot icon with pulsing live indicator, highly detailed modern fintech interface, 8k resolution",
  "websiteUrl": "https://pulse.darkwavestudios.io"
}
```

## Dev Hub API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ecosystem/pulse` | GET | Get Pulse's ecosystem metadata |
| `/api/ecosystem/apps` | GET | List all approved ecosystem apps |
| `/api/ecosystem/register` | POST | Register a new app (returns API key) |
| `/api/ecosystem/update` | PUT | Update app data (requires x-api-key header) |
| `/api/ecosystem/approve/:appId` | POST | Approve pending app (requires x-admin-key header) |
| `/api/ecosystem/pending` | GET | List pending apps (requires x-admin-key header) |

## Agent Registration Example

To register your app with the Orbit ecosystem:

```bash
curl -X POST "https://pulse.darkwavestudios.io/api/ecosystem/register" \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "Your App Name",
    "category": "Enterprise",
    "hook": "5-10 word punchy tagline",
    "valueProposition": "Full turnkey business description...",
    "keyTags": ["Tag1", "Tag2", "Tag3"],
    "imagePrompt": "Dark mode glassmorphic dashboard with...",
    "websiteUrl": "https://yourapp.com",
    "submittedBy": "agent-name"
  }'
```

Response:
```json
{
  "success": true,
  "message": "App registered successfully. Pending approval.",
  "appId": "uuid-here",
  "apiKey": "orbit_xxxxx",
  "status": "pending"
}
```

## Updating Your App

Use the API key received during registration:

```bash
curl -X PUT "https://pulse.darkwavestudios.io/api/ecosystem/update" \
  -H "Content-Type: application/json" \
  -H "x-api-key: orbit_your_api_key" \
  -d '{
    "hook": "Updated tagline",
    "generatedImageUrl": "https://..."
  }'
```

## Required Data Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appName | string | Yes | Official product name |
| category | string | Yes | e.g., Enterprise, DeFi, Automation, Gaming |
| hook | string | Yes | 5-10 word punchy tagline |
| valueProposition | string | Yes | Full turnkey business description |
| keyTags | string[] | No | 3-4 keywords (max 10) |
| imagePrompt | string | No | Text-to-image prompt for dark/glassmorphic UI |
| websiteUrl | string | No | App URL |
| submittedBy | string | No | Agent/user identifier |

## Handoff Message Template

Copy this block and send to other agents:

```
🚀 Ecosystem Integration Request: Orbit Blockchain

To Agent:
We are integrating your application into the central Orbit Ecosystem Portal. To ensure your app is represented correctly as a "Complete Turnkey Business System," please generate the following metadata and push it to the DarkWave Developer Hub.

Required Data Structure:
- App Name: (Official Product Name)
- Category: (e.g., Enterprise, DeFi, Automation, Gaming)
- The "Hook" (One-Liner): A punchy, 5-10 word tagline.
- Value Proposition: A descriptive paragraph explaining how this app functions as a complete, turnkey business system. Focus on utility and "business-in-a-box" features.
- Key Tags: 3-4 keywords (e.g., "Supply Chain," "Auto-Trading," "Franchise Mgmt").
- Visual Style & Image Prompt:
  - Context: The Orbit Portal uses a "Dark/Glassmorphic" aesthetic.
  - Action: Please write a highly detailed Text-to-Image Prompt that describes your app's actual dashboard or hero UI.
  - Example: "Futuristic [App Type] dashboard, data visualization of [Key Metric], neon [Color] accents, glassmorphic panels, highly detailed UI elements showing [Specific Feature], dark mode, 8k resolution."

Action:
POST your data to: https://pulse.darkwavestudios.io/api/ecosystem/register
```
