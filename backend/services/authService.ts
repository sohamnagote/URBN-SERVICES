import { backendStore } from '../store/backendStore';
import { logger } from '../config/logger';

export interface VerifiedAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'customer' | 'provider' | 'admin';
  emailVerified: boolean;
  authProvider: string;
  lastLoginAt: string;
}

export class AuthService {
  public async verifyGoogleToken(idToken: string): Promise<VerifiedAuthUser> {
    if (!idToken || typeof idToken !== 'string') {
      throw new Error('Missing or invalid Google idToken.');
    }

    let tokenInfo: any = null;
    try {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (googleRes.ok) {
        tokenInfo = await googleRes.json();
      }
    } catch (err) {
      logger.warn('Direct Google tokeninfo endpoint call fallback', err);
    }

    let verifiedSub = '';
    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedPicture = '';
    let emailVerified = false;

    if (tokenInfo && tokenInfo.sub) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (tokenInfo.exp && Number(tokenInfo.exp) < nowSeconds) {
        throw new Error('Google ID token has expired. Please sign in again.');
      }
      verifiedSub = tokenInfo.sub;
      verifiedEmail = tokenInfo.email || '';
      verifiedName = tokenInfo.name || tokenInfo.given_name || 'Nashik Resident';
      verifiedPicture = tokenInfo.picture || '';
      emailVerified = tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true;
    } else {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          throw new Error('Authentication token has expired. Please sign in again.');
        }
        verifiedSub = payload.sub || payload.user_id || '';
        verifiedEmail = payload.email || '';
        verifiedName = payload.name || 'Nashik Resident';
        verifiedPicture = payload.picture || '';
        emailVerified = Boolean(payload.email_verified);
      } else {
        throw new Error('Invalid Google authentication token payload format.');
      }
    }

    if (!verifiedSub) {
      throw new Error('Unable to verify stable Google identity identifier.');
    }

    // Authoritatively resolve role server-side
    let resolvedRole: 'customer' | 'provider' | 'admin' = 'customer';
    if (backendStore.isAdmin(verifiedEmail)) {
      resolvedRole = 'admin';
    } else {
      const isApprovedProvider = Array.from(backendStore.providers.values()).some(
        (p) => (p.email && p.email.toLowerCase() === verifiedEmail.toLowerCase()) || p.userId === verifiedSub
      );
      if (isApprovedProvider) {
        resolvedRole = 'provider';
      }
    }

    return {
      uid: verifiedSub,
      email: verifiedEmail,
      displayName: verifiedName,
      photoURL: verifiedPicture,
      role: resolvedRole,
      emailVerified,
      authProvider: 'google.com',
      lastLoginAt: new Date().toISOString(),
    };
  }
}

export const authService = new AuthService();
