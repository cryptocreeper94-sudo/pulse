import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null;
  }
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getClient();
  if (!client || !TWILIO_PHONE_NUMBER) {
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`[SMS] Sent to ${to.substring(0, 6)}***: SID ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error(`[SMS] Failed to send to ${to.substring(0, 6)}***:`, error.message);
    return { success: false, error: error.message };
  }
}

export function formatTradeNotification(type: 'executed' | 'failed' | 'approval_needed' | 'kill_switch', data: {
  symbol?: string;
  tradeType?: string;
  amount?: string;
  txSignature?: string;
  error?: string;
  reason?: string;
  consecutiveLosses?: number;
}): string {
  switch (type) {
    case 'executed':
      return `PULSE: ${data.tradeType} ${data.symbol} - $${data.amount} executed. TX: ${data.txSignature?.substring(0, 12)}...`;
    case 'failed':
      return `PULSE: ${data.tradeType} ${data.symbol} failed. ${data.error || 'Unknown error'}`;
    case 'approval_needed':
      return `PULSE: Trade needs approval - ${data.tradeType} ${data.symbol} $${data.amount}. Open Pulse to approve or reject.`;
    case 'kill_switch':
      return `PULSE: Auto-trading paused. ${data.consecutiveLosses} consecutive losses. ${data.reason || 'Safety limit reached.'}`;
    default:
      return `PULSE: Trade update for ${data.symbol}`;
  }
}

export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}
