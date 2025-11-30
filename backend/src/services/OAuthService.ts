
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Load OAuth credentials
const CREDENTIALS_PATH = path.join(__dirname, '../../client_secret_629976964482-1d117sk11mc6i6fmbel61faujsbrs40b.apps.googleusercontent.com.json');
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

const { client_id, client_secret, redirect_uris } = credentials.web;

export class OAuthService {
    private oauth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0] // Use the first redirect URI
        );
    }

    /**
     * Generate the OAuth URL for user authentication
     * FIXED: Forces account selection so user can choose which Google account to use
     */
    getAuthUrl(scopes: string[]) {
        const authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'select_account consent', // Forces account chooser + consent screen
            include_granted_scopes: true,
        });
        return authUrl;
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokens(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return tokens;
    }

    /**
     * Set credentials from stored tokens
     */
    setCredentials(tokens: any) {
        this.oauth2Client.setCredentials(tokens);
    }

    /**
     * Get the OAuth2 client for Google API calls
     */
    getClient() {
        return this.oauth2Client;
    }

    /**
     * Refresh access token if expired
     */
    async refreshAccessToken() {
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(credentials);
        return credentials;
    }
}

export const oauthService = new OAuthService();
