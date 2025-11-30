
export interface AgentResponse {
  text: string;
  action?: {
    type: 'NAVIGATE' | 'EXECUTE_COMMAND' | 'SHOW_UI';
    payload: any;
  };
  data?: any;
}

export interface AgentContext {
  userId: string;
  sessionId: string;
  history: any[];
}

export interface Agent {
  name: string;
  description: string;
  process(input: string, context: AgentContext): Promise<AgentResponse>;
}
