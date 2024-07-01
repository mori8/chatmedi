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
  tasks: TaskModel[];
}

interface SelectedModel {
  id: string;
  reason: string;
}

interface ModelSelectionResponse {
  selected_models: { [key: number]: SelectedModel };
}

interface OutputFromModel {
  model_name: string;
  input: string;
  text: string;
  file?: string;
}

interface FinalResponse {
  text: string;
}

interface ChatMediResponse {
  planned_task?: Task[];
  selected_model?: { [key: number]: SelectedModel };
  output_from_model?: OutputFromModel[];
  final_response?: FinalResponse;
}

interface Chat {
  chatId: string;
  prompt: string;
}

interface ChatHistory {
  [date: string]: Chat[];
}
