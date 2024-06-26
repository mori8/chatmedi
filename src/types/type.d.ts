interface Message {
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