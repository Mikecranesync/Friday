
import express from 'express';
import { oauthService } from '../services/OAuthService';

export const authRouter = express.Router();

// Scopes for Google APIs
const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
];

/**
 * GET /api/auth/google
 * Initiates the OAuth flow
 */
authRouter.get('/google', (req, res) => {
    const authUrl = oauthService.getAuthUrl(SCOPES);
    res.json({ authUrl });
});

/**
 * GET /api/auth/callback
 * OAuth callback endpoint
 */
authRouter.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const tokens = await oauthService.getTokens(code as string);

        // In production, store tokens securely (database, encrypted storage)
        // For now, return them to the client
        res.json({
            success: true,
            tokens: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date,
            }
        });
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        res.status(500).json({
            error: 'Failed to exchange authorization code',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh an expired access token
 */
authRouter.post('/refresh', async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
        oauthService.setCredentials({ refresh_token });
        const tokens = await oauthService.refreshAccessToken();

        res.json({
            success: true,
            tokens: {
                access_token: tokens.access_token,
                expiry_date: tokens.expiry_date,
            }
        });
    } catch (error: any) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            error: 'Failed to refresh token',
            message: error.message
        });
    }
});

/**
 * GET /api/auth/status
 * Check authentication status
 */
authRouter.get('/status', (req, res) => {
    // TODO: Check if user has valid tokens stored
    res.json({ authenticated: false });
});
