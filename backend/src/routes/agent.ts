
import express from 'express';
import { OrchestratorAgent } from '../agents/OrchestratorAgent';

export const agentRouter = express.Router();
const orchestrator = new OrchestratorAgent();

agentRouter.post('/chat', async (req, res) => {
    try {
        const { message, history, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const context = {
            userId: userId || 'default-user',
            sessionId: 'default-session',
            history: history || [],
        };

        const response = await orchestrator.process(message, context);
        res.json(response);
    } catch (error: any) {
        console.error('Agent Error:', error);
        res.status(500).json({ error: error.message || 'Internal Agent Error' });
    }
});
