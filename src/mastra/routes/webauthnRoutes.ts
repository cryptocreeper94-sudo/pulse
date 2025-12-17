import { db } from '../../db/client.js';
import { webauthnCredentials, webauthnChallenges, sessions } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';

type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;

const RP_NAME = 'Pulse by DarkWave';
const RP_ID_FALLBACK = 'localhost';

function getRelyingPartyId(host: string): string {
  if (!host) return RP_ID_FALLBACK;
  const hostname = host.split(':')[0];
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost';
  return hostname;
}

function getOrigin(c: any): string {
  const protocol = c.req.header('x-forwarded-proto') || 'https';
  const host = c.req.header('host') || 'localhost';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return `http://${host}`;
  }
  return `${protocol}://${host}`;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const webauthnRoutes = [
  {
    path: "/api/webauthn/check-support",
    method: "GET",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      return c.json({
        supported: true,
        info: {
          rpName: RP_NAME,
          authenticatorTypes: ['platform', 'cross-platform'],
          features: ['2fa', 'wallet-confirmation']
        }
      });
    }
  },

  {
    path: "/api/webauthn/registration/start",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { sessionToken, deviceName, usedFor = '2fa' } = await c.req.json();
        
        if (!sessionToken) {
          return c.json({ error: 'Session token required' }, 400);
        }

        const session = await db.select().from(sessions).where(eq(sessions.token, sessionToken)).limit(1);
        if (!session.length) {
          return c.json({ error: 'Invalid session' }, 401);
        }

        const host = c.req.header('host') || '';
        const rpId = getRelyingPartyId(host);

        const existingCredentials = await db.select()
          .from(webauthnCredentials)
          .where(and(
            eq(webauthnCredentials.sessionToken, sessionToken),
            eq(webauthnCredentials.usedFor, usedFor)
          ));

        const excludeCredentials = existingCredentials.map((cred: WebAuthnCredential) => ({
          id: cred.credentialId,
          transports: JSON.parse(cred.transports || '["internal"]') as AuthenticatorTransportFuture[],
        }));

        const userId = session[0].userId || session[0].email || sessionToken;
        const userIdBuffer = new TextEncoder().encode(userId);

        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: rpId,
          userName: session[0].email || 'User',
          userDisplayName: session[0].email || 'Pulse User',
          userID: userIdBuffer,
          attestationType: 'none',
          excludeCredentials,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        });

        const challengeId = generateId();
        await db.insert(webauthnChallenges).values({
          id: challengeId,
          sessionToken,
          challenge: options.challenge,
          type: 'registration',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        logger?.info('✅ [WebAuthn] Registration challenge created', { sessionToken: sessionToken.slice(0, 8), rpId });

        return c.json({
          success: true,
          challengeId,
          options,
          deviceName: deviceName || 'This Device',
          usedFor
        });
      } catch (error: any) {
        logger?.error('❌ [WebAuthn] Registration start error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/webauthn/registration/complete",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { sessionToken, challengeId, credential, deviceName, usedFor = '2fa' } = await c.req.json();
        
        if (!sessionToken || !challengeId || !credential) {
          return c.json({ error: 'Missing required fields' }, 400);
        }

        const challengeRecord = await db.select()
          .from(webauthnChallenges)
          .where(and(
            eq(webauthnChallenges.id, challengeId),
            eq(webauthnChallenges.sessionToken, sessionToken),
            eq(webauthnChallenges.type, 'registration')
          ))
          .limit(1);

        if (!challengeRecord.length) {
          return c.json({ error: 'Invalid or expired challenge' }, 400);
        }

        if (new Date(challengeRecord[0].expiresAt) < new Date()) {
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: 'Challenge expired' }, 400);
        }

        const host = c.req.header('host') || '';
        const rpId = getRelyingPartyId(host);
        const origin = getOrigin(c);
        const expectedChallenge = challengeRecord[0].challenge;

        let verification;
        try {
          verification = await verifyRegistrationResponse({
            response: credential as RegistrationResponseJSON,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
            requireUserVerification: true,
          });
        } catch (verifyError: any) {
          logger?.error('❌ [WebAuthn] Registration verification failed', { error: verifyError.message });
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: `Verification failed: ${verifyError.message}` }, 400);
        }

        if (!verification.verified || !verification.registrationInfo) {
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: 'Registration verification failed' }, 400);
        }

        const { credential: verifiedCredential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

        const credentialIdBase64 = Buffer.from(verifiedCredential.id).toString('base64url');
        const publicKeyBase64 = Buffer.from(verifiedCredential.publicKey).toString('base64url');

        const dbCredentialId = generateId();
        await db.insert(webauthnCredentials).values({
          id: dbCredentialId,
          sessionToken,
          credentialId: credentialIdBase64,
          publicKey: publicKeyBase64,
          counter: verifiedCredential.counter,
          deviceName: deviceName || 'Biometric Device',
          transports: JSON.stringify(credential.response?.transports || ['internal']),
          usedFor,
          createdAt: new Date(),
        });

        await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));

        logger?.info('✅ [WebAuthn] Credential registered with cryptographic verification', { 
          sessionToken: sessionToken.slice(0, 8), 
          usedFor,
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp
        });

        return c.json({
          success: true,
          credentialId: dbCredentialId,
          message: `Biometric ${usedFor === '2fa' ? 'login' : 'wallet'} authentication enabled`
        });
      } catch (error: any) {
        logger?.error('❌ [WebAuthn] Registration complete error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/webauthn/authentication/start",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { sessionToken, usedFor = '2fa' } = await c.req.json();
        
        if (!sessionToken) {
          return c.json({ error: 'Session token required' }, 400);
        }

        const credentials = await db.select()
          .from(webauthnCredentials)
          .where(and(
            eq(webauthnCredentials.sessionToken, sessionToken),
            eq(webauthnCredentials.usedFor, usedFor)
          ));

        if (!credentials.length) {
          return c.json({ error: 'No biometric credentials found', noCredentials: true }, 400);
        }

        const host = c.req.header('host') || '';
        const rpId = getRelyingPartyId(host);

        const allowCredentials = credentials.map((cred: WebAuthnCredential) => ({
          id: cred.credentialId,
          transports: JSON.parse(cred.transports || '["internal"]') as AuthenticatorTransportFuture[],
        }));

        const options = await generateAuthenticationOptions({
          rpID: rpId,
          allowCredentials,
          userVerification: 'required',
          timeout: 60000,
        });

        const challengeId = generateId();
        await db.insert(webauthnChallenges).values({
          id: challengeId,
          sessionToken,
          challenge: options.challenge,
          type: 'authentication',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        logger?.info('✅ [WebAuthn] Authentication challenge created', { sessionToken: sessionToken.slice(0, 8), usedFor });

        return c.json({
          success: true,
          challengeId,
          options
        });
      } catch (error: any) {
        logger?.error('❌ [WebAuthn] Authentication start error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/webauthn/authentication/verify",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { sessionToken, challengeId, credential, usedFor = '2fa' } = await c.req.json();
        
        if (!sessionToken || !challengeId || !credential) {
          return c.json({ error: 'Missing required fields' }, 400);
        }

        const challengeRecord = await db.select()
          .from(webauthnChallenges)
          .where(and(
            eq(webauthnChallenges.id, challengeId),
            eq(webauthnChallenges.sessionToken, sessionToken),
            eq(webauthnChallenges.type, 'authentication')
          ))
          .limit(1);

        if (!challengeRecord.length) {
          return c.json({ error: 'Invalid or expired challenge' }, 400);
        }

        if (new Date(challengeRecord[0].expiresAt) < new Date()) {
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: 'Challenge expired' }, 400);
        }

        const storedCredential = await db.select()
          .from(webauthnCredentials)
          .where(and(
            eq(webauthnCredentials.sessionToken, sessionToken),
            eq(webauthnCredentials.credentialId, credential.id),
            eq(webauthnCredentials.usedFor, usedFor)
          ))
          .limit(1);

        if (!storedCredential.length) {
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: 'Credential not found' }, 400);
        }

        const host = c.req.header('host') || '';
        const rpId = getRelyingPartyId(host);
        const origin = getOrigin(c);
        const expectedChallenge = challengeRecord[0].challenge;

        const publicKeyBytes = new Uint8Array(Buffer.from(storedCredential[0].publicKey, 'base64url'));

        let verification;
        try {
          verification = await verifyAuthenticationResponse({
            response: credential as AuthenticationResponseJSON,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
            credential: {
              id: storedCredential[0].credentialId,
              publicKey: publicKeyBytes,
              counter: storedCredential[0].counter,
              transports: JSON.parse(storedCredential[0].transports || '["internal"]') as AuthenticatorTransportFuture[],
            },
            requireUserVerification: true,
          });
        } catch (verifyError: any) {
          logger?.error('❌ [WebAuthn] Authentication verification failed', { error: verifyError.message });
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: `Authentication failed: ${verifyError.message}` }, 400);
        }

        if (!verification.verified) {
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: 'Signature verification failed' }, 400);
        }

        const newCounter = verification.authenticationInfo.newCounter;
        if (newCounter <= storedCredential[0].counter) {
          logger?.error('❌ [WebAuthn] Possible cloned authenticator detected', {
            sessionToken: sessionToken.slice(0, 8),
            storedCounter: storedCredential[0].counter,
            receivedCounter: newCounter
          });
          await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));
          return c.json({ error: 'Security error: possible cloned authenticator' }, 400);
        }

        await db.update(webauthnCredentials)
          .set({
            counter: newCounter,
            lastUsedAt: new Date(),
          })
          .where(eq(webauthnCredentials.id, storedCredential[0].id));

        await db.delete(webauthnChallenges).where(eq(webauthnChallenges.id, challengeId));

        logger?.info('✅ [WebAuthn] Authentication verified with cryptographic signature', { 
          sessionToken: sessionToken.slice(0, 8), 
          usedFor,
          device: storedCredential[0].deviceName,
          newCounter
        });

        return c.json({
          success: true,
          verified: true,
          deviceName: storedCredential[0].deviceName,
          usedFor
        });
      } catch (error: any) {
        logger?.error('❌ [WebAuthn] Authentication verify error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/webauthn/credentials",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const { sessionToken } = await c.req.json();
        
        if (!sessionToken) {
          return c.json({ error: 'Session token required' }, 400);
        }

        const credentials = await db.select({
          id: webauthnCredentials.id,
          deviceName: webauthnCredentials.deviceName,
          usedFor: webauthnCredentials.usedFor,
          lastUsedAt: webauthnCredentials.lastUsedAt,
          createdAt: webauthnCredentials.createdAt,
        })
        .from(webauthnCredentials)
        .where(eq(webauthnCredentials.sessionToken, sessionToken));

        const has2fa = credentials.some((c: { usedFor: string }) => c.usedFor === '2fa');
        const hasWallet = credentials.some((c: { usedFor: string }) => c.usedFor === 'wallet');

        return c.json({
          success: true,
          credentials,
          settings: {
            biometric2faEnabled: has2fa,
            biometricWalletEnabled: hasWallet,
          }
        });
      } catch (error: any) {
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/webauthn/credentials/delete",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { sessionToken, credentialId } = await c.req.json();
        
        if (!sessionToken || !credentialId) {
          return c.json({ error: 'Session token and credential ID required' }, 400);
        }

        const result = await db.delete(webauthnCredentials)
          .where(and(
            eq(webauthnCredentials.sessionToken, sessionToken),
            eq(webauthnCredentials.id, credentialId)
          ));

        logger?.info('✅ [WebAuthn] Credential deleted', { sessionToken: sessionToken.slice(0, 8), credentialId });

        return c.json({
          success: true,
          message: 'Biometric credential removed'
        });
      } catch (error: any) {
        logger?.error('❌ [WebAuthn] Delete credential error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/webauthn/has-credentials",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      try {
        const { sessionToken, usedFor } = await c.req.json();
        
        if (!sessionToken) {
          return c.json({ error: 'Session token required' }, 400);
        }

        let query = db.select({ count: webauthnCredentials.id })
          .from(webauthnCredentials)
          .where(eq(webauthnCredentials.sessionToken, sessionToken));

        if (usedFor) {
          query = db.select({ count: webauthnCredentials.id })
            .from(webauthnCredentials)
            .where(and(
              eq(webauthnCredentials.sessionToken, sessionToken),
              eq(webauthnCredentials.usedFor, usedFor)
            ));
        }

        const result = await query;
        
        return c.json({
          hasCredentials: result.length > 0,
          count: result.length
        });
      } catch (error: any) {
        return c.json({ error: error.message }, 500);
      }
    }
  }
];
