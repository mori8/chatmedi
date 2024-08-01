interface UserMessage {
  messageId: string;
  sender: string;
  prompt: {
    text: string;
    files?: string[];
  };
}

interface AIMessage {
  messageId: string;
  sender: string;
  response: ChatMediResponse;
}

type Message = UserMessage | AIMessage;

interface Task {
  task: string;
  id: number;
  dep: number[];
  args: { [key: string]: string };
}

interface ConversationHistory {
  messages: Message[];
}

interface ModelSelectionRequest {
  user_input: string;
}

interface SelectedModel {
  id: string;
  reason: string;
  task: string;
  model_args: any;
}

interface ExecutionResult {
  inference_result: {
    [key: string]: string;
  }
}

interface FinalResponse {
  text: string;
}

interface ChatMediResponse {
  isRegenerated?: boolean;
  prompt?: string;
  selected_model?: SelectedModel;
  execution_result?: ExecutionResult;
  final_response?: FinalResponse;
}

interface Chat {
  chatId: string;
  prompt: string;
  timestamp: string;
}

interface ChatHistory {
  [date: string]: Chat[];
}
