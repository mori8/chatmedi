interface Message {
  messageId: string;
  sender: string;
  text: string;
}

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