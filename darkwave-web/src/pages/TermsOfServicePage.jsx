import { useState } from 'react';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState(null);
  
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing or using Pulse ("the Platform"), a product of DarkWave Studios, LLC ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.

These Terms apply to all users of the Platform, including users who purchase, sell, or exchange cryptocurrency or digital assets through our integrated services.`
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      content: `To use Pulse and its cryptocurrency services, you must:
• Be at least 18 years of age or the age of legal majority in your jurisdiction
• Have the legal capacity to enter into a binding agreement
• Not be a resident of a jurisdiction where cryptocurrency trading is prohibited
• Not be on any sanctions lists or prohibited persons lists
• Complete identity verification as required by applicable law

You represent and warrant that all information you provide during registration and identity verification is accurate, current, and complete.`
    },
    {
      id: 'crypto-services',
      title: '3. Cryptocurrency Services',
      content: `Pulse provides cryptocurrency-related services including but not limited to:
• AI-powered trading signals and predictions
• Market data and analysis tools
• Cryptocurrency purchase and sale facilitation through third-party providers (including Stripe)
• Portfolio tracking and management tools

IMPORTANT DISCLAIMERS:
• Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors
• Past performance of our AI predictions does not guarantee future results
• You should only invest funds you can afford to lose
• We do not provide financial, investment, tax, or legal advice
• All trading decisions are made at your own risk`
    },
    {
      id: 'stripe-onramp',
      title: '4. Stripe Crypto Onramp Services',
      content: `When you use cryptocurrency purchase services through our Platform, you are using services provided by Stripe, Inc. ("Stripe") and its licensed partners. By using these services:

• You agree to Stripe's terms of service and privacy policy
• You authorize Stripe and its partners to process your transactions
• You understand that Stripe may conduct identity verification and compliance checks
• You acknowledge that transaction limits and availability may vary by jurisdiction
• You agree to provide accurate payment and identity information

Stripe's crypto onramp services are subject to their own terms, fees, and regulatory requirements. We are not responsible for Stripe's services, and any disputes regarding cryptocurrency purchases should be directed to Stripe.`
    },
    {
      id: 'kyc-aml',
      title: '5. Know Your Customer (KYC) and Anti-Money Laundering (AML)',
      content: `To comply with applicable laws and regulations, we and our service providers may require:

• Government-issued identification documents
• Proof of address documentation
• Source of funds verification
• Ongoing monitoring of transactions
• Reporting of suspicious activities to relevant authorities

We reserve the right to:
• Refuse, suspend, or terminate services if verification cannot be completed
• Limit transaction amounts based on verification level
• Report suspicious activities to law enforcement
• Freeze or close accounts that violate these Terms or applicable law`
    },
    {
      id: 'prohibited',
      title: '6. Prohibited Activities',
      content: `You agree not to use the Platform for:
• Money laundering, terrorist financing, or other illegal activities
• Circumventing any laws, regulations, or these Terms
• Fraudulent or deceptive activities
• Market manipulation or wash trading
• Using automated bots or scripts in violation of our policies
• Accessing the Platform from prohibited jurisdictions
• Creating multiple accounts to evade restrictions
• Violating the intellectual property rights of others
• Transmitting malware, viruses, or harmful code
• Harassing, threatening, or impersonating others`
    },
    {
      id: 'risks',
      title: '7. Risk Disclosures',
      content: `CRYPTOCURRENCY TRADING INVOLVES SIGNIFICANT RISKS:

Market Risk: Cryptocurrency prices are highly volatile and can fluctuate significantly in short periods. You may lose all or a substantial portion of your investment.

Regulatory Risk: Cryptocurrency regulations vary by jurisdiction and are subject to change. Regulatory actions may adversely affect the value or legality of cryptocurrency transactions.

Technology Risk: Blockchain networks may experience outages, forks, or security vulnerabilities. Smart contract failures or bugs may result in loss of funds.

Liquidity Risk: Some cryptocurrencies may have limited liquidity, making it difficult to buy or sell at desired prices.

Counterparty Risk: Third-party service providers, exchanges, or custodians may fail, be hacked, or become insolvent.

Tax Risk: Cryptocurrency transactions may have tax implications. You are responsible for understanding and complying with your tax obligations.

YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THESE RISKS AND ACCEPT THEM.`
    },
    {
      id: 'fees',
      title: '8. Fees and Payments',
      content: `• Subscription fees for Pulse services are as displayed on our pricing page
