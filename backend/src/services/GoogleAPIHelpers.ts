
import { google } from 'googleapis';
import { oauthService } from '../services/OAuthService';

/**
 * Google Calendar Helper
 */
export class CalendarHelper {
    /**
     * List upcoming calendar events
     */
    static async listEvents(accessToken: string, maxResults: number = 10) {
        const oauth2Client = oauthService.getClient();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items || [];
    }

    /**
     * Create a calendar event
     */
    static async createEvent(accessToken: string, event: any) {
        const oauth2Client = oauthService.getClient();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        return response.data;
    }
}

/**
 * Gmail Helper
 */
export class GmailHelper {
    /**
     * List recent emails
     */
    static async listMessages(accessToken: string, maxResults: number = 10) {
        const oauth2Client = oauthService.getClient();
        oauth2Client.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults,
        });

        return response.data.messages || [];
    }

    /**
     * Get email details
     */
    static async getMessage(accessToken: string, messageId: string) {
        const oauth2Client = oauthService.getClient();
        oauth2Client.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
        });

        return response.data;
    }

    /**
     * Send an email
     */
    static async sendMessage(accessToken: string, to: string, subject: string, body: string) {
        const oauth2Client = oauthService.getClient();
        oauth2Client.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const message = [
            `To: ${to}`,
            `Subject: ${subject}`,
            '',
            body,
        ].join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        return response.data;
    }
}
