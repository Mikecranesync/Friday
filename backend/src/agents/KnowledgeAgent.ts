
import { Agent, AgentContext, AgentResponse } from "./types";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

export class KnowledgeAgent implements Agent {
    name = "Knowledge";
    description = "Answers general questions and retrieves information.";

    private model: ChatGoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyBOEFzA3fWyS_s92h4Sd7ZaWIctiVXZjlA';
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: apiKey,
        });
    }

    async process(input: string, context: AgentContext): Promise<AgentResponse> {
        console.log(`[Knowledge] Processing: ${input}`);

        try {
            const result = await this.model.invoke([
                new HumanMessage(`Answer the following question concisely: ${input}`)
            ]);

            return {
                text: result.content.toString(),
            };
        } catch (error) {
            return {
                text: "I'm sorry, I couldn't find the answer to that.",
            };
        }
    }
}