• Cryptocurrency transaction fees are determined by Stripe and network conditions
• Network fees (gas fees) are paid to blockchain validators, not to us
• We reserve the right to modify our fees with reasonable notice
• All fees are non-refundable unless otherwise stated
• You are responsible for any taxes applicable to your transactions`
    },
    {
      id: 'intellectual-property',
      title: '9. Intellectual Property',
      content: `All content, features, and functionality of the Platform, including but not limited to:
• AI models and prediction algorithms
• Software, code, and user interfaces
• Trademarks, logos, and branding
• Documentation and educational content

Are owned by DarkWave Studios, LLC and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.`
    },
    {
      id: 'privacy',
      title: '10. Privacy and Data',
      content: `Your use of the Platform is subject to our Privacy Policy. By using the Platform, you consent to:
• Collection and processing of personal data as described in our Privacy Policy
• Sharing of data with third-party service providers as necessary
• Use of cookies and similar technologies
• Cross-border data transfers as required for service provision

We implement industry-standard security measures to protect your data, but no system is completely secure. You are responsible for maintaining the security of your account credentials.`
    },
    {
      id: 'disclaimers',
      title: '11. Disclaimers',
      content: `THE PLATFORM AND ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.

WE DISCLAIM ALL WARRANTIES INCLUDING BUT NOT LIMITED TO:
• MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
• ACCURACY OR RELIABILITY OF AI PREDICTIONS OR SIGNALS
• UNINTERRUPTED OR ERROR-FREE OPERATION
• SECURITY FROM HACKING OR UNAUTHORIZED ACCESS
• COMPATIBILITY WITH YOUR DEVICES OR SOFTWARE

WE DO NOT GUARANTEE ANY SPECIFIC INVESTMENT OUTCOMES OR RETURNS.`
    },
    {
      id: 'limitation',
      title: '12. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

• OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS
• WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
• WE ARE NOT LIABLE FOR LOST PROFITS, DATA, OR CRYPTOCURRENCY
• WE ARE NOT LIABLE FOR ACTIONS OF THIRD-PARTY SERVICE PROVIDERS
• WE ARE NOT LIABLE FOR BLOCKCHAIN NETWORK FAILURES OR DELAYS

Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.`
    },
    {
      id: 'indemnification',
      title: '13. Indemnification',
      content: `You agree to indemnify, defend, and hold harmless DarkWave Studios, LLC, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses (including attorney's fees) arising from:
• Your use of the Platform
• Your violation of these Terms
• Your violation of any law or regulation
• Your violation of third-party rights
• Your cryptocurrency trading activities`
    },
    {
      id: 'termination',
      title: '14. Termination',
      content: `We may suspend or terminate your access to the Platform:
• For violation of these Terms
• For suspected fraudulent or illegal activity
• For failure to complete required verification
• At our sole discretion with or without cause

Upon termination:
• Your license to use the Platform ends immediately
• You remain responsible for any pending transactions
• Provisions that by their nature should survive will survive termination`
    },
    {
      id: 'governing-law',
      title: '15. Governing Law and Dispute Resolution',
      content: `These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.

Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in Delaware.

You waive any right to participate in class action lawsuits or class-wide arbitration.

For claims under $10,000, you may choose small claims court in your jurisdiction as an alternative to arbitration.`
    },
    {
      id: 'changes',
      title: '16. Changes to Terms',
      content: `We may update these Terms from time to time. When we make material changes:
• We will notify you via email or Platform notification
• The updated Terms will be posted with a new effective date
• Continued use of the Platform after changes constitutes acceptance

We encourage you to review these Terms periodically.`
    },
    {
      id: 'contact',
      title: '17. Contact Information',
      content: `DarkWave Studios, LLC
Email: legal@darkwavestudios.io
Website: https://pulse.darkwavestudios.io

For support inquiries: support@darkwavestudios.io
For legal inquiries: legal@darkwavestudios.io`
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
            ⚖️
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Terms of Service
          </h1>
          <p style={{ color: '#888', fontSize: '16px' }}>
            Pulse by DarkWave Studios, LLC
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Last Updated: January 2026
          </p>
        </header>

        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <p style={{ color: '#c4b5fd', fontSize: '14px', lineHeight: 1.6 }}>
            <strong>Important:</strong> These Terms of Service govern your use of Pulse and its cryptocurrency services. 
            By using our Platform, you agree to be bound by these terms. Please read them carefully, 
            especially the sections regarding cryptocurrency risks and limitations of liability.
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
              href="/privacy" 
              style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}
            >
              Privacy Policy
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
