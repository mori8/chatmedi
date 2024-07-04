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
  task: Task,
  model: SelectedModel,
  model_input: {
    text?: string;
    image?: string;
  },
  inference_result: {
    text?: string;
    image?: string;
  }
}

interface TaskSummaries {
  task: Task;
  model: SelectedModel;
  inference_result: {
    text?: string;
    image?: string;
  }
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
