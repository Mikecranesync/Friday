
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { Agent, AgentContext, AgentResponse } from "./types";
import { PersonalAssistantAgent } from "./PersonalAssistantAgent";
import { CommunicationAgent } from "./CommunicationAgent";
import { KnowledgeAgent } from "./KnowledgeAgent";
import dotenv from "dotenv";

dotenv.config();

export class OrchestratorAgent implements Agent {
    name = "Orchestrator";
    description = "Main entry point and router for the Friday system.";

    private model!: ChatGoogleGenerativeAI;
    private subAgents!: { [key: string]: Agent };

    constructor() {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyBOEFzA3fWyS_s92h4Sd7ZaWIctiVXZjlA';
        if (!apiKey) {
            console.warn("Gemini API Key not found in environment variables");
        }

        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-pro",
            apiKey: apiKey,
            temperature: 0.7,
        });

        this.subAgents = {
            "PersonalAssistant": new PersonalAssistantAgent(),
            "Communication": new CommunicationAgent(),
            "Knowledge": new KnowledgeAgent(),
        };
    }

    async process(input: string, context: AgentContext): Promise<AgentResponse> {
        console.log(`[Orchestrator] Processing: ${input}`);

        // Simple routing logic for now (can be enhanced with LLM function calling later)
        // We ask the LLM to decide which agent to use.

        const routingPrompt = `
    You are the Orchestrator for the Friday AI system.
    Your goal is to route the user's request to the appropriate sub-agent.
    
    Available Agents:
    1. PersonalAssistant: Manages calendar, tasks, reminders, and notes.
    2. Communication: Handles emails, messages, and drafting.
    3. Knowledge: Answers general questions, web search, and information retrieval.
    4. General: Handles greetings, small talk, and clarifications.

    User Input: "${input}"

    Reply with ONLY the name of the agent to use (PersonalAssistant, Communication, Knowledge, or General).
    `;

        try {
            const routingResult = await this.model.invoke([new HumanMessage(routingPrompt)]);
            const selectedAgentName = routingResult.content.toString().trim();
            console.log(`[Orchestrator] Selected Agent: ${selectedAgentName}`);

            if (this.subAgents[selectedAgentName]) {
                return await this.subAgents[selectedAgentName].process(input, context);
            }

            // Default to General Chat (handled by Orchestrator itself)
            const messages = [
                new SystemMessage(`You are Friday, a helpful and intelligent personal AI assistant. 
        Your goal is to assist the user with their tasks, answer questions, and be a friendly companion.
        Keep your responses concise and conversational, suitable for voice output.
        Current User Context: ${JSON.stringify(context)}`),
                ...context.history.map((msg: any) =>
                    msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
                ),
                new HumanMessage(input),
            ];

            const result = await this.model.invoke(messages);
            return {
                text: result.content.toString(),
            };

        } catch (error) {
            console.error("Orchestrator Error:", error);
            return {
                text: "I'm sorry, I encountered an error while processing your request.",
            };
        }
    }
}
