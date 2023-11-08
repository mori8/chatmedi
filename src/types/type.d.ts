interface Chat {
  threadId: string;
  title: string;
  type: string;
  createdAt: string;
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
  image: string | null
  text: string
}

interface querySummaryHistory {
  level: number;
  querySummary: string;
  messageId: string;
  date: string;
  parentMessageId: string | null;
}

interface ApiKey {
  id: number;
  name: string;
  key: string;
}

interface ChatEditHistory {
  history: {
    messageId: number;
    text: string;
    file: File | undefined;
    createdAt: string;
  }[];
}
