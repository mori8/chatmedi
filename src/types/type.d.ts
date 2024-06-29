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


interface SelectedModel {
  model: string;
  reason: string;
}

interface OutputFromModel {
  text: string;
}

interface FinalResponse {
  text: string;
}

interface ChatMediResponse {
  planned_task?: Task[];
  selected_model?: SelectedModel;
  output_from_model?: OutputFromModel;
  final_response?: FinalResponse;
}

interface Chat {
  chatId: string;
  prompt: string;
}

interface ChatHistory {
  [date: string]: Chat[];
}
