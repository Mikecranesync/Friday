
import { Agent, AgentContext, AgentResponse } from "./types";

export class PersonalAssistantAgent implements Agent {
    name = "PersonalAssistant";
    description = "Manages tasks, calendar, and notes.";

    async process(input: string, context: AgentContext): Promise<AgentResponse> {
        console.log(`[PersonalAssistant] Processing: ${input}`);

        // Mock logic for now
        if (input.toLowerCase().includes("calendar") || input.toLowerCase().includes("schedule")) {
            return {
                text: "I checked your calendar. You have a meeting with the team at 2 PM today.",
                action: {
                    type: 'SHOW_UI',
                    payload: { view: 'calendar' }
                }
            };
        }

        if (input.toLowerCase().includes("task") || input.toLowerCase().includes("remind")) {
            return {
                text: "I've added that to your task list.",
                data: { task: input }
            };
        }

        return {
            text: "I can help you with your calendar and tasks. What do you need?",
        };
    }
}
