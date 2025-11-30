
import { Agent, AgentContext, AgentResponse } from "./types";

export class CommunicationAgent implements Agent {
    name = "Communication";
    description = "Handles emails and messages.";

    async process(input: string, context: AgentContext): Promise<AgentResponse> {
        console.log(`[Communication] Processing: ${input}`);

        if (input.toLowerCase().includes("email") && input.toLowerCase().includes("send")) {
            return {
                text: "I've drafted that email for you. Would you like to review it?",
                action: {
                    type: 'SHOW_UI',
                    payload: { view: 'email-draft' }
                }
            };
        }

        if (input.toLowerCase().includes("read") && input.toLowerCase().includes("email")) {
            return {
                text: "You have 3 unread emails. The most important one is from your boss regarding the project deadline.",
            };
        }

        return {
            text: "I can help you manage your emails and messages.",
        };
    }
}
