import { useState } from 'react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'overview',
      title: '1. Overview',
      content: `This Privacy Policy describes how DarkWave Studios, LLC ("Company," "we," "us," or "our") collects, uses, stores, and protects your personal information when you use Pulse ("the Platform"), located at pulse.tlid.io.

We are committed to protecting your privacy and ensuring transparency about our data practices. This policy applies to all users of the Platform, including visitors, registered users, and subscribers.

By using Pulse, you consent to the data practices described in this Privacy Policy. If you do not agree, please discontinue use of the Platform.`
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      content: `We collect the following categories of personal information:

ACCOUNT INFORMATION
• Name and email address (via Firebase Authentication)
• Google or GitHub account identifiers (OAuth login)
• Account preferences and settings
• Subscription tier and billing status

FINANCIAL & TRADING DATA
• Cryptocurrency wallet addresses (Solana and EVM chains)
• Trading activity and transaction history
• Auto-trade configuration and preferences
• Portfolio holdings and watchlists
• AI prediction interactions and signal history

WALLET & KEY DATA
• Encrypted private keys for linked trading wallets (AES-256-GCM encrypted, never stored in plaintext)
• Custom Solana RPC endpoint URLs

COMMUNICATION DATA
• Phone number (if SMS notifications are enabled)
• SMS opt-in consent status and timestamp
• Email address for notifications

USAGE DATA
• Pages visited and features used
• Device type, browser, and operating system
• IP address and approximate location
• Session duration and interaction patterns
• Error logs and performance data

MARKET DATA INTERACTIONS
• Coins and tokens you search for or analyze
• Favorite coins and custom dashboard configurations
• Alert preferences and trigger conditions`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      content: `We use your personal information for the following purposes:

SERVICE DELIVERY
• Authenticating your identity and managing your account
• Executing trades on your behalf (when auto-trading is enabled)
• Delivering AI-powered trading signals and predictions
• Processing subscription payments via Stripe
• Providing market data, charts, and analytics

NOTIFICATIONS
• Sending email notifications about trade executions and account activity
• Sending SMS notifications via Twilio (only with your explicit opt-in consent)
• Delivering system alerts, security notices, and service updates

PLATFORM IMPROVEMENT
• Training and improving our AI prediction models using aggregated, anonymized data
• Analyzing usage patterns to improve features and user experience
• Debugging errors and maintaining platform stability
• Conducting security audits and fraud prevention

LEGAL & COMPLIANCE
• Complying with applicable laws, regulations, and legal processes
• Enforcing our Terms of Service
• Preventing fraud, money laundering, and other prohibited activities
• Responding to lawful requests from government authorities`
    },
    {
      id: 'auto-trading',
      title: '4. Auto-Trading Data Practices',
      content: `If you enable Pulse's AI autonomous trading system, additional data practices apply:

WALLET KEY STORAGE
• Your Solana private key is encrypted using AES-256-GCM with a server-side secret before storage
• The plaintext private key is never logged, displayed, or stored unencrypted
• You can unlink your wallet at any time, which permanently deletes the encrypted key from our database

TRADE EXECUTION DATA
• We record all trade decisions (executed, failed, rejected, paper trades) including token addresses, amounts, transaction signatures, and timestamps
• This data is used to calculate your performance statistics, enforce safety limits (kill switch), and improve the AI system
• Trade data is retained for the lifetime of your account plus 7 years for tax and regulatory compliance

CUSTOM RPC ENDPOINTS
• If you provide a custom Solana RPC URL, it is stored in your configuration and used exclusively for your trade executions
• We do not share your custom RPC endpoint with other users

AI DECISION LOGGING
• The ML prediction scanner evaluates signals against your personal thresholds (confidence, accuracy, allowed signals, horizons)
• Evaluation decisions are logged for transparency and debugging but do not include your private key material`
    },
    {
      id: 'sms',
      title: '5. SMS Notifications & TCPA Compliance',
      content: `SMS CONSENT
• We will only send you SMS notifications if you explicitly opt in by providing your phone number and checking the consent box in Auto-Trade Settings
• Your consent is recorded with a timestamp for compliance purposes
• You can revoke consent at any time by unchecking the SMS opt-in box in your settings

TYPES OF SMS MESSAGES
• Trade execution confirmations (buys and sells)
• Trade failure notifications
• Kill switch activation alerts (consecutive loss safety triggers)
• Pending trade approval reminders (Approval mode only)

SMS DATA
• Your phone number is stored in our database and shared with Twilio solely for the purpose of delivering SMS messages
• We do not use your phone number for marketing, advertising, or any purpose other than trade notifications
• Message and data rates from your carrier may apply
• Message frequency depends on your trading activity

OPT-OUT
• You can stop receiving SMS at any time by unchecking the SMS consent box in your Auto-Trade Settings
• You may also text STOP to our sending number
• Upon opt-out, your phone number is retained in your account settings but no further messages are sent`
    },
    {
      id: 'third-parties',
      title: '6. Third-Party Services & Data Sharing',
      content: `We share data with the following third-party services as necessary to operate the Platform:

FIREBASE (GOOGLE)
• Purpose: User authentication (Google and GitHub OAuth)
• Data shared: Email address, display name, authentication tokens
• Privacy policy: https://firebase.google.com/support/privacy

STRIPE
• Purpose: Subscription billing and payment processing
• Data shared: Email address, payment method details (handled directly by Stripe), subscription status
• Privacy policy: https://stripe.com/privacy

TWILIO
• Purpose: SMS trade notifications
• Data shared: Phone number, message content
• Data shared only when: You have explicitly opted in to SMS notifications
• Privacy policy: https://www.twilio.com/legal/privacy

COINGECKO
• Purpose: Cryptocurrency market data (prices, charts, rankings)
• Data shared: API requests (no personal data)
• Privacy policy: https://www.coingecko.com/en/privacy

HELIUS
• Purpose: Solana blockchain RPC services and NFT data
• Data shared: Wallet addresses, transaction requests
• Privacy policy: https://helius.dev/privacy-policy

ALCHEMY
• Purpose: Ethereum and EVM chain blockchain data
• Data shared: Wallet addresses, API requests
• Privacy policy: https://www.alchemy.com/policies/privacy-policy

JUPITER AGGREGATOR
• Purpose: Solana token swap execution for auto-trades
• Data shared: Wallet addresses, swap parameters
• Note: Jupiter is a decentralized protocol; transactions are on-chain and publicly visible

We do not sell your personal information to third parties. We do not share your data with advertisers or data brokers.`
    },
    {
      id: 'data-security',
      title: '7. Data Security',
      content: `We implement the following security measures to protect your data:

ENCRYPTION
• All data in transit is encrypted using TLS 1.2+
• Trading wallet private keys are encrypted at rest using AES-256-GCM
• Database connections use SSL encryption
• Passwords and sensitive tokens are hashed, never stored in plaintext

ACCESS CONTROLS
• Server-side secrets are managed through environment variables, not hardcoded
• Database access is restricted to authorized application processes
• Administrative access requires PIN authentication with session timeouts
• API endpoints enforce authentication checks before returning user data

INFRASTRUCTURE
• The Platform runs on Replit's managed infrastructure with automated security updates
• PostgreSQL database with encrypted connections
• Regular security monitoring and logging

LIMITATIONS
• No system is 100% secure. While we take extensive precautions, we cannot guarantee absolute security
• You are responsible for maintaining the security of your account credentials, wallet recovery phrases, and linked devices
• If you suspect unauthorized access, contact us immediately at security@darkwavestudios.io`
    },
    {
      id: 'data-retention',
      title: '8. Data Retention',
      content: `We retain your data according to the following schedule:

ACCOUNT DATA
• Retained for the lifetime of your account
• Deleted within 30 days of account deletion request, except where retention is required by law

TRADING DATA & TRANSACTION HISTORY
• Retained for 7 years after account closure for tax reporting and regulatory compliance
• Aggregated, anonymized trading data may be retained indefinitely for AI model improvement

WALLET KEYS
• Encrypted trading wallet keys are deleted immediately upon unlinking
• No backup or copy of plaintext keys is ever retained

SMS CONSENT RECORDS
• Opt-in/opt-out timestamps retained for 5 years for TCPA compliance documentation

SERVER LOGS
• Application logs retained for 90 days
• Security and access logs retained for 1 year

SUBSCRIPTION & BILLING DATA
• Retained by Stripe according to their data retention policies
• Our records of subscription status retained for 7 years for tax purposes`
    },
    {
      id: 'your-rights',
      title: '9. Your Rights',
      content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:

ACCESS
• You can request a copy of all personal data we hold about you
• Contact us at privacy@darkwavestudios.io to submit an access request

CORRECTION
• You can update your account information at any time through Platform settings
• Contact us to correct any data you cannot modify yourself

DELETION
• You can request deletion of your account and associated personal data
• Certain data may be retained as required by law (see Data Retention section)
• To request deletion, contact privacy@darkwavestudios.io

PORTABILITY
• You can request your data in a structured, machine-readable format
• Trade history and portfolio data can be exported from the Platform

OPT-OUT
• You can opt out of SMS notifications at any time in your Auto-Trade Settings
• You can opt out of email notifications in your account settings
• You can unlink trading wallets to stop auto-trade data collection

CALIFORNIA RESIDENTS (CCPA)
• You have the right to know what personal information is collected, used, shared, or sold
• You have the right to delete personal information held by businesses
• You have the right to opt-out of the sale of personal information (we do not sell personal information)
• You have the right to non-discrimination for exercising your CCPA rights
• To exercise your CCPA rights, contact privacy@darkwavestudios.io or call the number listed in the Contact section

EUROPEAN RESIDENTS (GDPR)
• You have additional rights including the right to restrict processing, object to processing, and withdraw consent
• Our legal basis for processing includes contract performance, legitimate interest, and consent
• For GDPR inquiries, contact our data protection contact at privacy@darkwavestudios.io`
    },
    {
      id: 'cookies',
      title: '10. Cookies & Local Storage',
      content: `The Platform uses the following browser storage technologies:

LOCAL STORAGE
• Authentication tokens and session data
• User preferences (theme, language, dashboard layout)
• Cached market data for performance
• Skin and UI customization settings

COOKIES
• Firebase authentication session cookies (essential for login)
• No third-party advertising or tracking cookies are used
• No cross-site tracking is performed

SERVICE WORKERS
• Used for PWA (Progressive Web App) functionality
• Caches static assets for offline access and faster loading
• Does not track or store personal information`
    },
    {
      id: 'children',
      title: '11. Children\'s Privacy',
      content: `Pulse is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected personal information from a child under 18, we will delete that information promptly.

If you believe a child under 18 has provided us with personal information, please contact us at privacy@darkwavestudios.io.`
    },
    {
      id: 'international',
      title: '12. International Data Transfers',
      content: `The Platform is operated from the United States. If you access the Platform from outside the United States, your data may be transferred to and processed in the United States, where data protection laws may differ from those in your jurisdiction.

By using the Platform, you consent to the transfer of your data to the United States.

For users in the European Economic Area (EEA), we rely on Standard Contractual Clauses and other approved transfer mechanisms when transferring data outside the EEA.`
    },
    {
      id: 'blockchain',
      title: '13. Blockchain & On-Chain Data',
      content: `IMPORTANT: Certain data associated with your use of the Platform is recorded on public blockchains (primarily Solana) and cannot be modified or deleted:

• Transaction signatures and amounts from auto-trades executed on-chain
• Wallet addresses involved in transactions
• Smart contract interactions

This on-chain data is publicly visible and immutable by nature of blockchain technology. We cannot delete, modify, or restrict access to on-chain data.

Trust Layer hallmarks associated with your account are hashed records that do not contain personally identifiable information in their on-chain representation.`
    },
    {
      id: 'changes',
      title: '14. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When we make material changes:
• We will post the updated policy with a new "Last Updated" date
• We will notify you via email or in-app notification for significant changes
• Continued use of the Platform after changes constitutes acceptance

We encourage you to review this Privacy Policy periodically.`
    },
    {
      id: 'contact',
      title: '15. Contact Us',
      content: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, contact us:

DarkWave Studios, LLC
Email: privacy@darkwavestudios.io
General support: support@darkwavestudios.io
Legal inquiries: legal@darkwavestudios.io
Security reports: security@darkwavestudios.io
Website: https://pulse.tlid.io

For California residents: You may also submit requests via email with the subject line "CCPA Request."

For European residents: Our data protection contact can be reached at privacy@darkwavestudios.io.

We will respond to all legitimate requests within 30 days.`
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <header style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🔒
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#888', fontSize: '16px' }}>
            Pulse by DarkWave Studios, LLC
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Last Updated: March 2026
          </p>
        </header>

        <div style={{
          background: 'rgba(0, 212, 255, 0.08)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <p style={{ color: '#7dd3fc', fontSize: '14px', lineHeight: 1.6 }}>
            <strong>Your privacy matters.</strong> This policy explains exactly what data we collect,
            why we collect it, how we protect it, and what rights you have. We do not sell your personal
            information. We do not use advertising trackers. Your trading data and wallet keys are encrypted
            and secured.
          </p>
        </div>

        <nav style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <h3 style={{ color: '#888', fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase' }}>
            Table of Contents
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '8px'
          }}>
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  setActiveSection(section.id);
                }}
                style={{
                  color: activeSection === section.id ? '#00D4FF' : '#aaa',
                  textDecoration: 'none',
                  fontSize: '13px',
                  padding: '6px 0',
                  transition: 'color 0.2s'
                }}
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sections.map(section => (
            <section
              key={section.id}
              id={section.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#00D4FF',
                marginBottom: '16px'
              }}>
                {section.title}
              </h2>
              <div style={{
                color: '#ccc',
                fontSize: '14px',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap'
              }}>
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer style={{
          marginTop: '48px',
          padding: '24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '13px' }}>
            © 2024-2026 DarkWave Studios, LLC. All rights reserved.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <a
              href="/terms"
              style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}
            >
              Terms of Service
            </a>
            <a
              href="/"
              style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}
            >
              Back to Pulse
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
