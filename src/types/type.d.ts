interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatInfo {
  message_id: string;
  role: string;
  content: {
    user_input?: string;
    image_input?: string;
    result?: string;
    answer?: string;
  };
  data: {
    image?: string;
    query?: string;
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
  parameters: [{}];
}

interface Model {
  name: string;
  shortDescription: string;
  task: string;
}

interface Module {
  messageId: string;
  moduleName: string;
  models: Model[];
  summary: string;
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
