interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatInfo {
  message_id: string;
  role: "user" | "controller" | "function" | "assistant";
  content: {
    user_input?: string;
    file_inputs?: string[];
    image?: string;
    result?: string;
    answer?: string;
  };
  data?: {
    instruction?: string;
    image_file?: string;
    query?: string;
    text_file?: string;
    numpy_file?: string;
  };
  created_at: string;
  updated_at: string;
  thread: Thread;
  tool?: Tool;
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Tool {
  id: string;
  name: string;
  enabled: false;
  card_url: string;
  created_at: string;
  updated_at: string;
  parameters: {
    name: string;
    type: string;
    description: string;
  }[];
  task_name: string;
  task_description: string;
}

interface Model {
  modelId: string;
  name: string;
  cardURL: string;
}

interface Module {
  moduleName: string;
  description: string;
}

interface Result {
  messageId: string;
  image: string | null;
  text: string;
}

interface querySummaryHistory {
  level: number;
  querySummary: string;
  messageId: string;
  date: string;
  parentMessageId: string | null;
}

interface ChatEditHistory {
  history: {
    messageId: number;
    text: string;
    file: File | undefined;
    createdAt: string;
  }[];
}
