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

interface TaskContext {
  file?: string | null;
  text?: string;
}

interface TaskResponse {
  task: string;
  context: TaskContext;
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

interface inferenceResult {
    [key: string]: string;
}

interface FinalResponse {
  text: string;
}

interface ChatMediResponse {
  isRegenerated?: boolean;
  prompt?: string;
  planned_task?: TaskResponse;
  selected_model?: SelectedModel;
  inference_result?: ExecutionResult;
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
